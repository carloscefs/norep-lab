"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ActiveSession } from "@/data/types";

interface SessionState {
  session: ActiveSession | null;
  startSession: (dayId: string) => void;
  toggleExercise: (exerciseId: string) => void;
  setWeight: (exerciseId: string, weight: number) => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      startSession: (dayId) =>
        set((s) => {
          if (s.session && s.session.dayId === dayId) return s;
          return {
            session: {
              dayId,
              startedAt: Date.now(),
              completedExerciseIds: [],
              weightOverrides: {},
            },
          };
        }),
      toggleExercise: (exerciseId) =>
        set((s) => {
          if (!s.session) return s;
          const done = s.session.completedExerciseIds.includes(exerciseId);
          return {
            session: {
              ...s.session,
              completedExerciseIds: done
                ? s.session.completedExerciseIds.filter((id) => id !== exerciseId)
                : [...s.session.completedExerciseIds, exerciseId],
            },
          };
        }),
      setWeight: (exerciseId, weight) =>
        set((s) => {
          if (!s.session) return s;
          return {
            session: {
              ...s.session,
              weightOverrides: {
                ...s.session.weightOverrides,
                [exerciseId]: weight,
              },
            },
          };
        }),
      endSession: () => set({ session: null }),
    }),
    {
      name: "norep-session",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
