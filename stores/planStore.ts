"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WorkoutDay, WorkoutStatus } from "@/data/types";

interface PlanState {
  days: WorkoutDay[];
  setPlan: (days: WorkoutDay[]) => void;
  setStatus: (dayId: string, status: WorkoutStatus) => void;
  reset: () => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      days: [],
      setPlan: (days) => set({ days }),
      setStatus: (dayId, status) =>
        set((s) => ({
          days: s.days.map((d) => (d.id === dayId ? { ...d, status } : d)),
        })),
      reset: () => set({ days: [] }),
    }),
    {
      name: "norep-plan",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
