"use client";

import { useState } from "react";
import { apiFetch } from "@/stores/authStore";
import type { Exercise } from "@/data/types";
import { cn } from "@/lib/format";

export interface VideoEntry {
  exercise_id: string;
  youtube_url: string;
  video_title: string | null;
  status: "sugerido" | "confirmado";
}

interface Props {
  exercise: Exercise;
  entry: VideoEntry | null;
  token: string;
  onSaved: (entry: VideoEntry | null) => void;
}

export function VideoRow({ exercise, entry, token, onSaved }: Props) {
  const [url, setUrl] = useState(entry?.youtube_url ?? "");
  const [title, setTitle] = useState(entry?.video_title ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveLink = entry?.youtube_url ?? exercise.youtubeUrl ?? null;
  const dirty = url.trim() !== (entry?.youtube_url ?? "") || title.trim() !== (entry?.video_title ?? "");

  const save = async (status: VideoEntry["status"]) => {
    setSaving(true);
    setError(null);
    const res = await apiFetch<{ ok: boolean; removed?: boolean; video?: VideoEntry }>(
      "/api/exercise-videos",
      {
        method: "PUT",
        body: JSON.stringify({
          exercise_id: exercise.id,
          youtube_url: url.trim(),
          video_title: title.trim() || null,
          status,
        }),
      },
      token
    );
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data?.removed) {
      setUrl("");
      setTitle("");
      onSaved(null);
      return;
    }
    if (res.data?.video) {
      setUrl(res.data.video.youtube_url);
      onSaved(res.data.video);
    }
  };

  const badge =
    entry?.status === "confirmado"
      ? { text: "confirmado", cls: "bg-success/15 text-success" }
      : entry?.status === "sugerido"
        ? { text: "sugerido", cls: "bg-accent/15 text-accent" }
        : { text: "sem vídeo", cls: "bg-bg-card text-muted" };

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg tracking-wide text-white">{exercise.name}</h3>
          {entry?.video_title && (
            <p className="truncate text-xs text-white/70" title={entry.video_title}>
              {entry.video_title}
            </p>
          )}
        </div>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider", badge.cls)}>
          {badge.text}
        </span>
      </div>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          aria-label={`Link do vídeo de ${exercise.name}`}
          className="h-10 flex-1 rounded-xl border border-border bg-bg-card px-3 text-sm text-white focus:border-accent focus:outline-none"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título (opcional)"
          aria-label={`Título do vídeo de ${exercise.name}`}
          className="h-10 rounded-xl border border-border bg-bg-card px-3 text-sm text-white focus:border-accent focus:outline-none sm:w-56"
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {effectiveLink && (
          <a
            href={effectiveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-400"
          >
            ▶ Abrir atual
          </a>
        )}
        {url.trim() && (
          <button
            type="button"
            disabled={saving || (!dirty && entry?.status === "confirmado")}
            onClick={() => save("confirmado")}
            className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
          >
            {saving ? "Salvando…" : entry?.status === "sugerido" && !dirty ? "Confirmar sugestão" : "Salvar"}
          </button>
        )}
        {entry && (
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setUrl("");
              setTitle("");
              void (async () => {
                setSaving(true);
                setError(null);
                const res = await apiFetch("/api/exercise-videos", {
                  method: "PUT",
                  body: JSON.stringify({ exercise_id: exercise.id, youtube_url: "" }),
                }, token);
                setSaving(false);
                if (res.error) setError(res.error);
                else onSaved(null);
              })();
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted"
          >
            Remover
          </button>
        )}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </div>
  );
}
