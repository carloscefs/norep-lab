"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  StepPhysical,
  isPhysicalValid,
  type PhysicalDraft,
} from "@/components/onboarding/StepPhysical";
import {
  StepPreferences,
  isPreferencesValid,
  type PreferencesDraft,
} from "@/components/onboarding/StepPreferences";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useUserStore } from "@/stores/userStore";
import { usePlanStore } from "@/stores/planStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useAuthStore } from "@/stores/authStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { generatePlanRemote } from "@/lib/generatePlanRemote";
import type { UserProfile } from "@/data/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { hydrated: authHydrated } = useRequireAuth();
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const setPlan = usePlanStore((s) => s.setPlan);
  const endSession = useSessionStore((s) => s.endSession);
  const token = useAuthStore((s) => s.token);
  const [generating, setGenerating] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [physical, setPhysical] = useState<PhysicalDraft>({
    sex: profile?.sex ?? null,
    age: profile?.age ? String(profile.age) : "",
    weight: profile?.weight ? String(profile.weight) : "",
    height: profile?.height ? String(profile.height) : "",
  });
  const [prefs, setPrefs] = useState<PreferencesDraft>({
    days: profile?.days ?? null,
    duration: profile?.duration ?? null,
    level: profile?.level ?? null,
    goal: profile?.goal ?? null,
    cardio: profile?.cardio ?? null,
    gymType: profile?.gymType ?? null,
  });

  if (!authHydrated) return null;

  const canAdvance = step === 1 ? isPhysicalValid(physical) : isPreferencesValid(prefs);

  const handleSubmit = async () => {
    if (!isPhysicalValid(physical) || !isPreferencesValid(prefs)) return;
    const profile: UserProfile = {
      sex: physical.sex!,
      age: parseInt(physical.age),
      weight: parseFloat(physical.weight),
      height: parseFloat(physical.height),
      days: prefs.days!,
      duration: prefs.duration!,
      level: prefs.level!,
      goal: prefs.goal!,
      cardio: prefs.cardio!,
      gymType: prefs.gymType!,
    };
    setProfile(profile, token);
    setGenerating(true);
    try {
      const plan = await generatePlanRemote(profile, token);
      setPlan(plan, token);
      endSession();
      router.push("/dashboard");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-5 pb-6 pt-8 safe-top">
      <div className="mb-6 space-y-3">
        <ProgressBar value={step / 2} />
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted">
          <span>Etapa {step} de 2</span>
          <span className="font-display text-base text-accent tracking-wider">
            NOREP LAB
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="font-display text-4xl leading-tight tracking-wide text-white">
          {step === 1 ? "Quem é você?" : "Como você treina?"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {step === 1
            ? "Dados básicos para calibrar o treino."
            : "Vamos montar sua semana NO-REPS."}
        </p>
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 ? (
              <StepPhysical draft={physical} onChange={setPhysical} />
            ) : (
              <StepPreferences draft={prefs} onChange={setPrefs} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex gap-3">
        {step === 2 && (
          <Button
            variant="secondary"
            onClick={() => setStep(1)}
            className="flex-1"
          >
            Voltar
          </Button>
        )}
        {step === 1 ? (
          <Button
            variant="primary"
            fullWidth
            disabled={!canAdvance}
            onClick={() => setStep(2)}
          >
            Continuar
          </Button>
        ) : (
          <Button
            variant="primary"
            className="flex-1"
            disabled={!canAdvance || generating}
            onClick={handleSubmit}
          >
            {generating ? "Gerando treino..." : "Gerar treino"}
          </Button>
        )}
      </div>
    </div>
  );
}
