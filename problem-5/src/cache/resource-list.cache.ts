import type Redis from "ioredis";
import type { FindAllResourcesQuery, FindAllResourcesResult } from "../repositories/resource.repository";
import { logger } from "../config/logger";

export interface IResourceListCache {
  get(query: FindAllResourcesQuery): Promise<FindAllResourcesResult | null>;
  set(query: FindAllResourcesQuery, result: FindAllResourcesResult): Promise<void>;
  invalidate(): Promise<void>;
}

const KEY_PREFIX = "resources:list:";
const LIST_PATTERN = "resources:list:*";
const TTL_SECONDS = 60;

function cacheKey(query: FindAllResourcesQuery): string {
  const canonical = {
    skip: query.skip ?? 0,
    take: query.take ?? 20,
    status: query.status ?? "",
    search: query.search ?? "",
    sortOrder: query.sortOrder ?? "DESC",
  };
  return KEY_PREFIX + JSON.stringify(canonical);
}

export class ResourceListCache implements IResourceListCache {
  constructor(private readonly redis: Redis | null) {}

  async get(query: FindAllResourcesQuery): Promise<FindAllResourcesResult | null> {
    if (!this.redis) return null;
    try {
      const key = cacheKey(query);
      const raw = await this.redis.get(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as FindAllResourcesResult;
      if (parsed.data && Array.isArray(parsed.data)) {
        parsed.data = parsed.data.map((r) => ({
          ...r,
          createdAt: r.createdAt ? new Date(r.createdAt) : r.createdAt,
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : r.updatedAt,
          deletedAt: r.deletedAt ? new Date(r.deletedAt) : r.deletedAt,
        }));
      }
      return parsed;
    } catch (err) {
      logger.warn("Resource list cache get failed", { error: err instanceof Error ? err.message : String(err) });
      return null;
    }
  }

  async set(query: FindAllResourcesQuery, result: FindAllResourcesResult): Promise<void> {
    if (!this.redis) return;
    try {
      const key = cacheKey(query);
      await this.redis.setex(key, TTL_SECONDS, JSON.stringify(result));
    } catch (err) {
      logger.warn("Resource list cache set failed", { error: err instanceof Error ? err.message : String(err) });
    }
  }

  async invalidate(): Promise<void> {
    if (!this.redis) return;
    try {
      const keys = await this.redis.keys(LIST_PATTERN);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug("Resource list cache invalidated", { keysDeleted: keys.length });
      }
    } catch (err) {
      logger.warn("Resource list cache invalidate failed", { error: err instanceof Error ? err.message : String(err) });
    }
  }
}
