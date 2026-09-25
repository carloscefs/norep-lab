"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore, apiFetch } from "@/stores/authStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { EXERCISES } from "@/data/exercises";
import type { Exercise, MuscleGroup } from "@/data/types";
import { cn } from "@/lib/format";
import { VideoRow, type VideoEntry } from "@/components/admin/VideoRow";

interface VideosResponse {
  videos: VideoEntry[];
  isAdmin: boolean;
}

const GROUP_ORDER: MuscleGroup[] = [
  "peito", "costas", "ombro", "biceps", "triceps", "antebraco", "trapezio",
  "quadriceps", "posterior", "gluteo", "panturrilha", "core",
];

export default function AdminVideosPage() {
  const router = useRouter();
  const { hydrated, token } = useRequireAuth();
  const username = useAuthStore((s) => s.username);

  const [videos, setVideos] = useState<Record<string, VideoEntry>>({});
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);

  useEffect(() => {
    if (!hydrated || !token) return;
    apiFetch<VideosResponse>("/api/exercise-videos", {}, token).then((res) => {
      if (res.error || !res.data) {
        setLoadError(res.error ?? "Erro ao carregar");
        return;
      }
      setIsAdmin(res.data.isAdmin);
      setVideos(Object.fromEntries(res.data.videos.map((v) => [v.exercise_id, v])));
    });
  }, [hydrated, token]);

  useEffect(() => {
    if (isAdmin === false) router.replace("/dashboard");
  }, [isAdmin, router]);

  const grouped = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = EXERCISES.filter((e) => {
      if (q && !e.name.toLowerCase().includes(q) && !e.id.includes(q)) return false;
      if (onlyPending && videos[e.id]?.status === "confirmado") return false;
      return true;
    });
    return GROUP_ORDER.map((g) => ({ group: g, items: list.filter((e) => e.group === g) })).filter(
      (g) => g.items.length > 0
    );
  }, [filter, onlyPending, videos]);

  const stats = useMemo(() => {
    const all = Object.values(videos);
    return {
      confirmados: all.filter((v) => v.status === "confirmado").length,
      sugeridos: all.filter((v) => v.status === "sugerido").length,
      semVideo: EXERCISES.length - all.length,
    };
  }, [videos]);

  const handleSaved = (exerciseId: string, entry: VideoEntry | null) => {
    setVideos((prev) => {
      if (!entry) {
        const { [exerciseId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [exerciseId]: entry };
    });
  };

  if (!hydrated || !token || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        {loadError ?? "Carregando…"}
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 pb-10 pt-8 safe-top">
      <header className="mb-5">
        <Link href="/dashboard" className="text-xs uppercase tracking-widest text-muted active:text-white">
          ← Painel
        </Link>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-white">Vídeos dos exercícios</h1>
        <p className="mt-1 text-sm text-muted">
          Links do canal @laerciorefundini. Cole um link do YouTube, confirme a sugestão ou
          limpe o campo para voltar ao link de busca padrão. Logado como {username}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-success/15 px-3 py-1 text-success">
            {stats.confirmados} confirmados
          </span>
          <span className="rounded-full bg-accent/15 px-3 py-1 text-accent">
            {stats.sugeridos} sugeridos
          </span>
          <span className="rounded-full bg-bg-card px-3 py-1 text-muted">
            {stats.semVideo} sem vídeo
          </span>
        </div>
      </header>

      <div className="mb-5 flex gap-2">
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar exercício…"
          className="h-11 flex-1 rounded-xl border border-border bg-bg-card px-3 text-sm text-white focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setOnlyPending((v) => !v)}
          className={cn(
            "h-11 rounded-xl border px-3 text-xs uppercase tracking-wider",
            onlyPending ? "border-accent bg-accent text-white" : "border-border bg-bg-elevated text-muted"
          )}
        >
          Só pendentes
        </button>
      </div>

      <div className="space-y-6">
        {grouped.map(({ group, items }) => (
          <section key={group}>
            <h2 className="mb-2 text-xs uppercase tracking-widest text-muted">{group}</h2>
            <div className="space-y-2">
              {items.map((ex: Exercise) => (
                <VideoRow
                  key={ex.id}
                  exercise={ex}
                  entry={videos[ex.id] ?? null}
                  token={token}
                  onSaved={(entry) => handleSaved(ex.id, entry)}
                />
              ))}
            </div>
          </section>
        ))}
        {grouped.length === 0 && (
          <p className="text-sm text-muted">Nenhum exercício encontrado.</p>
        )}
      </div>
    </div>
  );
}
