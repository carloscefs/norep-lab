"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore } from "@/stores/userStore";
import { usePlanStore } from "@/stores/planStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useAuthStore } from "@/stores/authStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { generatePlan } from "@/lib/generatePlan";
import { WorkoutDayCard } from "@/components/workout/WorkoutDayCard";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const { hydrated } = useRequireAuth();
  const profile = useUserStore((s) => s.profile);
  const days = usePlanStore((s) => s.days);
  const setPlan = usePlanStore((s) => s.setPlan);
  const endSession = useSessionStore((s) => s.endSession);
  const username = useAuthStore((s) => s.username);
  const logout = useAuthStore((s) => s.logout);

  if (!hydrated) return null;
  if (!profile) {
    router.replace("/onboarding");
    return null;
  }

  const handleRegenerate = () => {
    const plan = generatePlan(profile);
    setPlan(plan);
    endSession();
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const completed = days.filter((d) => d.status === "concluido").length;

  return (
    <div className="flex min-h-screen flex-col px-5 pb-8 pt-8 safe-top">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent">
            Sua semana
          </span>
          <h1 className="font-display text-4xl tracking-wide text-white">
            NoRep Lab
          </h1>
          <p className="mt-1 text-sm text-muted">
            {completed}/{days.length} treinos concluídos
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleRegenerate}
            className="rounded-full border border-border bg-bg-elevated px-3 py-2 text-xs uppercase tracking-wider text-muted active:bg-bg-card"
          >
            Refazer
          </button>
          <div className="flex items-center gap-3">
            <Link href="/report" className="text-xs text-accent underline">
              Evolução
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-muted underline"
            >
              Sair ({username})
            </button>
          </div>
        </div>
      </header>

      <div className="space-y-3">
        {days.map((day, i) => (
          <WorkoutDayCard key={day.id} day={day} index={i} />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/5 p-4">
        <p className="font-display text-lg leading-tight tracking-wide text-white">
          &quot;Mais peso não é melhor. Falha técnica é.&quot;
        </p>
        <p className="mt-1 text-xs text-muted">
          Faixa ideal: 6–15 reps até a falha. &lt;6 = pesado demais. &gt;15 = leve demais.
        </p>
      </div>

      <div className="mt-6">
        <Button
          variant="ghost"
          fullWidth
          onClick={() => router.push("/onboarding")}
        >
          Editar perfil
        </Button>
      </div>
    </div>
  );
}
