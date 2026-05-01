import Redis from "ioredis";
import { env } from "@/lib/env";
import { logger } from "@/server/lib/logger";

let client: Redis | null = null;

export const getRedis = (): Redis | null => {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!client) {
    client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });

    client.on("error", (error) => {
      logger.warn({ error }, "Redis connection error");
    });
  }

  return client;
};
