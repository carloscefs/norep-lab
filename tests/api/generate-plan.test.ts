import { beforeEach, describe, expect, test, vi } from "vitest";
import { authToken, makeRequest } from "../helpers";

const createMock = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: class Anthropic {
    messages = { create: createMock };
  },
}));

vi.mock("@/db/client", () => ({
  query: vi.fn(async () => []),
  queryOne: vi.fn(async () => null),
}));

vi.mock("@/lib/laercioRef", () => ({ LAERCIO_REFERENCE: "REF" }));

import { query, queryOne } from "@/db/client";
import { POST } from "@/app/api/generate-plan/route";

const queryMock = vi.mocked(query);
const queryOneMock = vi.mocked(queryOne);

const profile = {
  sex: "feminino",
  age: 35,
  weight: 60,
  height: 165,
  days: 3,
  duration: 60,
  level: "iniciante",
  goal: "hipertrofia",
  cardio: true,
  gymType: "moderna",
  customSplit: ["perna", "braco", "perna"],
};

function aiReply(days: { name: string; exercise_ids: string[] }[]) {
  createMock.mockResolvedValueOnce({ content: [{ type: "text", text: JSON.stringify({ days }) }] });
}

beforeEach(() => {
  createMock.mockReset();
  queryMock.mockReset();
  queryOneMock.mockReset();
  queryMock.mockResolvedValue([]);
  queryOneMock.mockResolvedValue(null);
  process.env.ANTHROPIC_API_KEY = "test-key";
});

describe("POST /api/generate-plan", () => {
  test("401 without token, 500 without API key", async () => {
    expect((await POST(makeRequest("/api/generate-plan", { method: "POST", body: profile }))).status).toBe(401);
    delete process.env.ANTHROPIC_API_KEY;
    expect((await POST(makeRequest("/api/generate-plan", { method: "POST", body: profile, token: authToken() }))).status).toBe(500);
  });

  test("maps AI ids onto the custom split, dropping unknown ids", async () => {
    aiReply([
      { name: "x", exercise_ids: ["agachamento-halter", "id-invalido", "mesa-flexora"] },
      { name: "y", exercise_ids: ["rosca-martelo", "triceps-pulley"] },
      { name: "z", exercise_ids: ["leg-press-45"] },
    ]);
    const res = await POST(makeRequest("/api/generate-plan", { method: "POST", body: profile, token: authToken() }));
    expect(res.status).toBe(200);
    const { days } = await res.json();
    expect(days.map((d: { name: string }) => d.name)).toEqual(["Perna A", "Braço", "Perna B"]);
    expect(days[0].exercises.map((e: { exerciseId: string }) => e.exerciseId)).toEqual(["agachamento-halter", "mesa-flexora"]);
    expect(days[0].exercises[0].effectiveSets).toBe(2);
    expect(days[0].cardio).toEqual({ type: "continuo", minutes: 15 });
    expect(days[0].status).toBe("nao-iniciado");
  });

  test("includes previous plan and load history in the prompt for continuity", async () => {
    queryOneMock.mockResolvedValueOnce({
      plan_data: { days: [{ name: "Perna A", exercises: [{ exerciseId: "agachamento-halter" }] }] },
    });
    queryMock.mockResolvedValueOnce([{ exercise_id: "agachamento-halter" }, { exercise_id: "stiff-halter" }]);
    aiReply([{ name: "a", exercise_ids: ["agachamento-halter"] }, { name: "b", exercise_ids: ["rosca-martelo"] }, { name: "c", exercise_ids: ["stiff-halter"] }]);

    await POST(makeRequest("/api/generate-plan", { method: "POST", body: profile, token: authToken() }));

    const call = createMock.mock.calls[0][0];
    const userText = call.messages[0].content as string;
    expect(userText).toContain("CONTINUIDADE");
    expect(userText).toContain('"agachamento-halter"');
    expect(userText).toContain("stiff-halter");
    expect(userText).toContain("PERSONALIZADO");
    expect(call.system[1].cache_control).toEqual({ type: "ephemeral" });
  });

  test("omits the continuity block for a brand-new user", async () => {
    aiReply([{ name: "a", exercise_ids: [] }, { name: "b", exercise_ids: [] }, { name: "c", exercise_ids: [] }]);
    await POST(makeRequest("/api/generate-plan", { method: "POST", body: profile, token: authToken() }));
    expect(createMock.mock.calls[0][0].messages[0].content).not.toContain("CONTINUIDADE");
  });

  test("502 when the AI returns no JSON", async () => {
    createMock.mockResolvedValueOnce({ content: [{ type: "text", text: "sem json" }] });
    const res = await POST(makeRequest("/api/generate-plan", { method: "POST", body: profile, token: authToken() }));
    expect(res.status).toBe(502);
  });
});
