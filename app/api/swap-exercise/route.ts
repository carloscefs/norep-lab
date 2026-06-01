import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { EXERCISES } from "@/data/exercises";
import type { UserProfile } from "@/data/types";

// Isoladores de glúteo tradicionalmente femininos — só para sex="feminino".
const FEMALE_ONLY_IDS = new Set(["coice-quadrupede", "abducao-maquina", "abducao-deitar"]);

interface SwapBody {
  exerciseId: string;
  usedIds?: string[];
  profile?: Partial<UserProfile>;
}

interface AISwap {
  exercise_id: string;
  reason?: string;
}

export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { exerciseId, usedIds = [], profile = {} } = (await req.json()) as SwapBody;

  const current = EXERCISES.find((e) => e.id === exerciseId);
  if (!current) {
    return NextResponse.json({ error: "Exercício não encontrado" }, { status: 400 });
  }

  const used = new Set(usedIds);
  const gymType = profile.gymType;
  const isMale = profile.sex === "masculino";

  // Candidatos: mesmo grupo, compatível com a academia, ainda não usados no dia,
  // respeitando a restrição de gênero.
  const candidates = EXERCISES.filter((e) => {
    if (e.id === current.id || used.has(e.id)) return false;
    if (e.group !== current.group) return false;
    if (gymType && e.gymType !== "ambos" && e.gymType !== gymType) return false;
    if (isMale && FEMALE_ONLY_IDS.has(e.id)) return false;
    return true;
  });

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "Sem alternativa disponível para esse exercício." },
      { status: 409 }
    );
  }

  // Fallback determinístico: prefere mesma natureza (composto/isolado).
  const fallback =
    candidates.find((c) => c.isCompound === current.isCompound) ?? candidates[0];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ exercise_id: fallback.id, source: "fallback" });
  }

  const system = `Você é um personal trainer aplicando a metodologia NO-REPS do Laércio Refundini.
O usuário quer TROCAR um exercício por outro que trabalhe a MESMA FUNÇÃO (mesmo grupo muscular e padrão de movimento parecido).

Regras:
- Escolha UM exercício da lista de candidatos que melhor substitua o atual.
- Prefira a mesma natureza: se o atual é composto, escolha composto; se é isolado, escolha isolado.
- Respeite o perfil (nível, peso, objetivo, gênero). Para sex="masculino" nunca escolha isoladores de glúteo femininos.
- NÃO escolha um id fora da lista de candidatos.

Responda APENAS JSON válido, sem markdown: {"exercise_id":"<id>","reason":"<motivo curto>"}`;

  const userMsg = `Perfil: ${JSON.stringify({
    sex: profile.sex,
    level: profile.level,
    weight: profile.weight,
    goal: profile.goal,
    gymType: profile.gymType,
  })}

Exercício atual a ser trocado:
${JSON.stringify({
  id: current.id,
  name: current.name,
  group: current.group,
  isCompound: current.isCompound,
})}

Candidatos (escolha exatamente um id):
${JSON.stringify(
  candidates.map((c) => ({
    id: c.id,
    name: c.name,
    isCompound: c.isCompound,
  }))
)}`;

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 200,
      system,
      messages: [{ role: "user", content: userMsg }],
    });

    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Sem JSON na resposta");
    const ai = JSON.parse(jsonMatch[0]) as AISwap;

    const chosen = candidates.find((c) => c.id === ai.exercise_id);
    if (!chosen) throw new Error("Id inválido retornado pela IA");

    return NextResponse.json({ exercise_id: chosen.id, reason: ai.reason ?? null });
  } catch {
    // IA falhou — usa o fallback determinístico.
    return NextResponse.json({ exercise_id: fallback.id, source: "fallback" });
  }
}
