import { beforeEach, describe, expect, test, vi } from "vitest";
import { authToken, makeRequest } from "../helpers";

vi.mock("@/db/client", () => ({
  query: vi.fn(async () => []),
  queryOne: vi.fn(async () => null),
}));

import { query } from "@/db/client";
import { GET } from "@/app/api/history/route";

const queryMock = vi.mocked(query);

beforeEach(() => {
  queryMock.mockReset();
  queryMock.mockResolvedValue([]);
});

describe("GET /api/history", () => {
  test("401 without token", async () => {
    expect((await GET(makeRequest("/api/history"))).status).toBe(401);
  });

  test("returns aggregated exercises and the 10 most recent sessions", async () => {
    queryMock
      .mockResolvedValueOnce([{ exercise_id: "agachamento-halter", last_weight: "40.00", max_weight: "45.00" }])
      .mockResolvedValueOnce([{ date: "2026-09-25", workout_day_name: "Perna A" }]);
    const res = await GET(makeRequest("/api/history", { token: authToken() }));
    const json = await res.json();
    expect(json.exercises[0].last_weight).toBe("40.00");
    expect(json.sessions).toHaveLength(1);
    expect(String(queryMock.mock.calls[1][0])).toContain("LIMIT 10");
  });

  test("filters by exerciseId when provided", async () => {
    queryMock.mockResolvedValueOnce([{ weight_kg: "40.00", date: "2026-09-25" }]);
    const res = await GET(makeRequest("/api/history?exerciseId=agachamento-halter", { token: authToken() }));
    expect((await res.json()).history).toHaveLength(1);
    expect(queryMock.mock.calls[0][1]).toEqual([expect.any(String), "agachamento-halter"]);
  });

  test("500 with message when the database fails", async () => {
    queryMock.mockRejectedValueOnce(new Error("boom"));
    const res = await GET(makeRequest("/api/history", { token: authToken() }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("boom");
  });
});
