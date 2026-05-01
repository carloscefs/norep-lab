"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type {
  Goal,
  Level,
  SessionDuration,
  TrainingDays,
} from "@/data/types";

export interface PreferencesDraft {
  days: TrainingDays | null;
  duration: SessionDuration | null;
  level: Level | null;
  goal: Goal | null;
  cardio: boolean | null;
}

interface Props {
  draft: PreferencesDraft;
  onChange: (draft: PreferencesDraft) => void;
}

export function StepPreferences({ draft, onChange }: Props) {
  return (
    <div className="space-y-5">
      <SegmentedControl<TrainingDays>
        label="Dias de treino por semana"
        columns={4}
        value={draft.days}
        onChange={(days) => onChange({ ...draft, days })}
        options={[
          { value: 3, label: "3" },
          { value: 4, label: "4" },
          { value: 5, label: "5" },
          { value: 6, label: "6" },
        ]}
      />

      <SegmentedControl<SessionDuration>
        label="Tempo por treino"
        columns={4}
        value={draft.duration}
        onChange={(duration) => onChange({ ...draft, duration })}
        options={[
          { value: 45, label: "45m" },
          { value: 60, label: "60m" },
          { value: 90, label: "90m" },
          { value: 120, label: "120m" },
        ]}
      />

      <SegmentedControl<Level>
        label="Nível"
        columns={3}
        value={draft.level}
        onChange={(level) => onChange({ ...draft, level })}
        options={[
          { value: "iniciante", label: "Iniciante" },
          { value: "intermediario", label: "Intermed." },
          { value: "avancado", label: "Avançado" },
        ]}
      />

      <SegmentedControl<Goal>
        label="Objetivo"
        columns={2}
        value={draft.goal}
        onChange={(goal) => onChange({ ...draft, goal })}
        options={[
          { value: "hipertrofia", label: "Hipertrofia" },
          { value: "perda-peso", label: "Perda de peso" },
          { value: "recomposicao", label: "Recomposição" },
          { value: "condicionamento", label: "Condicionam." },
        ]}
      />

      <SegmentedControl<"sim" | "nao">
        label="Incluir cardio?"
        columns={2}
        value={draft.cardio === null ? null : draft.cardio ? "sim" : "nao"}
        onChange={(v) => onChange({ ...draft, cardio: v === "sim" })}
        options={[
          { value: "sim", label: "Sim" },
          { value: "nao", label: "Não" },
        ]}
      />
    </div>
  );
}

export function isPreferencesValid(d: PreferencesDraft): boolean {
  return (
    d.days !== null &&
    d.duration !== null &&
    d.level !== null &&
    d.goal !== null &&
    d.cardio !== null
  );
}
