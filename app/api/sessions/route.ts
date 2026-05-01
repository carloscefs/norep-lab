import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/db/client";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const sessions = await query(
    `SELECT ws.*,
      json_agg(el ORDER BY el.logged_at) FILTER (WHERE el.id IS NOT NULL) as exercises
     FROM workout_sessions ws
     LEFT JOIN exercise_logs el ON el.session_id = ws.id
     WHERE ws.user_id = $1
     GROUP BY ws.id
     ORDER BY ws.date DESC
     LIMIT 60`,
    [payload.userId]
  );
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const {
    workout_day_id, workout_day_name, date,
    started_at, finished_at, duration_seconds,
    total_exercises, completed_exercises, exercises,
  } = body;

  const session = await queryOne<{ id: string }>(
    `INSERT INTO workout_sessions
       (user_id, workout_day_id, workout_day_name, date, started_at, finished_at,
        duration_seconds, total_exercises, completed_exercises)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    [payload.userId, workout_day_id, workout_day_name, date,
     started_at, finished_at, duration_seconds,
     total_exercises ?? 0, completed_exercises ?? 0]
  );

  if (session && exercises?.length) {
    for (const ex of exercises) {
      await query(
        `INSERT INTO exercise_logs
           (session_id, user_id, exercise_id, exercise_name, muscle_group,
            weight_kg, sets_completed, technique, completed)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [session.id, payload.userId, ex.exercise_id, ex.exercise_name,
         ex.muscle_group, ex.weight_kg ?? null, ex.sets_completed ?? 1,
         ex.technique ?? null, ex.completed ?? false]
      );

      if (ex.completed && ex.weight_kg > 0) {
        await query(
          `INSERT INTO exercise_history
             (user_id, exercise_id, exercise_name, muscle_group, weight_kg, date, session_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (user_id, exercise_id, date)
           DO UPDATE SET weight_kg=$5, session_id=$7`,
          [payload.userId, ex.exercise_id, ex.exercise_name,
           ex.muscle_group, ex.weight_kg, date, session.id]
        );
      }
    }
  }

  return NextResponse.json({ sessionId: session?.id });
}
