// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useSessionStore } from "@/stores/sessionStore";
import { useAuthStore, apiFetch } from "@/stores/authStore";

describe("sessionStore", () => {
  beforeEach(() => useSessionStore.getState().endSession());

  test("startSession creates an empty session and keeps it for the same day", () => {
    const s = useSessionStore.getState();
    s.startSession("day-1");
    s.setWeight("agachamento-halter", 40);
    s.startSession("day-1");
    expect(useSessionStore.getState().session?.weightOverrides).toEqual({ "agachamento-halter": 40 });
    s.startSession("day-2");
    expect(useSessionStore.getState().session).toEqual({
      dayId: "day-2",
      startedAt: null,
      completedExerciseIds: [],
      weightOverrides: {},
    });
  });

  test("toggleExercise adds then removes; beginTimer only sets once", () => {
    const s = useSessionStore.getState();
    s.startSession("day-1");
    s.toggleExercise("a");
    s.toggleExercise("b");
    s.toggleExercise("a");
    expect(useSessionStore.getState().session?.completedExerciseIds).toEqual(["b"]);
    s.beginTimer();
    const first = useSessionStore.getState().session?.startedAt;
    s.beginTimer();
    expect(useSessionStore.getState().session?.startedAt).toBe(first);
    expect(first).toBeTypeOf("number");
  });

  test("setWeight is a no-op without a session", () => {
    useSessionStore.getState().setWeight("a", 10);
    expect(useSessionStore.getState().session).toBeNull();
  });
});

describe("apiFetch", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    useAuthStore.getState().logout();
  });

  test("sends bearer token and returns data", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({ ok: 1 }), { status: 200 })) as typeof fetch;
    const res = await apiFetch<{ ok: number }>("/api/x", {}, "tok");
    expect(res.data).toEqual({ ok: 1 });
    const headers = (vi.mocked(global.fetch).mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok");
  });

  test("logs out and reports expired session on 401 with a token", async () => {
    useAuthStore.getState().setAuth("tok", "carlo");
    global.fetch = vi.fn(async () => new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 })) as typeof fetch;
    const res = await apiFetch("/api/history", {}, "tok");
    expect(res.error).toMatch(/expirada/i);
    expect(useAuthStore.getState().token).toBeNull();
  });

  test("does not log out on 401 without a token (e.g. wrong login)", async () => {
    useAuthStore.getState().setAuth("tok", "carlo");
    global.fetch = vi.fn(async () => new Response(JSON.stringify({ error: "Usuário ou senha incorretos" }), { status: 401 })) as typeof fetch;
    const res = await apiFetch("/api/auth/login", { method: "POST" });
    expect(res.error).toBe("Usuário ou senha incorretos");
    expect(useAuthStore.getState().token).toBe("tok");
  });

  test("returns 'Sem conexão' when fetch throws", async () => {
    global.fetch = vi.fn(async () => { throw new Error("offline"); }) as typeof fetch;
    expect((await apiFetch("/api/x")).error).toBe("Sem conexão");
  });
});
