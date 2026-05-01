"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore, apiFetch } from "@/stores/authStore";
import { formatDuration } from "@/lib/format";

interface SessionRow {
  id: number;
  day_name: string;
  duration_seconds: number;
  completed_exercises: number;
  total_exercises: number;
  created_at: string;
}

interface ExerciseProgress {
  exercise_id: string;
  max_weight: number;
  sessions_count: number;
  last_date: string;
}

interface HistoryData {
  sessions: SessionRow[];
  progress: ExerciseProgress[];
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
        {!token && (
          <div className="rounded-2xl border border-border bg-bg-elevated p-6 text-center">
            <p className="text-white/70 text-sm">
              Faça login para ver seu histórico de treinos.
            </p>
            <Link
              href="/dashboard"
              className="mt-3 block text-accent text-sm underline"
            >
              Ir ao painel
            </Link>
          </div>
        )}

        {loading && token && (
          <p className="text-center text-muted text-sm py-10">Carregando...</p>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {data && (
          <>
            <section>
              <h2 className="font-display text-2xl tracking-wide text-white mb-3">
                Sessões recentes
              </h2>
              {data.sessions.length === 0 ? (
                <p className="text-muted text-sm">Nenhuma sessão ainda.</p>
              ) : (
                <div className="space-y-3">
                  {data.sessions.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-border bg-bg-elevated p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xl tracking-wide text-white">
                          {s.day_name}
                        </span>
                        <span className="text-xs text-muted">
                          {new Date(s.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-4 text-sm text-white/70">
                        <span>⏱ {formatDuration(s.duration_seconds)}</span>
                        <span>
                          ✓ {s.completed_exercises}/{s.total_exercises} exercícios
                        </span>
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
              {data.progress.length === 0 ? (
                <p className="text-muted text-sm">
                  Nenhum registro de carga ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.progress.map((p) => (
                    <div
                      key={p.exercise_id}
                      className="rounded-2xl border border-border bg-bg-elevated p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">
                          {p.exercise_id}
                        </span>
                        <span className="text-accent font-display text-xl tracking-wide">
                          {p.max_weight} kg
                        </span>
                      </div>
                      <div className="mt-1 flex gap-3 text-xs text-muted">
                        <span>{p.sessions_count} sessões</span>
                        <span>
                          último:{" "}
                          {new Date(p.last_date).toLocaleDateString("pt-BR")}
                        </span>
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
