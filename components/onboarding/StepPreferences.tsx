"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { FOCUS_LABEL, FOCUS_OPTIONS } from "@/lib/splits";
import type {
  DayFocus,
  Goal,
  GymType,
  Level,
  SessionDuration,
  TrainingDays,
} from "@/data/types";

export type SplitMode = "auto" | "custom";

export interface PreferencesDraft {
  days: TrainingDays | null;
  splitMode: SplitMode;
  /** Um foco por dia quando splitMode === "custom". */
  customSplit: (DayFocus | null)[];
  duration: SessionDuration | null;
  level: Level | null;
  goal: Goal | null;
  cardio: boolean | null;
  gymType: GymType | null;
}

interface Props {
  draft: PreferencesDraft;
  onChange: (draft: PreferencesDraft) => void;
}

/** Ajusta o array de focos ao número de dias, preservando o que já foi escolhido. */
function resizeSplit(current: (DayFocus | null)[], days: number): (DayFocus | null)[] {
  return Array.from({ length: days }, (_, i) => current[i] ?? null);
}

function CustomSplitEditor({ draft, onChange }: Props) {
  const days = draft.days ?? 0;
  const focuses = resizeSplit(draft.customSplit, days);
  if (days === 0) {
    return (
      <p className="text-sm text-muted">Escolha primeiro quantos dias por semana.</p>
    );
  }
  return (
    <div className="space-y-2">
      {focuses.map((focus, i) => (
        <label
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border bg-bg-elevated px-3"
        >
          <span className="w-14 shrink-0 text-xs uppercase tracking-wider text-muted">
            Dia {i + 1}
          </span>
          <select
            value={focus ?? ""}
            onChange={(e) => {
              const next = [...focuses];
              next[i] = (e.target.value || null) as DayFocus | null;
              onChange({ ...draft, customSplit: next });
            }}
            className="h-12 flex-1 bg-transparent text-base font-semibold text-white focus:outline-none"
          >
            <option value="" className="bg-bg-elevated">
              Escolher foco…
            </option>
            {FOCUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-bg-elevated">
                {FOCUS_LABEL[opt]}
              </option>
            ))}
          </select>
        </label>
      ))}
      <p className="text-xs text-muted">
        Pode repetir o mesmo foco (ex.: 3x Perna + 2x Braço). Os dias repetidos
        ganham variações A/B/C com exercícios diferentes.
      </p>
    </div>
  );
}

export function StepPreferences({ draft, onChange }: Props) {
  return (
    <div className="space-y-5">
      <SegmentedControl<GymType>
        label="Tipo de academia"
        columns={2}
        value={draft.gymType}
        onChange={(gymType) => onChange({ ...draft, gymType })}
        options={[
          { value: "moderna", label: "Moderna 🏋️" },
          { value: "raiz", label: "Raiz 💪" },
        ]}
      />

      <SegmentedControl<TrainingDays>
        label="Dias de treino por semana"
        columns={4}
        value={draft.days}
        onChange={(days) =>
          onChange({ ...draft, days, customSplit: resizeSplit(draft.customSplit, days) })
        }
        options={[
          { value: 3, label: "3" },
          { value: 4, label: "4" },
          { value: 5, label: "5" },
          { value: 6, label: "6" },
        ]}
      />

      <SegmentedControl<SplitMode>
        label="Divisão da semana"
        columns={2}
        value={draft.splitMode}
        onChange={(splitMode) => onChange({ ...draft, splitMode })}
        options={[
          { value: "auto", label: "Automática" },
          { value: "custom", label: "Personalizada" },
        ]}
      />

      {draft.splitMode === "custom" && (
        <CustomSplitEditor draft={draft} onChange={onChange} />
      )}

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

function isCustomSplitValid(d: PreferencesDraft): boolean {
  if (d.splitMode !== "custom") return true;
  if (d.days === null) return false;
  const focuses = resizeSplit(d.customSplit, d.days);
  return focuses.every((f) => f !== null);
}

export function isPreferencesValid(d: PreferencesDraft): boolean {
  return (
    isCustomSplitValid(d) &&
    d.days !== null &&
    d.duration !== null &&
    d.level !== null &&
    d.goal !== null &&
    d.cardio !== null &&
    d.gymType !== null
  );
}
