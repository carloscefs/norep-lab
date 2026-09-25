import { NextRequest } from "next/server";
import { signToken } from "@/lib/auth";

export const TEST_USER = { userId: "11111111-1111-1111-1111-111111111111", username: "tester" };

export function authToken(): string {
  return signToken(TEST_USER);
}

interface ReqOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

/** Monta um NextRequest para chamar handlers de rota diretamente. */
export function makeRequest(path: string, opts: ReqOptions = {}): NextRequest {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opts.token) headers.authorization = `Bearer ${opts.token}`;
  return new NextRequest(`http://localhost${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
}

/** Retorna as chamadas SQL cujo texto contém o trecho informado. */
export function callsMatching(
  mock: { mock: { calls: unknown[][] } },
  needle: string
): unknown[][] {
  return mock.mock.calls.filter((c) => String(c[0]).includes(needle));
}
