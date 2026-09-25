"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  token: string | null;
  username: string | null;
  setAuth: (token: string, username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      setAuth: (token, username) => set({ token, username }),
      logout: () => set({ token: null, username: null }),
    }),
    {
      name: "norep-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<{ data?: T; error?: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(path, { ...options, headers });
    if (res.status === 401 && token) {
      // Token expirado/inválido: derruba a sessão local para o app
      // redirecionar ao login em vez de seguir com um token morto.
      useAuthStore.getState().logout();
      return { error: "Sessão expirada. Faça login novamente." };
    }
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Erro" };
    return { data: json as T };
  } catch {
    return { error: "Sem conexão" };
  }
}
