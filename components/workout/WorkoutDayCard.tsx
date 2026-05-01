"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { WorkoutDay } from "@/data/types";
import { cn } from "@/lib/format";

const STATUS_LABEL: Record<WorkoutDay["status"], string> = {
  "nao-iniciado": "Não iniciado",
  "em-andamento": "Em andamento",
  concluido: "Concluído",
};

const STATUS_STYLE: Record<WorkoutDay["status"], string> = {
  "nao-iniciado": "bg-bg-card text-muted",
  "em-andamento": "bg-accent text-white",
  concluido: "bg-success text-black",
};

interface Props {
  day: WorkoutDay;
  index: number;
}

export function WorkoutDayCard({ day, index }: Props) {
  return (
    <Link href={`/workout/${day.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          "group flex flex-col gap-3 rounded-2xl border border-border bg-bg-elevated p-5",
          "active:bg-bg-card"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-muted">
            Dia {index + 1}
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
              STATUS_STYLE[day.status]
            )}
          >
            {STATUS_LABEL[day.status]}
          </span>
        </div>
        <h3 className="font-display text-3xl leading-none tracking-wide text-white">
          {day.name}
        </h3>
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {day.exercises.length} exercícios{day.cardio ? " + cardio" : ""}
          </span>
          <span>~{day.estimatedMinutes} min</span>
        </div>
      </motion.div>
    </Link>
  );
}
