"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Exercise, WorkoutExercise } from "@/data/types";
import { cn } from "@/lib/format";
import { TECHNIQUE_HINT, TECHNIQUE_LABEL } from "@/lib/loadGuidance";

interface Props {
  index: number;
  exercise: Exercise;
  workout: WorkoutExercise;
  done: boolean;
  weight: number | undefined;
  lastWeight?: number;
  onToggle: () => void;
  onWeightChange: (kg: number) => void;
}

export function ExerciseCard({
  index,
  exercise,
  workout,
  done,
  weight,
  lastWeight,
  onToggle,
  onWeightChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleConcluir = () => {
    if (!done) setOpen(false);
    onToggle();
  };

  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl border bg-bg-elevated transition-colors",
        done ? "border-success/60 bg-success/5" : "border-border"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold",
            done
              ? "border-success bg-success text-black"
              : "border-border text-muted"
          )}
        >
          {done ? "✓" : index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-display text-xl tracking-wide text-white">
              {exercise.name}
            </h4>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-bg-card px-2 py-0.5 uppercase tracking-wider text-muted">
              {exercise.group}
            </span>
            {workout.technique && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 uppercase tracking-wider text-accent">
                {TECHNIQUE_LABEL[workout.technique]}
              </span>
            )}
          </div>
        </div>
        <span className="text-muted text-xs">{open ? "−" : "+"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-border px-4 pb-4 pt-4">
              <div className="flex items-start justify-between gap-3">
                <p className="flex-1 text-sm leading-relaxed text-white/85">
                  {exercise.description}
                </p>
                {exercise.youtubeUrl && (
                  <a
                    href={exercise.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-600/30 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ▶ Ver
                  </a>
                )}
              </div>

              {workout.technique && (
                <div className="rounded-xl bg-bg-card p-3 text-sm">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
                    Técnica: {TECHNIQUE_LABEL[workout.technique]}
                  </div>
                  <p className="text-white/80">
                    {TECHNIQUE_HINT[workout.technique]}
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-accent/40 bg-accent/5 p-3 text-sm">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
                  Regra NO-REPS
                </div>
                <p className="text-white/85">
                  {workout.guidance}
                </p>
                <p className="mt-1 text-xs text-muted">
                  <span className="text-sm font-bold text-lime-400">
                    {workout.effectiveSets} série{workout.effectiveSets > 1 ? "s" : ""} efetiva{workout.effectiveSets > 1 ? "s" : ""}
                  </span>{" "}
                  até a falha técnica.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex-1">
                  <span className="mb-1 flex items-center justify-between text-xs uppercase tracking-wider text-muted">
                    <span>Carga (kg)</span>
                    {lastWeight !== undefined && lastWeight > 0 && (
                      <span className="normal-case tracking-normal text-muted/80">
                        última: <span className="text-white/80">{lastWeight} kg</span>
                      </span>
                    )}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={weight ?? ""}
                    onChange={(e) =>
                      onWeightChange(parseFloat(e.target.value) || 0)
                    }
                    placeholder={lastWeight ? String(lastWeight) : "—"}
                    className="h-12 w-full rounded-xl border border-border bg-bg-card px-3 text-lg text-white focus:border-accent focus:outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleConcluir}
                  className={cn(
                    "h-12 self-end rounded-xl px-5 font-display text-lg tracking-wide transition-colors",
                    done
                      ? "bg-success text-black"
                      : "bg-accent text-white active:bg-accent-hover"
                  )}
                >
                  {done ? "✓ Feito" : "Concluir"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
