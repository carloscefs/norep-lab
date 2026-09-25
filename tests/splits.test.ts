import { describe, expect, test } from "vitest";
import {
  buildCustomSplit,
  FOCUS_OPTIONS,
  FOCUS_TEMPLATES,
  getSplit,
  getSplitForProfile,
  warmupFor,
  WARMUP_FULL,
  WARMUP_LOWER,
  WARMUP_UPPER,
} from "@/lib/splits";
import { sanitizeCustomSplit } from "@/lib/customSplit";

describe("getSplit", () => {
  test.each([3, 4, 5, 6] as const)("returns %i days for %i training days", (days) => {
    expect(getSplit(days)).toHaveLength(days);
  });
});

describe("buildCustomSplit", () => {
  test("suffixes repeated focuses with A/B/C in order", () => {
    const names = buildCustomSplit(["perna", "braco", "perna", "braco", "perna"]).map(
      (d) => d.name
    );
    expect(names).toEqual(["Perna A", "Braço A", "Perna B", "Braço B", "Perna C"]);
  });

  test("keeps plain name when focus appears once", () => {
    const names = buildCustomSplit(["perna", "superior"]).map((d) => d.name);
    expect(names).toEqual(["Perna", "Superior"]);
  });

  test("does not mutate the focus templates", () => {
    const before = FOCUS_TEMPLATES.perna.name;
    buildCustomSplit(["perna", "perna"]);
    expect(FOCUS_TEMPLATES.perna.name).toBe(before);
  });
});

describe("getSplitForProfile", () => {
  test("uses custom split when consistent with days", () => {
    const split = getSplitForProfile({ days: 3, customSplit: ["perna", "perna", "braco"] });
    expect(split.map((d) => d.name)).toEqual(["Perna A", "Perna B", "Braço"]);
  });

  test("falls back to automatic split when length mismatches", () => {
    const split = getSplitForProfile({ days: 4, customSplit: ["perna"] });
    expect(split.map((d) => d.name)).toEqual(getSplit(4).map((d) => d.name));
  });

  test("falls back to automatic split when customSplit is absent", () => {
    expect(getSplitForProfile({ days: 5 })).toEqual(getSplit(5));
  });
});

describe("warmupFor", () => {
  test("picks lower/upper/full warmup by groups", () => {
    expect(warmupFor(FOCUS_TEMPLATES.perna)).toBe(WARMUP_LOWER);
    expect(warmupFor(FOCUS_TEMPLATES["peito-triceps"])).toBe(WARMUP_UPPER);
    expect(warmupFor(FOCUS_TEMPLATES["full-body"])).toBe(WARMUP_FULL);
  });
});

describe("sanitizeCustomSplit", () => {
  test("accepts a valid list matching training days", () => {
    expect(sanitizeCustomSplit(["perna", "braco"], 2)).toEqual(["perna", "braco"]);
  });

  test("rejects unknown focus, wrong length, empty and non-array", () => {
    expect(sanitizeCustomSplit(["perna", "abs"], 2)).toBeNull();
    expect(sanitizeCustomSplit(["perna"], 2)).toBeNull();
    expect(sanitizeCustomSplit([], 0)).toBeNull();
    expect(sanitizeCustomSplit("perna", 1)).toBeNull();
    expect(sanitizeCustomSplit(null, 3)).toBeNull();
  });

  test("every FOCUS_OPTIONS entry is accepted", () => {
    expect(sanitizeCustomSplit(FOCUS_OPTIONS, FOCUS_OPTIONS.length)).toEqual(FOCUS_OPTIONS);
  });
});
