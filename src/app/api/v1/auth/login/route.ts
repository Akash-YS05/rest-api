import { env } from "@/lib/env";
import { withHandler } from "@/server/http/with-handler";
import { parseJsonBody } from "@/server/http/request";
import { ok } from "@/server/http/response";
import { loginSchema } from "@/server/schemas/auth";
import { loginUser } from "@/server/services/auth-service";
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from "@/server/http/cookies";

export const POST = withHandler(async (request) => {
  const body = await parseJsonBody<unknown>(request);
  const parsed = loginSchema.parse(body);

  const result = await loginUser({
    email: parsed.email,
    password: parsed.password,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

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
