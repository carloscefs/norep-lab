import { Pool, type PoolClient } from "pg";

let pool: Pool | null = null;

// Supabase pooler + serverless: cold starts e projetos "acordando" podem demorar.
const CONNECT_TIMEOUT_MS = 15000;
const CONNECT_RETRIES = 1;

function isConnectTimeout(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /connection timeout|timeout exceeded when trying to connect/i.test(msg);
}

async function connectWithRetry(): Promise<PoolClient> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= CONNECT_RETRIES; attempt++) {
    try {
      return await getPool().connect();
    } catch (err) {
      lastErr = err;
      if (!isConnectTimeout(err)) throw err;
      console.error(`[db] connect timeout (tentativa ${attempt + 1})`, err);
    }
  }
  throw lastErr;
}

function needsSSL(url: string): boolean {
  return (
    url.includes("supabase.co") ||
    url.includes("supabase.com") ||
    url.includes("sslmode=require") ||
    url.includes("sslmode=verify-full") ||
    url.includes("ssl=true")
  );
}

export function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL ?? "";
    pool = new Pool({
      connectionString: url,
      ssl: needsSSL(url) ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await connectWithRetry();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
