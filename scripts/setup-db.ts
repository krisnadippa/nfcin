import { Pool } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
import { loadEnvConfig } from "@next/env";

// Load Next.js environment variables (including .env.local)
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL is missing in .env.local");
  process.exit(1);
}

async function setup() {
  console.log("Connecting to Neon PostgreSQL database...");
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const schemaPath = path.join(process.cwd(), "db_schema.sql");
  if (!fs.existsSync(schemaPath)) {
    console.error("Error: db_schema.sql not found in the project root.");
    process.exit(1);
  }

  console.log("Reading schema SQL file...");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  console.log("Executing full schema SQL in a single transaction...");
  try {
    // pg/neon Pool can execute multiple queries in a single string
    await pool.query(schemaSql);
    console.log("Database tables, indexes, and triggers set up successfully!");
  } catch (err: any) {
    console.error("Error executing schema query:", err.message);
  } finally {
    await pool.end();
  }
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
