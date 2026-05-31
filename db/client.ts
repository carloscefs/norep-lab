import { Pool } from "pg";

let pool: Pool | null = null;

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
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await getPool().connect();
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
