import "reflect-metadata";
import "./config/env";
import { createApp } from "./app";
import { env } from "./config/env";
import { AppDataSource } from "./config/data-source";
import { connectRedis } from "./config/redis";
import { logger } from "./config/logger";

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  logger.info("Database connection established");

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
  logger.error("Failed to start server", { error: message || "Connection refused (is PostgreSQL running?)", stack });
  process.exit(1);
});
