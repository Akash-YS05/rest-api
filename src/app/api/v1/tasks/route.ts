import { sanitizeText } from "@/server/lib/sanitize";
import { withHandler } from "@/server/http/with-handler";
import { parseJsonBody } from "@/server/http/request";
import { ok } from "@/server/http/response";
import { requireAccessAuth, requireAnyRole } from "@/server/http/auth";
import { createTaskSchema, listTasksQuerySchema } from "@/server/schemas/task";
import { createTask, listTasks } from "@/server/services/task-service";

export const dynamic = "force-dynamic";

export const GET = withHandler(async (request) => {
  const auth = requireAccessAuth(request);
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsedQuery = listTasksQuerySchema.parse(query);

  requireAnyRole(["USER", "ADMIN"], auth.role);

  const tasks = await listTasks({
    userId: auth.sub,
    role: auth.role,
    status: parsedQuery.status,
  });

  return ok(tasks, 200);
});

export const POST = withHandler(async (request) => {
  const auth = requireAccessAuth(request);
  requireAnyRole(["USER", "ADMIN"], auth.role);

  const body = await parseJsonBody<unknown>(request);
  const parsed = createTaskSchema.parse(body);

  const task = await createTask({
    userId: auth.sub,
    title: sanitizeText(parsed.title),
    description: parsed.description ? sanitizeText(parsed.description) : undefined,
    status: parsed.status,
  });

  return ok(task, 201);
});
