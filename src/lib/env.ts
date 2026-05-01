import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  REDIS_URL: z.string().url().optional(),

  API_BASE_URL: z.string().url().default("http://localhost:3000"),
});

/**
 * ⚠️ DO NOT validate at import time
 * This avoids Next.js build crashes
 */
export function getEnv() {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    REDIS_URL: process.env.REDIS_URL,
    API_BASE_URL: process.env.API_BASE_URL,
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    throw new Error(
      `Invalid environment variables:\n${JSON.stringify(errors, null, 2)}`
    );
  }

  return parsed.data;
}