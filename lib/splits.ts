import type { MuscleGroup, TrainingDays } from "@/data/types";

export interface DayTemplate {
  name: string;
  groups: MuscleGroup[];
  cardioType: "HIIT" | "continuo";
}

const FULL_BODY_A: DayTemplate = {
  name: "Full Body A",
  groups: ["peito", "costas", "quadriceps", "ombro", "core"],
  cardioType: "HIIT",
};

const FULL_BODY_B: DayTemplate = {
  name: "Full Body B",
  groups: ["costas", "posterior", "gluteo", "triceps", "biceps", "core"],
  cardioType: "continuo",
};

const FULL_BODY_C: DayTemplate = {
  name: "Full Body C",
  groups: ["peito", "ombro", "quadriceps", "panturrilha", "core"],
  cardioType: "HIIT",
};

const UPPER_A: DayTemplate = {
  name: "Upper A",
  groups: ["peito", "costas", "ombro", "triceps", "biceps"],
  cardioType: "HIIT",
};

const LOWER_A: DayTemplate = {
  name: "Lower A",
  groups: ["quadriceps", "posterior", "gluteo", "panturrilha", "core"],
  cardioType: "continuo",
};

const UPPER_B: DayTemplate = {
  name: "Upper B",
  groups: ["costas", "peito", "ombro", "biceps", "triceps", "trapezio"],
  cardioType: "HIIT",
};

const LOWER_B: DayTemplate = {
  name: "Lower B",
  groups: ["posterior", "gluteo", "quadriceps", "panturrilha", "core"],
  cardioType: "continuo",
};

const PUSH: DayTemplate = {
  name: "Push",
  groups: ["peito", "ombro", "triceps"],
  cardioType: "HIIT",
};

const PULL: DayTemplate = {
  name: "Pull",
  groups: ["costas", "biceps", "trapezio", "antebraco"],
  cardioType: "HIIT",
};

const LEGS: DayTemplate = {
  name: "Legs",
  groups: ["quadriceps", "posterior", "gluteo", "panturrilha"],
  cardioType: "continuo",
};

const PUSH_B: DayTemplate = { ...PUSH, name: "Push B" };
const PULL_B: DayTemplate = { ...PULL, name: "Pull B" };
const LEGS_B: DayTemplate = { ...LEGS, name: "Legs B" };

export function getSplit(days: TrainingDays): DayTemplate[] {
  switch (days) {
    case 3:
      return [FULL_BODY_A, FULL_BODY_B, FULL_BODY_C];
    case 4:
      return [UPPER_A, LOWER_A, UPPER_B, LOWER_B];
    case 5:
      return [PUSH, PULL, LEGS, UPPER_A, LOWER_A];
    case 6:
      return [PUSH, PULL, LEGS, PUSH_B, PULL_B, LEGS_B];
  }
}

export const WARMUP_BY_REGION: Record<"upper" | "lower" | "full", string[]> = {
  upper: [
    "Mobilidade de ombro — 1 min cada lado",
    "Rotação de tronco — 20 reps",
    "Cross over leve — 2x15 sem falha",
    "Flexão de braço — 1x até queimar",
  ],
  lower: [
    "Mobilidade de quadril — 1 min",
    "Agachamento livre sem peso — 2x15",
    "Caminhada com elevação de joelho — 2 min",
    "Glúteo ponte — 2x15",
  ],
  full: [
    "Polichinelo — 2 min",
    "Mobilidade geral (ombro/quadril) — 2 min",
    "Agachamento livre — 1x15",
    "Flexão de braço — 1x até queimar",
  ],
};

export function warmupFor(template: DayTemplate): string[] {
  const hasUpper = template.groups.some((g) =>
    ["peito", "costas", "ombro", "biceps", "triceps", "trapezio"].includes(g)
  );
  const hasLower = template.groups.some((g) =>
    ["quadriceps", "posterior", "gluteo", "panturrilha"].includes(g)
  );
  if (hasUpper && hasLower) return WARMUP_BY_REGION.full;
  if (hasUpper) return WARMUP_BY_REGION.upper;
  return WARMUP_BY_REGION.lower;
}
