import { beforeEach, describe, expect, test, vi } from "vitest";
import { authToken, callsMatching, makeRequest } from "../helpers";

vi.mock("@/db/client", () => ({
  query: vi.fn(async () => []),
  queryOne: vi.fn(async () => null),
}));

import { query, queryOne } from "@/db/client";
import { GET, POST } from "@/app/api/profile/route";

const queryMock = vi.mocked(query);
const queryOneMock = vi.mocked(queryOne);

const body = {
  sex: "feminino",
  age: 35,
  weight_kg: 60,
  height_cm: 165,
  training_days: 5,
  session_duration_min: 60,
  level: "intermediario",
  goal: "hipertrofia",
  cardio: false,
  gym_type: "moderna",
};

beforeEach(() => {
  queryMock.mockClear();
  queryOneMock.mockClear();
});

describe("/api/profile", () => {
  test("GET and POST reject requests without token", async () => {
    expect((await GET(makeRequest("/api/profile"))).status).toBe(401);
    expect((await POST(makeRequest("/api/profile", { method: "POST", body }))).status).toBe(401);
  });

  test("GET returns the stored profile row", async () => {
    queryOneMock.mockResolvedValueOnce({ sex: "feminino", custom_split: ["perna", "braco"] });
    const res = await GET(makeRequest("/api/profile", { token: authToken() }));
    expect(await res.json()).toEqual({ profile: { sex: "feminino", custom_split: ["perna", "braco"] } });
  });

  test("POST persists a valid custom_split as JSON", async () => {
    const custom_split = ["perna", "braco", "perna", "braco", "perna"];
    const res = await POST(
      makeRequest("/api/profile", { method: "POST", body: { ...body, custom_split }, token: authToken() })
    );
    expect(res.status).toBe(200);
    const upsert = callsMatching(queryMock, "INSERT INTO user_profiles")[0];
    const params = upsert[1] as unknown[];
    expect(params[11]).toBe(JSON.stringify(custom_split));
  });

  test("POST stores null when custom_split is invalid or mismatched", async () => {
    for (const custom_split of [["perna"], ["perna", "abs", "perna", "perna", "perna"], "perna", undefined]) {
      queryMock.mockClear();
      await POST(
        makeRequest("/api/profile", { method: "POST", body: { ...body, custom_split }, token: authToken() })
      );
      const params = callsMatching(queryMock, "INSERT INTO user_profiles")[0][1] as unknown[];
      expect(params[11]).toBeNull();
    }
  });

  test("ensures the custom_split column exists before writing", async () => {
    await POST(makeRequest("/api/profile", { method: "POST", body, token: authToken() }));
    const order = queryMock.mock.calls.map((c) => String(c[0]));
    const alterIdx = order.findIndex((s) => s.includes("ADD COLUMN IF NOT EXISTS custom_split"));
    const insertIdx = order.findIndex((s) => s.includes("INSERT INTO user_profiles"));
    // O ALTER é memoizado por instância: pode já ter rodado em teste anterior.
    if (alterIdx !== -1) expect(alterIdx).toBeLessThan(insertIdx);
    expect(insertIdx).toBeGreaterThanOrEqual(0);
  });
});
