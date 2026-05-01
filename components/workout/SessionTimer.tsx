"use client";

import { useTimer } from "@/hooks/useTimer";
import { formatDuration } from "@/lib/format";

interface Props {
  startedAt: number | null;
}

export function SessionTimer({ startedAt }: Props) {
  const seconds = useTimer(startedAt);
  return (
    <div className="flex flex-col items-end leading-none">
      <span className="text-[10px] uppercase tracking-widest text-muted">
        Tempo
      </span>
      <span className="font-display text-3xl tabular-nums text-accent">
        {formatDuration(seconds)}
      </span>
    </div>
  );
}
