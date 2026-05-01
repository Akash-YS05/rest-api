import { sanitizeText } from "@/server/lib/sanitize";
import { withHandler } from "@/server/http/with-handler";
import { parseJsonBody } from "@/server/http/request";
import { ok } from "@/server/http/response";
import { requireAccessAuth, requireAnyRole } from "@/server/http/auth";
import { idParamSchema } from "@/server/schemas/common";
import { updateTaskSchema } from "@/server/schemas/task";
import { deleteTask, updateTask } from "@/server/services/task-service";

type ParamsContext = {
  params: Promise<{
    id: string;
  }>;
};

export const PUT = withHandler<ParamsContext>(async (request, context) => {
  const auth = requireAccessAuth(request);
  requireAnyRole(["USER", "ADMIN"], auth.role);

  const params = idParamSchema.parse(await context.params);
  const body = await parseJsonBody<unknown>(request);
  const parsed = updateTaskSchema.parse(body);

  const task = await updateTask({
    taskId: params.id,
    userId: auth.sub,
    role: auth.role,
    title: parsed.title ? sanitizeText(parsed.title) : undefined,
    description: parsed.description ? sanitizeText(parsed.description) : undefined,
    status: parsed.status,
  });

  return ok(task, 200);
});

export const DELETE = withHandler<ParamsContext>(async (request, context) => {
  const auth = requireAccessAuth(request);
  requireAnyRole(["USER", "ADMIN"], auth.role);

  const params = idParamSchema.parse(await context.params);

  await deleteTask({
    taskId: params.id,
    userId: auth.sub,
    role: auth.role,
  });

  return ok({ message: "Task deleted" }, 200);
});
