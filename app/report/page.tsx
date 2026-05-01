"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore, apiFetch } from "@/stores/authStore";
import { formatDuration } from "@/lib/format";

interface SessionRow {
  workout_day_name: string;
  duration_seconds: number;
  completed_exercises: number;
  total_exercises: number;
  date: string;
}

interface ExerciseRow {
  exercise_id: string;
  exercise_name: string;
  muscle_group: string;
  max_weight: number;
  last_weight: number;
  entries: { date: string; weight_kg: number }[];
}

interface HistoryData {
  sessions: SessionRow[];
  exercises: ExerciseRow[];
}

export default function ReportPage() {
  const { hydrated } = useRequireAuth();
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !token) {
      setLoading(false);
      return;
    }
    apiFetch<HistoryData>("/api/history", {}, token).then((res) => {
      if (res.error) setError(res.error);
      else if (res.data) setData(res.data);
      setLoading(false);
    });
  }, [hydrated, token]);

  return (
    <div className="min-h-screen pb-10">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/95 px-5 py-4 backdrop-blur safe-top">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-widest text-muted active:text-white"
          >
            ← Painel
          </Link>
          <span className="font-display text-xl tracking-wide text-accent">
            Evolução
          </span>
        </div>
      </header>

      <main className="space-y-6 px-5 pt-6">
        {loading && (
          <p className="text-center text-muted text-sm py-10">Carregando...</p>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            <section>
              <h2 className="font-display text-2xl tracking-wide text-white mb-3">
                Sessões recentes
              </h2>
              {data.sessions.length === 0 ? (
                <div className="rounded-2xl border border-border bg-bg-elevated p-6 text-center">
                  <p className="text-muted text-sm">Nenhuma sessão registrada ainda.</p>
                  <p className="mt-1 text-xs text-muted">Conclua um treino para ver seu histórico aqui.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.sessions.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border bg-bg-elevated p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xl tracking-wide text-white">
                          {s.workout_day_name}
                        </span>
                        <span className="text-xs text-muted">
                          {new Date(s.date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-4 text-sm text-white/70">
                        <span>⏱ {formatDuration(s.duration_seconds)}</span>
                        <span>✓ {s.completed_exercises}/{s.total_exercises} exercícios</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-wide text-white mb-3">
                Progressão de cargas
              </h2>
              {data.exercises.length === 0 ? (
                <div className="rounded-2xl border border-border bg-bg-elevated p-6 text-center">
                  <p className="text-muted text-sm">Nenhuma carga registrada ainda.</p>
                  <p className="mt-1 text-xs text-muted">Registre o peso nos exercícios durante o treino.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.exercises.map((ex) => (
                    <div
                      key={ex.exercise_id}
                      className="rounded-2xl border border-border bg-bg-elevated p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-white text-sm font-medium">{ex.exercise_name}</span>
                          <span className="ml-2 text-xs text-muted uppercase tracking-wide">{ex.muscle_group}</span>
                        </div>
                        <span className="text-accent font-display text-xl tracking-wide">
                          {ex.max_weight} kg
                        </span>
                      </div>
                      <div className="mt-1 flex gap-3 text-xs text-muted">
                        <span>{ex.entries.length} registros</span>
                        <span>último: {new Date(ex.entries[0]?.date ?? "").toLocaleDateString("pt-BR")}</span>
                        {ex.last_weight < ex.max_weight && (
                          <span className="text-yellow-400">↓ atual {ex.last_weight} kg</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
