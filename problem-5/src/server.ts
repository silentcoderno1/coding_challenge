import fs from "fs";
import path from "path";
import "reflect-metadata";
import "./config/env";
import { createApp } from "./app";
import { env } from "./config/env";
import { AppDataSource } from "./config/data-source";
import { connectRedis } from "./config/redis";
import { logger } from "./config/logger";

function ensureSqliteDirectory(): void {
  const dbPath = path.isAbsolute(env.SQLITE_DATABASE)
    ? env.SQLITE_DATABASE
    : path.resolve(process.cwd(), env.SQLITE_DATABASE);
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function bootstrap(): Promise<void> {
  ensureSqliteDirectory();
  await AppDataSource.initialize();
  logger.info("Database connection established", { database: env.SQLITE_DATABASE });

  const redis = await connectRedis();
  if (redis) logger.info("Redis connected (caching enabled for GET /resources)");

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info("Server listening", { port: env.PORT, env: env.NODE_ENV });
  });
}

bootstrap().catch((err: unknown) => {
  let message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  // AggregateError (e.g. from DB connection) often has empty message; use first inner error
  if (typeof err === "object" && err !== null && "errors" in err && Array.isArray((err as { errors: unknown[] }).errors)) {
    const first = (err as { errors: unknown[] }).errors[0];
    if (first instanceof Error && first.message) message = first.message;
  }
  logger.error("Failed to start server", { error: message || "Check SQLITE_DATABASE path and permissions", stack });
  process.exit(1);
});
