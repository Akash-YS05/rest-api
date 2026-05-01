import { withHandler } from "@/server/http/with-handler";
import { ok } from "@/server/http/response";
import { postmanCollection } from "@/server/docs/postman";

export const dynamic = "force-dynamic";

export const GET = withHandler(async () => {
  return ok(postmanCollection, 200);
});
