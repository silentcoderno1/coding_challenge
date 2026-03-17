import dotenv from "dotenv";
import path from "path";

// Load .env: try project root first, then src/ (for different run contexts)
const rootDir = path.resolve(process.cwd());
const rootEnv = path.join(rootDir, ".env");
const srcEnv = path.join(rootDir, "src", ".env");
dotenv.config({ path: rootEnv });
dotenv.config({ path: srcEnv }); // override if exists (e.g. when .env is in src/)

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return defaultValue;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) throw new Error(`Env ${key} must be a number`);
  return n;
}

export const env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnvNumber("PORT", 3000),
  LOG_LEVEL: getEnv("LOG_LEVEL", "dev"),
  // Database (PostgreSQL)
  DB_HOST: getEnv("DB_HOST", "localhost"),
  DB_PORT: getEnvNumber("DB_PORT", 5432),
  DB_USERNAME: getEnv("DB_USERNAME", "postgres"),
  DB_PASSWORD: getEnv("DB_PASSWORD", "postgres"),
  DB_NAME: getEnv("DB_NAME", "app_db"),
  // Redis (optional - caching disabled if not set)
  REDIS_URL: process.env.REDIS_URL ?? "",
} as const;

export type Env = typeof env;
