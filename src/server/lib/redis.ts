import Redis from "ioredis";
import { getEnv } from "@/lib/env";
import { logger } from "@/server/lib/logger";

let client: Redis | null = null;

export const getRedis = (): Redis | null => {
  const env = getEnv();

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
