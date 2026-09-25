import { NextRequest, NextResponse } from "next/server";
import { query } from "@/db/client";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { isAdminUsername, extractYoutubeId } from "@/lib/admin";
import { EXERCISES } from "@/data/exercises";
import { VIDEO_SUGGESTIONS, youtubeWatchUrl } from "@/data/videoSuggestions";

export type VideoStatus = "sugerido" | "confirmado";

export interface ExerciseVideoRow {
  exercise_id: string;
  youtube_url: string;
  video_title: string | null;
  status: VideoStatus;
  updated_at?: string;
}

// Tabela global (não por usuário). Criada sob demanda, idempotente.
let schemaReady: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = query(
      `CREATE TABLE IF NOT EXISTS exercise_videos (
         exercise_id VARCHAR(100) PRIMARY KEY,
         youtube_url TEXT NOT NULL,
         video_title TEXT,
         status VARCHAR(20) NOT NULL DEFAULT 'sugerido',
         updated_by VARCHAR(50),
         updated_at TIMESTAMPTZ DEFAULT NOW()
       )`
    )
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null;
        console.error("[/api/exercise-videos] ensureSchema falhou:", err);
      });
  }
  return schemaReady;
}

const VALID_IDS = new Set(EXERCISES.map((e) => e.id));

/** Sugestões do catálogo para exercícios que ainda não têm linha no banco. */
function suggestionRows(existing: Set<string>): ExerciseVideoRow[] {
  return Object.entries(VIDEO_SUGGESTIONS)
    .filter(([id]) => VALID_IDS.has(id) && !existing.has(id))
    .map(([exercise_id, s]) => ({
      exercise_id,
      youtube_url: youtubeWatchUrl(s.videoId),
      video_title: s.title,
      status: "sugerido" as const,
    }));
}

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    await ensureSchema();
    const rows = await query<ExerciseVideoRow>(
      `SELECT exercise_id, youtube_url, video_title, status, updated_at
       FROM exercise_videos ORDER BY exercise_id`
    );
    const existing = new Set(rows.map((r) => r.exercise_id));
    const videos = [...rows, ...suggestionRows(existing)];
    return NextResponse.json({ videos, isAdmin: isAdminUsername(payload.username) });
  } catch (err) {
    console.error("[/api/exercise-videos] GET:", err);
    return NextResponse.json({ error: "Erro ao carregar vídeos" }, { status: 500 });
  }
}

interface PutBody {
  exercise_id?: unknown;
  youtube_url?: unknown;
  video_title?: unknown;
  status?: unknown;
}

export async function PUT(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!isAdminUsername(payload.username)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = (await req.json()) as PutBody;
  const exerciseId = typeof body.exercise_id === "string" ? body.exercise_id : "";
  if (!VALID_IDS.has(exerciseId)) {
    return NextResponse.json({ error: "Exercício inválido" }, { status: 400 });
  }

  try {
    await ensureSchema();

    // youtube_url vazio/nulo remove o override (volta para o link padrão do catálogo).
    const rawUrl = typeof body.youtube_url === "string" ? body.youtube_url.trim() : "";
    if (!rawUrl) {
      await query("DELETE FROM exercise_videos WHERE exercise_id = $1", [exerciseId]);
      return NextResponse.json({ ok: true, removed: true });
    }

    const videoId = extractYoutubeId(rawUrl);
    if (!videoId) {
      return NextResponse.json({ error: "Link do YouTube inválido" }, { status: 400 });
    }
    const status: VideoStatus = body.status === "sugerido" ? "sugerido" : "confirmado";
    const title = typeof body.video_title === "string" ? body.video_title.slice(0, 300) : null;
    const url = youtubeWatchUrl(videoId);

    await query(
      `INSERT INTO exercise_videos (exercise_id, youtube_url, video_title, status, updated_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (exercise_id) DO UPDATE SET
         youtube_url = $2, video_title = $3, status = $4, updated_by = $5, updated_at = NOW()`,
      [exerciseId, url, title, status, payload.username]
    );
    return NextResponse.json({ ok: true, video: { exercise_id: exerciseId, youtube_url: url, video_title: title, status } });
  } catch (err) {
    console.error("[/api/exercise-videos] PUT:", err);
    return NextResponse.json({ error: "Erro ao salvar vídeo" }, { status: 500 });
  }
}
