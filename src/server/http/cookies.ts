import { getEnv } from "@/lib/env";
const env = getEnv();

export const REFRESH_COOKIE_NAME = "refresh_token";

export const refreshCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  path: "/",
};
