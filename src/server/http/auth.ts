import type { NextRequest } from "next/server";
import { AppError } from "@/server/lib/error";
import { verifyAccessToken } from "@/server/lib/jwt";
import type { AccessTokenPayload } from "@/server/types/auth";
import type { AppRole } from "@/server/types/auth";

export const getBearerToken = (request: NextRequest): string => {
  const authorization = request.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new AppError(401, "UNAUTHORIZED", "Missing or invalid authorization header");
  }

  return authorization.slice(7).trim();
};

export const requireAccessAuth = (request: NextRequest): AccessTokenPayload => {
  const token = getBearerToken(request);

  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== "access") {
      throw new AppError(401, "UNAUTHORIZED", "Invalid access token");
    }
    return payload;
  } catch {
    throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token");
  }
};

export const requireAnyRole = (roles: AppRole[], userRole: AppRole) => {
  if (!roles.includes(userRole)) {
    throw new AppError(403, "FORBIDDEN", "Insufficient permissions");
  }
};
