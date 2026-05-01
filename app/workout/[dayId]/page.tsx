"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePlanStore } from "@/stores/planStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useHydrated } from "@/hooks/useHydrated";
import { getExercise } from "@/data/exercises";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { WarmupBlock } from "@/components/workout/WarmupBlock";
import { CardioBlock } from "@/components/workout/CardioBlock";
import { SessionTimer } from "@/components/workout/SessionTimer";
import { CoachQuote } from "@/components/workout/CoachQuote";
import { ResultSummary } from "@/components/result/ResultSummary";
import { Button } from "@/components/ui/Button";

export default function WorkoutPage() {
  const params = useParams<{ dayId: string }>();
  const router = useRouter();
  const hydrated = useHydrated();

  const days = usePlanStore((s) => s.days);
  const setStatus = usePlanStore((s) => s.setStatus);
  const session = useSessionStore((s) => s.session);
  const startSession = useSessionStore((s) => s.startSession);
  const toggleExercise = useSessionStore((s) => s.toggleExercise);
  const setWeight = useSessionStore((s) => s.setWeight);
  const endSession = useSessionStore((s) => s.endSession);

  const day = useMemo(
    () => days.find((d) => d.id === params.dayId),
    [days, params.dayId]
  );

  const [finished, setFinished] = useState(false);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [finalCompleted, setFinalCompleted] = useState(0);

  useEffect(() => {
    if (!hydrated) return;
    if (!day) {
      router.replace("/dashboard");
      return;
    }
    if (day.status !== "concluido") {
      startSession(day.id);
      if (day.status === "nao-iniciado") {
        setStatus(day.id, "em-andamento");
      }
    }
  }, [hydrated, day, startSession, setStatus, router]);

  if (!hydrated || !day) return null;

  const activeSession = session?.dayId === day.id ? session : null;
  const completedIds = activeSession?.completedExerciseIds ?? [];
  const weights = activeSession?.weightOverrides ?? {};

  const handleFinish = () => {
    if (!activeSession) return;
    const seconds = Math.floor((Date.now() - activeSession.startedAt) / 1000);
    setFinalSeconds(seconds);
    setFinalCompleted(completedIds.length);
    setStatus(day.id, "concluido");
    endSession();
    setFinished(true);
  };

  if (finished) {
    return (
      <ResultSummary
        totalSeconds={finalSeconds}
        completedCount={finalCompleted}
        totalCount={day.exercises.length}
        dayName={day.name}
      />
    );
  }

  const total = day.exercises.length;
  const doneCount = completedIds.length;

  return (
    <div className="flex min-h-screen flex-col pb-32">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/95 px-5 py-3 backdrop-blur safe-top">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-widest text-muted active:text-white"
          >
            ← Painel
          </Link>
          <SessionTimer startedAt={activeSession?.startedAt ?? null} />
        </div>
        <div className="mt-1 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl leading-none tracking-wide text-white">
              {day.name}
            </h1>
            <p className="mt-1 text-xs text-muted">
              {doneCount}/{total} exercícios
            </p>
          </div>
          <Button
            variant="success"
            onClick={handleFinish}
            className="h-11 px-4 text-sm"
          >
            Finalizar
          </Button>
        </div>
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        <WarmupBlock items={day.warmup} />

        <section className="space-y-3">
          <header className="flex items-center gap-2 px-1">
            <span className="text-xl">🏋️</span>
            <h3 className="font-display text-2xl tracking-wide text-white">
              Treino principal
            </h3>
          </header>

          {day.exercises.map((we, i) => {
            const ex = getExercise(we.exerciseId);
            if (!ex) return null;
            return (
              <ExerciseCard
                key={we.exerciseId}
                index={i}
                exercise={ex}
                workout={we}
                done={completedIds.includes(we.exerciseId)}
                weight={weights[we.exerciseId]}
                onToggle={() => toggleExercise(we.exerciseId)}
                onWeightChange={(kg) => setWeight(we.exerciseId, kg)}
              />
            );
          })}
        </section>

        {day.cardio && <CardioBlock cardio={day.cardio} />}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md px-5 pb-4 safe-bottom">
        <CoachQuote />
      </div>
    </div>
  );
}
