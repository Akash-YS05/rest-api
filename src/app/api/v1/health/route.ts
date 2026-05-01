import { withHandler } from "@/server/http/with-handler";
import { ok } from "@/server/http/response";

export const GET = withHandler(async () => {
  return ok({
    service: "rest-api",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
