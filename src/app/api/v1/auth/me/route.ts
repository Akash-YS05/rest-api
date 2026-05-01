import { prisma } from "@/server/lib/prisma";
import { withHandler } from "@/server/http/with-handler";
import { requireAccessAuth } from "@/server/http/auth";
import { ok } from "@/server/http/response";

export const dynamic = "force-dynamic";

export const GET = withHandler(async (request) => {
  const auth = requireAccessAuth(request);

  const user = await prisma.user.findUnique({
    where: {
      id: auth.sub,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return ok(null, 200);
  }

  return ok(user, 200);
});
