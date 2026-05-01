import { getPool } from "./client";

const SQL = `
-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  sex VARCHAR(20),
  age INT,
  weight_kg DECIMAL(5,1),
  height_cm INT,
  training_days INT,
  session_duration_min INT,
  level VARCHAR(20),
  goal VARCHAR(30),
  cardio BOOLEAN DEFAULT false,
  gym_type VARCHAR(20) DEFAULT 'moderna',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout plans (generated plan snapshot)
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout sessions (each completed or started workout)
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workout_day_id VARCHAR(50),
  workout_day_name VARCHAR(100),
  date DATE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  duration_seconds INT,
  total_exercises INT DEFAULT 0,
  completed_exercises INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise logs (one row per exercise per session)
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id VARCHAR(100) NOT NULL,
  exercise_name VARCHAR(200),
  muscle_group VARCHAR(50),
  weight_kg DECIMAL(6,2),
  sets_completed INT DEFAULT 1,
  technique VARCHAR(50),
  completed BOOLEAN DEFAULT false,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise history (for PR/RM progression — one row per exercise per day)
CREATE TABLE IF NOT EXISTS exercise_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id VARCHAR(100) NOT NULL,
  exercise_name VARCHAR(200),
  muscle_group VARCHAR(50),
  weight_kg DECIMAL(6,2) NOT NULL,
  date DATE NOT NULL,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id, date)
);

-- Index para queries frequentes
CREATE INDEX IF NOT EXISTS idx_exercise_history_user_exercise ON exercise_history(user_id, exercise_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_session ON exercise_logs(session_id);
`;

async function migrate() {
  const pool = getPool();
  const client = await pool.connect();
  try {
    console.log("Running migrations...");
    await client.query(SQL);
    console.log("✅ Migrations complete");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
