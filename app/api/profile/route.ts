import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/db/client";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

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
    session_duration_min, level, goal, cardio, gym_type,
  } = body;

  await query(
    `INSERT INTO user_profiles
      (user_id, sex, age, weight_kg, height_cm, training_days, session_duration_min, level, goal, cardio, gym_type, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
     ON CONFLICT (user_id) DO UPDATE SET
      sex=$2, age=$3, weight_kg=$4, height_cm=$5, training_days=$6,
      session_duration_min=$7, level=$8, goal=$9, cardio=$10, gym_type=$11, updated_at=NOW()`,
    [payload.userId, sex, age, weight_kg, height_cm, training_days,
     session_duration_min, level, goal, cardio, gym_type ?? "moderna"]
  );

  return NextResponse.json({ ok: true });
}
