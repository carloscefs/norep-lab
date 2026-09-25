import { beforeEach, describe, expect, test, vi } from "vitest";
import bcrypt from "bcryptjs";
import { makeRequest } from "../helpers";

vi.mock("@/db/client", () => ({
  query: vi.fn(async () => []),
  queryOne: vi.fn(async () => null),
  isConnectTimeout: (err: unknown) =>
    /connection timeout/i.test(err instanceof Error ? err.message : String(err)),
}));

import { query, queryOne } from "@/db/client";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as register } from "@/app/api/auth/register/route";
import { verifyToken } from "@/lib/auth";

const queryMock = vi.mocked(query);
const queryOneMock = vi.mocked(queryOne);

beforeEach(() => {
  queryMock.mockReset();
  queryOneMock.mockReset();
  queryMock.mockResolvedValue([]);
  queryOneMock.mockResolvedValue(null);
});

describe("POST /api/auth/login", () => {
  test("400 when credentials are missing", async () => {
    const res = await login(makeRequest("/api/auth/login", { method: "POST", body: { username: "x" } }));
    expect(res.status).toBe(400);
  });

  test("401 for unknown user or wrong password", async () => {
    let res = await login(makeRequest("/api/auth/login", { method: "POST", body: { username: "x", password: "y" } }));
    expect(res.status).toBe(401);

    queryOneMock.mockResolvedValueOnce({ id: "u1", username: "carlo", password_hash: await bcrypt.hash("right", 4) });
    res = await login(makeRequest("/api/auth/login", { method: "POST", body: { username: "Carlo", password: "wrong" } }));
    expect(res.status).toBe(401);
  });

  test("returns a valid token on success and lowercases the username", async () => {
    queryOneMock.mockResolvedValueOnce({ id: "u1", username: "carlo", password_hash: await bcrypt.hash("right", 4) });
    const res = await login(makeRequest("/api/auth/login", { method: "POST", body: { username: "Carlo", password: "right" } }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(verifyToken(json.token)).toMatchObject({ userId: "u1", username: "carlo" });
    expect(queryOneMock.mock.calls[0][1]).toEqual(["carlo"]);
  });

  test("503 with a clear message when the database connection times out", async () => {
    queryOneMock.mockRejectedValueOnce(new Error("Connection terminated due to connection timeout"));
    const res = await login(makeRequest("/api/auth/login", { method: "POST", body: { username: "x", password: "y" } }));
    expect(res.status).toBe(503);
    expect((await res.json()).error).toMatch(/indisponível/);
  });
});

describe("POST /api/auth/register", () => {
  test("validates username and password length", async () => {
    const res = await register(makeRequest("/api/auth/register", { method: "POST", body: { username: "ab", password: "123456" } }));
    expect(res.status).toBe(400);
  });

  test("409 when the username already exists", async () => {
    queryOneMock.mockResolvedValueOnce({ id: "u1" });
    const res = await register(makeRequest("/api/auth/register", { method: "POST", body: { username: "carlo", password: "123456" } }));
    expect(res.status).toBe(409);
  });

  test("creates the user with a hashed password and returns a token", async () => {
    queryMock.mockResolvedValueOnce([{ id: "u2", username: "nova" }]);
    const res = await register(makeRequest("/api/auth/register", { method: "POST", body: { username: "Nova", password: "segredo1" } }));
    expect(res.status).toBe(200);
    const params = queryMock.mock.calls[0][1] as string[];
    expect(params[0]).toBe("nova");
    expect(params[2]).not.toBe("segredo1");
    expect(await bcrypt.compare("segredo1", params[2])).toBe(true);
    expect(verifyToken((await res.json()).token)).toMatchObject({ userId: "u2" });
  });
});
