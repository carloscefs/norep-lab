import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/db/client";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import type { WorkoutDay, WorkoutStatus } from "@/data/types";

interface PlanRow {
  id: string;
  plan_data: { days: WorkoutDay[] };
}

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const row = await queryOne<PlanRow>(
    `SELECT id, plan_data FROM workout_plans
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [payload.userId]
  );
  return NextResponse.json({ days: row?.plan_data?.days ?? [] });
}

export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const days = body.days as WorkoutDay[];
  if (!Array.isArray(days)) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  await query(`DELETE FROM workout_plans WHERE user_id = $1`, [payload.userId]);
  await query(
    `INSERT INTO workout_plans (user_id, plan_data) VALUES ($1, $2)`,
    [payload.userId, { days }]
  );

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const dayId = body.dayId as string;
  const status = body.status as WorkoutStatus;
  if (!dayId || !status) {
    return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
  }

  const row = await queryOne<PlanRow>(
    `SELECT id, plan_data FROM workout_plans
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [payload.userId]
  );
  if (!row) return NextResponse.json({ error: "Sem plano" }, { status: 404 });

  const days = (row.plan_data?.days ?? []).map((d) =>
    d.id === dayId ? { ...d, status } : d
  );

  await query(
    `UPDATE workout_plans SET plan_data = $1 WHERE id = $2`,
    [{ days }, row.id]
  );

  return NextResponse.json({ ok: true });
}
