"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserProfile } from "@/data/types";

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clear: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clear: () => set({ profile: null }),
    }),
    {
      name: "norep-user",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
