"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, apiFetch } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";

interface Props {
  onClose: () => void;
}

export function AuthModal({ onClose }: Props) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError("Preencha usuário e senha.");
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
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm px-0">
      <AnimatePresence>
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="w-full max-w-md rounded-t-3xl border-t border-border bg-bg-elevated p-6 pb-8 safe-bottom"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-3xl tracking-wide text-white">
              {mode === "login" ? "Entrar" : "Criar conta"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-muted text-xl leading-none"
            >
              ×
            </button>
          </div>

          <p className="mb-5 text-sm text-muted">
            {mode === "login"
              ? "Acesse para salvar e sincronizar seus treinos."
              : "Crie uma conta para recuperar seus treinos em qualquer dispositivo."}
          </p>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Usuário"
              value={username}
              autoCapitalize="none"
              autoCorrect="off"
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-bg-card px-4 text-white placeholder-muted focus:border-accent focus:outline-none"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="h-12 w-full rounded-xl border border-border bg-bg-card px-4 text-white placeholder-muted focus:border-accent focus:outline-none"
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            className="mt-5"
          >
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
            className="mt-4 w-full text-center text-sm text-muted active:text-white"
          >
            {mode === "login"
              ? "Não tem conta? Criar agora"
              : "Já tem conta? Entrar"}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
