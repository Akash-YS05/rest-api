import { prisma } from "@/server/lib/prisma";
import { withHandler } from "@/server/http/with-handler";
import { requireAccessAuth, requireAnyRole } from "@/server/http/auth";
import { ok } from "@/server/http/response";

export const dynamic = "force-dynamic";

export const GET = withHandler(async (request) => {
  const auth = requireAccessAuth(request);
  requireAnyRole(["ADMIN"], auth.role);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return ok(users, 200);
});
