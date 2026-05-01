import pino from "pino";
import { getEnv } from "@/lib/env";

let cached: pino.Logger | undefined;

export const getLogger = (): pino.Logger => {
  const env = getEnv();

  if (cached) {
    return cached;
  }

  cached = pino({
    level: env.NODE_ENV === "production" ? "info" : "debug",
    transport: undefined,
    redact: ["req.headers.authorization", "password", "passwordHash", "token"],
  });

  return cached;
};

export const logger = new Proxy({} as pino.Logger, {
  get(_target, prop) {
    const instance = getLogger();
    return Reflect.get(instance, prop);
  },
});
