import { openApiDocument } from "@/server/docs/openapi";
import { withHandler } from "@/server/http/with-handler";

export const GET = withHandler(async () => {
  return Response.json(openApiDocument, { status: 200 });
});
