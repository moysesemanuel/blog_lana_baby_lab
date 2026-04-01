import { Pool } from "pg";

let pool;
let initialized = false;

const getConnectionString = () => process.env.DATABASE_URL || "";

export const isDatabaseEnabled = () => Boolean(getConnectionString());

const getPool = () => {
  if (!pool) {
    const connectionString = getConnectionString();
    const useSsl =
      connectionString.includes("sslmode=require") ||
      connectionString.includes("neon.tech");

    pool = new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined
    });
  }

  return pool;
};

export const initDatabase = async () => {
  if (!isDatabaseEnabled() || initialized) {
    return;
  }

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS published_recipes (
      slug TEXT PRIMARY KEY,
      recipe JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  initialized = true;
};

export const dbQuery = async (text, params = []) => {
  await initDatabase();
  return getPool().query(text, params);
};
