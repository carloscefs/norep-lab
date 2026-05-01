"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDuration } from "@/lib/format";
import { Button } from "@/components/ui/Button";

interface Props {
  totalSeconds: number;
  completedCount: number;
  totalCount: number;
  dayName: string;
}

export function ResultSummary({
  totalSeconds,
  completedCount,
  totalCount,
  dayName,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-6 px-5 pt-12 safe-bottom"
    >
      <div className="text-center">
        <div className="mb-2 text-xs uppercase tracking-widest text-success">
          Treino concluído
        </div>
        <h1 className="font-display text-5xl tracking-wide text-white">
          {dayName}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-bg-elevated p-5">
          <div className="text-xs uppercase tracking-wider text-muted">
            Tempo total
          </div>
          <div className="mt-1 font-display text-3xl tabular-nums text-white">
            {formatDuration(totalSeconds)}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-elevated p-5">
          <div className="text-xs uppercase tracking-wider text-muted">
            Exercícios
          </div>
          <div className="mt-1 font-display text-3xl text-white">
            {completedCount}<span className="text-muted">/{totalCount}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-accent/40 bg-accent/5 p-5 text-center">
        <p className="font-display text-2xl leading-tight tracking-wide text-white">
          “Intensidade define resultado.”
        </p>
      </div>

      <Link href="/dashboard">
        <Button variant="primary" fullWidth>
          Voltar ao painel
        </Button>
      </Link>
    </motion.div>
  );
}
