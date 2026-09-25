import type { DayFocus } from "@/data/types";
import { FOCUS_TEMPLATES } from "./splits";

/** Valida o custom_split vindo do cliente: array de focos conhecidos com length === dias. */
export function sanitizeCustomSplit(
  value: unknown,
  trainingDays: unknown
): DayFocus[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  if (value.length !== trainingDays) return null;
  const valid = value.every(
    (f): f is DayFocus => typeof f === "string" && f in FOCUS_TEMPLATES
  );
  return valid ? value : null;
}
