import { withHandler } from "@/server/http/with-handler";
import { ok } from "@/server/http/response";
import { openApiDocument } from "@/server/docs/openapi";

export const GET = withHandler(async () => {
  return ok(openApiDocument, 200);
});
