import { NextRequest, NextResponse } from "next/server";
import { query } from "@/db/client";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const exerciseId = searchParams.get("exerciseId");

  if (exerciseId) {
    const rows = await query(
      `SELECT weight_kg, date FROM exercise_history
       WHERE user_id = $1 AND exercise_id = $2
       ORDER BY date DESC LIMIT 30`,
      [payload.userId, exerciseId]
    );
    return NextResponse.json({ history: rows });
  }

  // Full progression report
  const rows = await query(
    `SELECT
       eh.exercise_id,
       eh.exercise_name,
       eh.muscle_group,
       json_agg(json_build_object('date', eh.date, 'weight_kg', eh.weight_kg)
         ORDER BY eh.date DESC) as entries,
       MAX(eh.weight_kg) as max_weight,
       (SELECT weight_kg FROM exercise_history
        WHERE user_id = $1 AND exercise_id = eh.exercise_id
        ORDER BY date DESC LIMIT 1) as last_weight
     FROM exercise_history eh
     WHERE eh.user_id = $1
     GROUP BY eh.exercise_id, eh.exercise_name, eh.muscle_group
     ORDER BY eh.muscle_group, eh.exercise_name`,
    [payload.userId]
  );

  const sessions = await query(
    `SELECT date, workout_day_name, duration_seconds, completed_exercises, total_exercises
     FROM workout_sessions
     WHERE user_id = $1
     ORDER BY date DESC
     LIMIT 30`,
    [payload.userId]
  );

  return NextResponse.json({ exercises: rows, sessions });
}
