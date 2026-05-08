import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { EXERCISES } from "@/data/exercises";
import { getSplit, warmupFor } from "@/lib/splits";
import { buildGuidance } from "@/lib/loadGuidance";
import type {
  UserProfile,
  WorkoutDay,
  WorkoutExercise,
  Technique,
} from "@/data/types";

const TECHNIQUE_ROTATION: Technique[] = [
  "rest-pause",
  "excentrica-lenta",
  "drop-set",
  "isometria",
  "parciais",
];

function exerciseSlots(duration: number, hasCardio: boolean, cardioMin: number) {
  const remaining = duration - 8 - (hasCardio ? cardioMin : 0);
  return Math.max(4, Math.min(8, Math.floor(remaining / 7)));
}

interface AIPlanDay {
  name: string;
  exercise_ids: string[];
}

interface AIPlanResponse {
  days: AIPlanDay[];
}

export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY ausente" }, { status: 500 });

  const profile = (await req.json()) as UserProfile;
  const split = getSplit(profile.days);

  const catalog = EXERCISES.filter(
    (e) => e.gymType === "ambos" || e.gymType === profile.gymType
  ).map((e) => ({
    id: e.id,
    name: e.name,
    group: e.group,
    isCompound: e.isCompound,
  }));

  const splitSummary = split.map((s, i) => ({
    day: i + 1,
    name: s.name,
    groups: s.groups,
    slots: exerciseSlots(
      profile.duration,
      profile.cardio,
      s.cardioType === "HIIT" ? 10 : 15
    ),
  }));

  const system = `Você é um personal trainer especializado em treinos NO-REPS (1-2 séries efetivas até a falha técnica).
Monte uma semana de treino selecionando exercícios do catálogo fornecido.

REGRAS DE SEGURANÇA E ADEQUAÇÃO (obrigatórias):
- Para usuários com peso ≥ 95kg ou objetivo "perda-peso": EVITE barra fixa, muscle-up, dips em paralelas, exercícios pliométricos de alto impacto. Prefira variações apoiadas (puxador, remada baixa, remada cavalinho).
- Para usuários "iniciante": evite levantamento terra com barra livre, agachamento livre com barra pesada, remada curvada com barra livre. Prefira variações em máquina, halter, ou apoiadas.
- Respeite o sexo declarado, mas NÃO restrinja exercícios por gênero. Coice na polia, elevação de perna em 4 apoios, abdução de quadril são exercícios neutros e podem ser usados para qualquer sexo SE o objetivo for hipertrofia/glúteo. Para homens com objetivo geral de hipertrofia/peito/costas/braço, priorize compostos clássicos (supino, remada, agachamento, desenvolvimento) — NÃO inclua acessórios de glúteo a menos que o split do dia foque em posterior/glúteo.
- Para "perda-peso": maximize compostos multi-articulares e movimentos com maior gasto calórico.
- Para "condicionamento": prefira movimentos dinâmicos com transições rápidas.
- Sempre comece o dia com o exercício composto mais pesado para o grupo principal.
- NÃO repita o mesmo id na mesma semana se houver alternativas.

Saída APENAS em JSON válido, sem markdown, neste formato exato:
{"days":[{"name":"<nome do dia>","exercise_ids":["id1","id2",...]}]}`;

  const user = `Perfil do usuário:
${JSON.stringify(profile)}

Split da semana (use estes nomes e quantidade de slots por dia):
${JSON.stringify(splitSummary)}

Catálogo de exercícios disponíveis (id, name, group, isCompound):
${JSON.stringify(catalog)}

Retorne ${split.length} dias, cada dia com exatamente "slots" exercícios escolhidos do catálogo (use os ids exatos). Cubra todos os grupos do dia.`;

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: user }],
    });

    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Sem JSON na resposta");
    const ai = JSON.parse(jsonMatch[0]) as AIPlanResponse;

    const validIds = new Set(EXERCISES.map((e) => e.id));
    const effectiveSets: 1 | 2 = profile.level === "iniciante" ? 1 : 2;
    const guidance = buildGuidance();

    const days: WorkoutDay[] = split.map((template, dayIdx) => {
      const cardioMin = template.cardioType === "HIIT" ? 10 : 15;
      const aiDay = ai.days[dayIdx];
      const ids = (aiDay?.exercise_ids ?? []).filter((id) => validIds.has(id));

      const exercises: WorkoutExercise[] = ids.map((exerciseId, exIdx) => {
        const ex = EXERCISES.find((e) => e.id === exerciseId)!;
        const technique: Technique =
          ex.defaultTechnique ??
          TECHNIQUE_ROTATION[(dayIdx + exIdx) % TECHNIQUE_ROTATION.length];
        return { exerciseId, effectiveSets, technique, guidance };
      });

      return {
        id: `day-${dayIdx + 1}`,
        name: template.name,
        estimatedMinutes: profile.duration,
        warmup: warmupFor(template),
        exercises,
        cardio: profile.cardio
          ? { type: template.cardioType, minutes: cardioMin }
          : undefined,
        status: "nao-iniciado",
      };
    });

    return NextResponse.json({ days });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha na IA" },
      { status: 502 }
    );
  }
}
