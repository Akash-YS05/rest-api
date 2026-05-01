import { env } from "@/lib/env";
import { withHandler } from "@/server/http/with-handler";
import { parseJsonBody } from "@/server/http/request";
import { ok } from "@/server/http/response";
import { refreshSchema } from "@/server/schemas/auth";
import { rotateRefreshToken } from "@/server/services/auth-service";
import { AppError } from "@/server/lib/error";
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from "@/server/http/cookies";

export const dynamic = "force-dynamic";

export const POST = withHandler(async (request) => {
  const body = await parseJsonBody<unknown>(request);
  const parsed = refreshSchema.parse(body);
  const tokenFromCookie = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  const refreshToken = parsed.refreshToken ?? tokenFromCookie;

  if (!refreshToken) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Missing refresh token");
  }

  const result = await rotateRefreshToken(refreshToken, env.JWT_REFRESH_EXPIRES_IN);

  const response = ok(
    {
      accessToken: result.accessToken,
      user: result.user,
    },
    200
  );

  response.cookies.set(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);

  return response;
});
