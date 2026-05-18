"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WorkoutDay, WorkoutStatus } from "@/data/types";
import { apiFetch } from "./authStore";

interface PlanState {
  days: WorkoutDay[];
  setPlan: (days: WorkoutDay[], token?: string | null) => void;
  setStatus: (dayId: string, status: WorkoutStatus, token?: string | null) => void;
  resetWeekStatuses: (token?: string | null) => void;
  hydrateFromServer: (token: string) => Promise<void>;
  reset: () => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      days: [],
      setPlan: (days, token) => {
        set({ days });
        if (token) {
          apiFetch("/api/plan", { method: "POST", body: JSON.stringify({ days }) }, token).catch(() => {});
        }
      },
      setStatus: (dayId, status, token) => {
        set((s) => ({
          days: s.days.map((d) => (d.id === dayId ? { ...d, status } : d)),
        }));
        if (token) {
          apiFetch("/api/plan", { method: "PATCH", body: JSON.stringify({ dayId, status }) }, token).catch(() => {});
        }
      },
      resetWeekStatuses: (token) => {
        let nextDays: WorkoutDay[] = [];
        set((s) => {
          nextDays = s.days.map((d) => ({ ...d, status: "nao-iniciado" as const }));
          return { days: nextDays };
        });
        if (token) {
          apiFetch(
            "/api/plan",
            { method: "POST", body: JSON.stringify({ days: nextDays }) },
            token
          ).catch(() => {});
        }
      },
      hydrateFromServer: async (token) => {
        const res = await apiFetch<{ days: WorkoutDay[] }>("/api/plan", {}, token);
        if (res.data?.days?.length) {
          set({ days: res.data.days });
        }
      },
      reset: () => set({ days: [] }),
    }),
    {
      name: "norep-plan",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
