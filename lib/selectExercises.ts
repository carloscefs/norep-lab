import { EXERCISES } from "@/data/exercises";
import type { Exercise, MuscleGroup } from "@/data/types";

export function pickExercisesForGroups(
  groups: MuscleGroup[],
  totalSlots: number,
  rngSeed: number
): Exercise[] {
  const perGroup = Math.max(1, Math.floor(totalSlots / groups.length));
  const result: Exercise[] = [];

  groups.forEach((group, groupIdx) => {
    const pool = EXERCISES.filter((e) => e.group === group);
    const compounds = pool.filter((e) => e.isCompound);
    const isolators = pool.filter((e) => !e.isCompound);
    const ordered = [...compounds, ...isolators];

    const offset = (rngSeed + groupIdx) % Math.max(1, ordered.length);
    for (let i = 0; i < perGroup && i < ordered.length; i++) {
      const ex = ordered[(i + offset) % ordered.length];
      if (!result.find((r) => r.id === ex.id)) {
        result.push(ex);
      }
    }
  });

  // Fill remaining slots with extra compounds from listed groups
  let extraIdx = 0;
  while (result.length < totalSlots) {
    const group = groups[extraIdx % groups.length];
    const pool = EXERCISES.filter((e) => e.group === group && !result.find((r) => r.id === e.id));
    if (pool.length === 0) {
      extraIdx++;
      if (extraIdx > groups.length * 3) break;
      continue;
    }
    result.push(pool[0]);
    extraIdx++;
  }

  return result.slice(0, totalSlots);
}
