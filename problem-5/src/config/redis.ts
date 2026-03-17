import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (!env.REDIS_URL || env.REDIS_URL.trim() === "") {
    return null;
  }
  if (client !== null) {
    return client;
  }
  try {
    client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });
    client.on("error", (err: Error) => logger.warn("Redis error", { error: err.message }));
    client.on("connect", () => logger.debug("Redis connected"));
    return client;
  } catch (err) {
    logger.warn("Redis init failed", { error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export async function connectRedis(): Promise<Redis | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    await redis.connect();
    return redis;
  } catch (err) {
    logger.warn("Redis connect failed", { error: err instanceof Error ? err.message : String(err) });
    client = null;
    return null;
  }
}
