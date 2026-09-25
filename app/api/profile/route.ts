import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/db/client";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { sanitizeCustomSplit } from "@/lib/customSplit";

// Garante a coluna custom_split sem depender de migração manual (idempotente, 1x por instância).
let schemaReady: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    // DO-block tolera a corrida entre instâncias concorrentes (duplicate_column).
    schemaReady = query(
      `DO $$ BEGIN
         ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS custom_split JSONB;
       EXCEPTION WHEN duplicate_column THEN NULL;
       END $$`
    )
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null;
        console.error("[/api/profile] ensureSchema falhou:", err);
      });
  }
  return schemaReady;
}


export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  await ensureSchema();
  const profile = await queryOne(
    "SELECT * FROM user_profiles WHERE user_id = $1",
    [payload.userId]
  );
  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const {
    sex, age, weight_kg, height_cm, training_days,
    session_duration_min, level, goal, cardio, gym_type, custom_split,
  } = body;
  const customSplit = sanitizeCustomSplit(custom_split, training_days);

  await ensureSchema();
  await query(
    `INSERT INTO user_profiles
      (user_id, sex, age, weight_kg, height_cm, training_days, session_duration_min, level, goal, cardio, gym_type, custom_split, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
     ON CONFLICT (user_id) DO UPDATE SET
      sex=$2, age=$3, weight_kg=$4, height_cm=$5, training_days=$6,
      session_duration_min=$7, level=$8, goal=$9, cardio=$10, gym_type=$11,
      custom_split=$12, updated_at=NOW()`,
    [payload.userId, sex, age, weight_kg, height_cm, training_days,
     session_duration_min, level, goal, cardio, gym_type ?? "moderna",
     customSplit ? JSON.stringify(customSplit) : null]
  );

  return NextResponse.json({ ok: true });
}
