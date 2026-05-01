"use client";

import { useEffect, useState } from "react";
import { COACH_QUOTES } from "@/lib/coachQuotes";

export function useCoachQuote(intervalMs = 20000): string {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setIdx((i) => (i + 1) % COACH_QUOTES.length),
      intervalMs
    );
    return () => clearInterval(id);
  }, [intervalMs]);
  return COACH_QUOTES[idx];
}
