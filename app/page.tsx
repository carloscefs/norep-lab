"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { usePlanStore } from "@/stores/planStore";
import { useHydrated } from "@/hooks/useHydrated";

export default function Home() {
  const router = useRouter();
  const hydrated = useHydrated();
  const profile = useUserStore((s) => s.profile);
  const days = usePlanStore((s) => s.days);

  useEffect(() => {
    if (!hydrated) return;
    if (profile && days.length > 0) {
      router.replace("/dashboard");
    } else {
      router.replace("/onboarding");
    }
  }, [hydrated, profile, days, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="font-display text-4xl tracking-widest text-accent animate-pulseSoft">
        NOREP LAB
      </div>
    </div>
  );
}
