import { ZodError } from "zod";
import { AppError } from "@/server/lib/error";
import { fail } from "@/server/http/response";
import { logger } from "@/server/lib/logger";

export const toErrorResponse = (error: unknown) => {
  if (error instanceof AppError) {
    return fail(error.statusCode, error.code, error.message, error.details);
  }

  if (error instanceof ZodError) {
    return fail(400, "VALIDATION_ERROR", "Validation failed", error.flatten());
  }

  const errorRecord = error as Record<string, unknown>;

  if (
    errorRecord &&
    typeof errorRecord === "object" &&
    "code" in errorRecord &&
    errorRecord.code === "P2002"
  ) {
    return fail(409, "DUPLICATE_RESOURCE", "Resource already exists");
  }

  logger.error({ error }, "Unhandled API error");
  return fail(500, "INTERNAL_SERVER_ERROR", "Something went wrong");
};
