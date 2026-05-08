"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserProfile } from "@/data/types";
import { apiFetch } from "./authStore";

interface ProfileRow {
  sex: UserProfile["sex"];
  age: number;
  weight_kg: string | number;
  height_cm: number;
  training_days: number;
  session_duration_min: number;
  level: UserProfile["level"];
  goal: UserProfile["goal"];
  cardio: boolean;
  gym_type: UserProfile["gymType"];
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    sex: row.sex,
    age: row.age,
    weight: typeof row.weight_kg === "string" ? parseFloat(row.weight_kg) : row.weight_kg,
    height: row.height_cm,
    days: row.training_days as UserProfile["days"],
    duration: row.session_duration_min as UserProfile["duration"],
    level: row.level,
    goal: row.goal,
    cardio: row.cardio,
    gymType: row.gym_type,
  };
}

function profileToBody(p: UserProfile) {
  return {
    sex: p.sex,
    age: p.age,
    weight_kg: p.weight,
    height_cm: p.height,
    training_days: p.days,
    session_duration_min: p.duration,
    level: p.level,
    goal: p.goal,
    cardio: p.cardio,
    gym_type: p.gymType,
  };
}

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile, token?: string | null) => void;
  hydrateFromServer: (token: string) => Promise<UserProfile | null>;
  clear: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile, token) => {
        set({ profile });
        if (token) {
          apiFetch(
            "/api/profile",
            { method: "POST", body: JSON.stringify(profileToBody(profile)) },
            token
          ).catch(() => {});
        }
      },
      hydrateFromServer: async (token) => {
        const res = await apiFetch<{ profile: ProfileRow | null }>(
          "/api/profile",
          {},
          token
        );
        if (res.data?.profile) {
          const profile = rowToProfile(res.data.profile);
          set({ profile });
          return profile;
        }
        return null;
      },
      clear: () => set({ profile: null }),
    }),
    {
      name: "norep-user",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
