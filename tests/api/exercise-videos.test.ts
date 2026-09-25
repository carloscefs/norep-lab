import { beforeEach, describe, expect, test, vi } from "vitest";
import { makeRequest } from "../helpers";
import { signToken } from "@/lib/auth";

vi.mock("@/db/client", () => ({
  query: vi.fn(async () => []),
  queryOne: vi.fn(async () => null),
}));

import { query } from "@/db/client";
import { GET, PUT } from "@/app/api/exercise-videos/route";
import { VIDEO_SUGGESTIONS } from "@/data/videoSuggestions";

const queryMock = vi.mocked(query);
const adminToken = () => signToken({ userId: "u-admin", username: "carloscefs" });
const userToken = () => signToken({ userId: "u-2", username: "patmiguel" });

beforeEach(() => {
  queryMock.mockReset();
  queryMock.mockResolvedValue([]);
  delete process.env.ADMIN_USERNAMES;
});

describe("GET /api/exercise-videos", () => {
  test("401 without token", async () => {
    expect((await GET(makeRequest("/api/exercise-videos"))).status).toBe(401);
  });

  test("returns DB rows plus catalog suggestions for the rest, with isAdmin flag", async () => {
    queryMock
      .mockResolvedValueOnce([]) // ensureSchema
      .mockResolvedValueOnce([{ exercise_id: "cross-over", youtube_url: "https://www.youtube.com/watch?v=AAAAAAAAAAA", video_title: "Meu", status: "confirmado" }]);
    const res = await GET(makeRequest("/api/exercise-videos", { token: userToken() }));
    const json = await res.json();
    expect(json.isAdmin).toBe(false);
    const byId = Object.fromEntries(json.videos.map((v: { exercise_id: string }) => [v.exercise_id, v]));
    expect(byId["cross-over"].status).toBe("confirmado");
    expect(byId["cross-over"].youtube_url).toContain("AAAAAAAAAAA");
    expect(byId["supino-inclinado-halter"].status).toBe("sugerido");
    expect(byId["supino-inclinado-halter"].youtube_url).toContain(VIDEO_SUGGESTIONS["supino-inclinado-halter"].videoId);
    expect(byId["mergulho-paralelas"]).toBeUndefined();
  });

  test("admin flag honours ADMIN_USERNAMES", async () => {
    process.env.ADMIN_USERNAMES = "patmiguel, outro";
    const res = await GET(makeRequest("/api/exercise-videos", { token: userToken() }));
    expect((await res.json()).isAdmin).toBe(true);
  });
});

describe("PUT /api/exercise-videos", () => {
  const put = (body: unknown, token: string) =>
    PUT(makeRequest("/api/exercise-videos", { method: "PUT", body, token }));

  test("403 for non-admin, 400 for unknown exercise or bad link", async () => {
    expect((await put({ exercise_id: "cross-over", youtube_url: "https://youtu.be/AAAAAAAAAAA" }, userToken())).status).toBe(403);
    expect((await put({ exercise_id: "nao-existe", youtube_url: "https://youtu.be/AAAAAAAAAAA" }, adminToken())).status).toBe(400);
    expect((await put({ exercise_id: "cross-over", youtube_url: "https://vimeo.com/123" }, adminToken())).status).toBe(400);
  });

  test("normalizes any YouTube link form to a watch URL and upserts as confirmado", async () => {
    const res = await put(
      { exercise_id: "cross-over", youtube_url: "https://youtu.be/AAAAAAAAAAA?t=10", video_title: "Cross" },
      adminToken()
    );
    expect(res.status).toBe(200);
    const upsert = queryMock.mock.calls.find((c) => String(c[0]).includes("INSERT INTO exercise_videos"))!;
    expect(upsert[1]).toEqual(["cross-over", "https://www.youtube.com/watch?v=AAAAAAAAAAA", "Cross", "confirmado", "carloscefs"]);
  });

  test("empty link removes the override", async () => {
    const res = await put({ exercise_id: "cross-over", youtube_url: "" }, adminToken());
    expect(await res.json()).toEqual({ ok: true, removed: true });
    expect(queryMock.mock.calls.some((c) => String(c[0]).includes("DELETE FROM exercise_videos"))).toBe(true);
  });
});
