import { Pool } from "@neondatabase/serverless";

let poolInstance: Pool | null = null;

function getPool(): Pool {
  if (!poolInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is missing.");
    }
    poolInstance = new Pool({
      connectionString: databaseUrl,
    });
  }
  return poolInstance;
}

/**
 * Helper to execute query and return the first row or null
 */
export async function queryOne<T>(
  queryString: string,
  params: any[] = []
): Promise<T | null> {
  const pool = getPool();
  const result = await pool.query(queryString, params);
  const rows = result.rows;
  if (!rows || rows.length === 0) return null;
  return rows[0] as T;
}

/**
 * Helper to execute query and return all rows
 */
export async function queryMany<T>(
  queryString: string,
  params: any[] = []
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(queryString, params);
  return (result.rows ?? []) as T[];
}

/**
 * Execute raw SQL query
 */
export async function sql(
  queryString: string,
  params: any[] = []
): Promise<any> {
  const pool = getPool();
  return pool.query(queryString, params);
}
