import { beforeEach, describe, expect, test, vi } from "vitest";
import { authToken, callsMatching, makeRequest } from "../helpers";

vi.mock("@/db/client", () => ({
  query: vi.fn(async () => []),
  queryOne: vi.fn(async () => ({ id: "session-1" })),
}));

import { query, queryOne } from "@/db/client";
import { POST, GET } from "@/app/api/sessions/route";

const queryMock = vi.mocked(query);
const queryOneMock = vi.mocked(queryOne);

const basePayload = {
  workout_day_id: "day-1",
  workout_day_name: "Perna A",
  date: "2026-09-25",
  started_at: "2026-09-25T10:00:00.000Z",
  finished_at: "2026-09-25T11:00:00.000Z",
  duration_seconds: 3600,
  total_exercises: 3,
  completed_exercises: 2,
};

beforeEach(() => {
  queryMock.mockClear();
  queryOneMock.mockClear();
});

describe("POST /api/sessions", () => {
  test("rejects requests without token", async () => {
    const res = await POST(makeRequest("/api/sessions", { method: "POST", body: basePayload }));
    expect(res.status).toBe(401);
  });

  test("writes exercise_history only for completed exercises with weight > 0", async () => {
    const exercises = [
      { exercise_id: "agachamento-halter", exercise_name: "Agachamento", muscle_group: "quadriceps", weight_kg: 40, completed: true },
      { exercise_id: "stiff-halter", exercise_name: "Stiff", muscle_group: "posterior", weight_kg: 50, completed: false },
      { exercise_id: "mesa-flexora", exercise_name: "Mesa", muscle_group: "posterior", weight_kg: 0, completed: true },
      { exercise_id: "hip-thrust-halter", exercise_name: "Hip", muscle_group: "gluteo", weight_kg: null, completed: true },
    ];
    const res = await POST(
      makeRequest("/api/sessions", { method: "POST", body: { ...basePayload, exercises }, token: authToken() })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ sessionId: "session-1" });

    expect(callsMatching(queryMock, "INSERT INTO exercise_logs")).toHaveLength(4);
    const history = callsMatching(queryMock, "INSERT INTO exercise_history");
    expect(history).toHaveLength(1);
    const params = history[0][1] as unknown[];
    expect(params[1]).toBe("agachamento-halter");
    expect(params[4]).toBe(40);
    expect(params[5]).toBe("2026-09-25");
    expect(params[6]).toBe("session-1");
  });

  test("inserts the session with snake_case fields", async () => {
    await POST(makeRequest("/api/sessions", { method: "POST", body: basePayload, token: authToken() }));
    const insert = queryOneMock.mock.calls[0];
    expect(String(insert[0])).toContain("INSERT INTO workout_sessions");
    const params = insert[1] as unknown[];
    expect(params.slice(1, 4)).toEqual(["day-1", "Perna A", "2026-09-25"]);
    expect(params[6]).toBe(3600);
  });
});

describe("GET /api/sessions", () => {
  test("returns 401 without token and sessions with token", async () => {
    expect((await GET(makeRequest("/api/sessions"))).status).toBe(401);
    queryMock.mockResolvedValueOnce([{ id: "s1" }]);
    const res = await GET(makeRequest("/api/sessions", { token: authToken() }));
    expect(await res.json()).toEqual({ sessions: [{ id: "s1" }] });
  });
});
