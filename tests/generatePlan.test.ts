import { describe, expect, test } from "vitest";
import { generatePlan } from "@/lib/generatePlan";
import { pickExercisesForGroups } from "@/lib/selectExercises";
import { EXERCISES } from "@/data/exercises";
import type { UserProfile } from "@/data/types";

const baseProfile: UserProfile = {
  sex: "feminino",
  age: 35,
  weight: 60,
  height: 165,
  days: 5,
  duration: 60,
  level: "intermediario",
  goal: "hipertrofia",
  cardio: false,
  gymType: "moderna",
};

describe("generatePlan", () => {
  test("custom split 3x perna + 2x braço yields named A/B/C days with valid exercises", () => {
    const plan = generatePlan({
      ...baseProfile,
      customSplit: ["perna", "braco", "perna", "braco", "perna"],
    });
    expect(plan.map((d) => d.name)).toEqual(["Perna A", "Braço A", "Perna B", "Braço B", "Perna C"]);
    const validIds = new Set(EXERCISES.map((e) => e.id));
    for (const day of plan) {
      expect(day.exercises.length).toBeGreaterThanOrEqual(4);
      for (const ex of day.exercises) expect(validIds.has(ex.exerciseId)).toBe(true);
    }
  });

  test("repeated leg days do not share the exact same exercise list", () => {
    const plan = generatePlan({ ...baseProfile, customSplit: ["perna", "perna", "perna", "braco", "braco"] });
    const lists = plan.slice(0, 3).map((d) => d.exercises.map((e) => e.exerciseId).join(","));
    expect(new Set(lists).size).toBeGreaterThan(1);
  });

  test("beginner gets 2 effective sets, others get 3", () => {
    expect(generatePlan({ ...baseProfile, level: "iniciante" })[0].exercises[0].effectiveSets).toBe(2);
    expect(generatePlan(baseProfile)[0].exercises[0].effectiveSets).toBe(3);
  });

  test("cardio block only when profile.cardio is true", () => {
    expect(generatePlan(baseProfile)[0].cardio).toBeUndefined();
    expect(generatePlan({ ...baseProfile, cardio: true })[0].cardio).toBeDefined();
  });
});

describe("pickExercisesForGroups", () => {
  test("respects gym type and returns unique ids up to the slot count", () => {
    const picked = pickExercisesForGroups(["quadriceps", "posterior"], 6, 0, "raiz");
    expect(picked.length).toBeLessThanOrEqual(6);
    expect(new Set(picked.map((e) => e.id)).size).toBe(picked.length);
    for (const e of picked) expect(["ambos", "raiz"]).toContain(e.gymType);
  });
});
