"use client";

import type { CardioBlock as CardioBlockType } from "@/data/types";

interface Props {
  cardio: CardioBlockType;
}

export function CardioBlock({ cardio }: Props) {
  const label = cardio.type === "HIIT" ? "HIIT" : "Contínuo";
  const detail =
    cardio.type === "HIIT"
      ? "30s forte / 30s leve. Mantenha o ritmo cardíaco alto."
      : "Ritmo moderado constante. Não pare antes do tempo.";
  return (
    <section className="rounded-2xl border border-border bg-bg-elevated p-5">
      <header className="mb-3 flex items-center gap-2">
        <span className="text-2xl">❤️</span>
        <h3 className="font-display text-2xl tracking-wide text-white">
          Cardio — {label}
        </h3>
      </header>
      <p className="text-sm text-white/85">
        Tempo sugerido: <strong className="text-accent">{cardio.minutes} min</strong>
      </p>
      <p className="mt-2 text-xs text-muted">{detail}</p>
    </section>
  );
}
