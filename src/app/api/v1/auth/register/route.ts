import { sanitizeText } from "@/server/lib/sanitize";
import { withHandler } from "@/server/http/with-handler";
import { parseJsonBody } from "@/server/http/request";
import { ok } from "@/server/http/response";
import { registerSchema } from "@/server/schemas/auth";
import { registerUser } from "@/server/services/auth-service";

export const POST = withHandler(async (request) => {
  const body = await parseJsonBody<unknown>(request);
  const parsed = registerSchema.parse(body);

  const user = await registerUser({
    name: sanitizeText(parsed.name),
    email: parsed.email,
    password: parsed.password,
  });

  return ok(user, 201);
});
