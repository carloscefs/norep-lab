import type {
  UserProfile,
  WorkoutDay,
  WorkoutExercise,
  Technique,
} from "@/data/types";
import { getSplit, warmupFor } from "./splits";
import { pickExercisesForGroups } from "./selectExercises";
import { buildGuidance } from "./loadGuidance";

const TECHNIQUE_ROTATION: Technique[] = [
  "rest-pause",
  "excentrica-lenta",
  "drop-set",
  "isometria",
  "parciais",
];

function exerciseSlotsForDuration(
  duration: number,
  hasCardio: boolean,
  cardioMin: number
): number {
  const warmup = 8;
  const cardio = hasCardio ? cardioMin : 0;
  const remaining = duration - warmup - cardio;
  const minutesPerExercise = 7;
  const slots = Math.floor(remaining / minutesPerExercise);
  return Math.max(4, Math.min(8, slots));
}

export function generatePlan(profile: UserProfile): WorkoutDay[] {
  const split = getSplit(profile.days);
  const guidance = buildGuidance();
  const effectiveSets: 1 | 2 = profile.level === "iniciante" ? 1 : 2;

  return split.map((template, dayIdx) => {
    const cardioMin = template.cardioType === "HIIT" ? 10 : 15;
    const slots = exerciseSlotsForDuration(
      profile.duration,
      profile.cardio,
      cardioMin
    );

    const picked = pickExercisesForGroups(template.groups, slots, dayIdx, profile.gymType);

    const exercises: WorkoutExercise[] = picked.map((ex, exIdx) => {
      const technique: Technique =
        ex.defaultTechnique ??
        TECHNIQUE_ROTATION[(dayIdx + exIdx) % TECHNIQUE_ROTATION.length];
      return {
        exerciseId: ex.id,
        effectiveSets,
        technique,
        guidance,
      };
    });

    const day: WorkoutDay = {
      id: `day-${dayIdx + 1}`,
      name: template.name,
      estimatedMinutes: profile.duration,
      warmup: warmupFor(template),
      exercises,
      cardio: profile.cardio
        ? { type: template.cardioType, minutes: cardioMin }
        : undefined,
      status: "nao-iniciado",
    };
    return day;
  });
}
