import type { NextRequest } from "next/server";
import { AppError } from "@/server/lib/error";

export const parseJsonBody = async <T>(request: NextRequest): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AppError(400, "INVALID_JSON", "Request body must be valid JSON");
  }
};
