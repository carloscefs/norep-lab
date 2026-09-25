import { afterEach, describe, expect, test } from "vitest";
import { extractYoutubeId, isAdminUsername } from "@/lib/admin";
import { VIDEO_SUGGESTIONS } from "@/data/videoSuggestions";
import { EXERCISES } from "@/data/exercises";

describe("extractYoutubeId", () => {
  test.each([
    ["dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?si=abc", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://m.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("parses %s", (input, expected) => {
    expect(extractYoutubeId(input)).toBe(expected);
  });

  test.each([
    "",
    "abc",
    "https://vimeo.com/12345",
    "https://www.youtube.com/@laerciorefundini/search?query=supino",
    "not a url",
  ])("rejects %s", (input) => {
    expect(extractYoutubeId(input)).toBeNull();
  });
});

describe("isAdminUsername", () => {
  afterEach(() => delete process.env.ADMIN_USERNAMES);

  test("defaults to carloscefs, case-insensitive", () => {
    expect(isAdminUsername("carloscefs")).toBe(true);
    expect(isAdminUsername("CarlosCefs")).toBe(true);
    expect(isAdminUsername("patmiguel")).toBe(false);
    expect(isAdminUsername(null)).toBe(false);
  });

  test("reads the ADMIN_USERNAMES list", () => {
    process.env.ADMIN_USERNAMES = "a, b";
    expect(isAdminUsername("b")).toBe(true);
    expect(isAdminUsername("carloscefs")).toBe(false);
  });
});

describe("VIDEO_SUGGESTIONS", () => {
  test("only references catalog exercises and valid video ids", () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    for (const [exerciseId, s] of Object.entries(VIDEO_SUGGESTIONS)) {
      expect(ids.has(exerciseId), exerciseId).toBe(true);
      expect(extractYoutubeId(s.videoId), exerciseId).toBe(s.videoId);
      expect(s.title.length).toBeGreaterThan(5);
    }
  });
});
