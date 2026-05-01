import pino from "pino";
import { env } from "@/lib/env";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
          },
        },
  redact: ["req.headers.authorization", "password", "passwordHash", "token"],
});
