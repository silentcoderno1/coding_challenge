import dotenv from "dotenv";
import path from "path";

const rootDir = path.resolve(process.cwd());
const rootEnv = path.join(rootDir, ".env");
const srcEnv = path.join(rootDir, "src", ".env");
dotenv.config({ path: rootEnv });
dotenv.config({ path: srcEnv });

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

/** When true, TypeORM synchronize runs even in production (e.g. SQLite without migrations on a host). */
function getEnvBool(key: string, defaultValue: boolean): boolean {
  const v = process.env[key];
  if (v === undefined || v === "") return defaultValue;
  return v === "1" || v.toLowerCase() === "true" || v === "yes";
}

export const env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnvNumber("PORT", 3000),
  LOG_LEVEL: getEnv("LOG_LEVEL", "dev"),
  /** SQLite file path (relative to cwd or absolute), e.g. data/app.sqlite */
  SQLITE_DATABASE: getEnv("SQLITE_DATABASE", "data/app.sqlite"),
  REDIS_URL: process.env.REDIS_URL ?? "",
  /** Set true in production when using SQLite without migrations */
  DB_SYNCHRONIZE: getEnvBool("DB_SYNCHRONIZE", false),
} as const;

export type Env = typeof env;
