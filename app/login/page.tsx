"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, apiFetch } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { usePlanStore } from "@/stores/planStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useHydrated } from "@/hooks/useHydrated";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearProfile = useUserStore((s) => s.clear);
  const clearPlan = usePlanStore((s) => s.setPlan);
  const clearSession = useSessionStore((s) => s.endSession);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && token) router.replace("/");
  }, [hydrated, token, router]);

  const handleSubmit = async () => {
    setError(null);
    if (username.trim().length < 3) {
      setError("Usuário precisa ter pelo menos 3 caracteres.");
      return;
    }
    if (password.length < 6) {
      setError("Senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const res = await apiFetch<{ token: string; username: string }>(
      `/api/auth/${mode}`,
      { method: "POST", body: JSON.stringify({ username, password }) }
    );
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) {
      setAuth(res.data.token, res.data.username);
      // Clear any cached plan/session from a previous user on this device
      clearProfile();
      clearPlan([]);
      clearSession();
      router.replace("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between px-5 pb-8 pt-14 safe-top">
      {/* Logo */}
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="font-display text-6xl tracking-widest text-accent leading-none">
          NOREP
        </span>
        <span className="font-display text-6xl tracking-widest text-white leading-none">
          LAB
        </span>
        <p className="mt-3 text-xs uppercase tracking-widest text-muted">
          Treine até a falha. Evolua toda semana.
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm space-y-4">
        <div className="mb-2 flex rounded-xl border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mode === "login"
                ? "bg-accent text-white"
                : "bg-bg-elevated text-muted"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mode === "register"
                ? "bg-accent text-white"
                : "bg-bg-elevated text-muted"
            }`}
          >
            Criar conta
          </button>
        </div>

        <input
          type="text"
          placeholder="Usuário"
          value={username}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
          className="h-14 w-full rounded-xl border border-border bg-bg-elevated px-4 text-white placeholder-muted focus:border-accent focus:outline-none text-base"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="h-14 w-full rounded-xl border border-border bg-bg-elevated px-4 text-white placeholder-muted focus:border-accent focus:outline-none text-base"
        />

        {error && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <Button
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          className="h-14 text-base"
        >
          {loading
            ? "Aguarde..."
            : mode === "login"
            ? "Entrar"
            : "Criar conta"}
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted px-4">
        Metodologia NO-REPS — intensidade acima de volume.{" "}
        <br />Falha técnica é o estímulo.
      </p>
    </div>
  );
}
