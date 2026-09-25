import { beforeEach, describe, expect, test, vi } from "vitest";
import { authToken, makeRequest } from "../helpers";

vi.mock("@/db/client", () => ({
  query: vi.fn(async () => []),
  queryOne: vi.fn(async () => null),
}));

import { query } from "@/db/client";
import { POST } from "@/app/api/swap-exercise/route";
import { EXERCISES } from "@/data/exercises";

const queryMock = vi.mocked(query);

beforeEach(() => {
  queryMock.mockReset();
  queryMock.mockResolvedValue([]);
  delete process.env.ANTHROPIC_API_KEY; // força o fallback determinístico
});

function swap(body: Record<string, unknown>) {
  return POST(makeRequest("/api/swap-exercise", { method: "POST", body, token: authToken() }));
}

describe("POST /api/swap-exercise (fallback determinístico)", () => {
  test("401 without token, 400 for unknown exercise", async () => {
    expect((await POST(makeRequest("/api/swap-exercise", { method: "POST", body: { exerciseId: "x" } }))).status).toBe(401);
    expect((await swap({ exerciseId: "nao-existe" })).status).toBe(400);
  });

  test("picks a same-group candidate of the same nature", async () => {
    const res = await swap({ exerciseId: "supino-reto-halter", usedIds: [], profile: { gymType: "moderna" } });
    const json = await res.json();
    const chosen = EXERCISES.find((e) => e.id === json.exercise_id)!;
    expect(json.source).toBe("fallback");
    expect(chosen.group).toBe("peito");
    expect(chosen.isCompound).toBe(true);
    expect(chosen.id).not.toBe("supino-reto-halter");
  });

  test("prefers a candidate the user already has load history for", async () => {
    queryMock.mockResolvedValueOnce([{ exercise_id: "supino-declinado-halter" }]);
    const res = await swap({ exerciseId: "supino-reto-halter", usedIds: [], profile: { gymType: "moderna" } });
    expect((await res.json()).exercise_id).toBe("supino-declinado-halter");
  });

  test("never offers female-only glute isolators to male users", async () => {
    const res = await swap({
      exerciseId: "elevacao-pelvica",
      usedIds: ["hip-thrust-halter", "agachamento-bulgaro-gluteo"],
      profile: { sex: "masculino", gymType: "moderna" },
    });
    expect(res.status).toBe(409);
  });

  test("respects gym type (raiz cannot receive machine-only exercises)", async () => {
    const res = await swap({ exerciseId: "agachamento-halter", usedIds: [], profile: { gymType: "raiz" } });
    const { exercise_id } = await res.json();
    const chosen = EXERCISES.find((e) => e.id === exercise_id)!;
    expect(["ambos", "raiz"]).toContain(chosen.gymType);
  });

  test("skips exercises already used in the day", async () => {
    const peito = EXERCISES.filter((e) => e.group === "peito" && e.id !== "supino-reto-halter").map((e) => e.id);
    const res = await swap({ exerciseId: "supino-reto-halter", usedIds: peito, profile: {} });
    expect(res.status).toBe(409);
  });
});
