import { withHandler } from "@/server/http/with-handler";
import { parseJsonBody } from "@/server/http/request";
import { ok } from "@/server/http/response";
import { refreshSchema } from "@/server/schemas/auth";
import { revokeRefreshToken } from "@/server/services/auth-service";
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from "@/server/http/cookies";

export const POST = withHandler(async (request) => {
  const body = await parseJsonBody<unknown>(request);
  const parsed = refreshSchema.parse(body);
  const tokenFromCookie = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  const refreshToken = parsed.refreshToken ?? tokenFromCookie;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  const response = ok({ message: "Logged out successfully" }, 200);
  response.cookies.set(REFRESH_COOKIE_NAME, "", {
    ...refreshCookieOptions,
    maxAge: 0,
  });

  return response;
});
