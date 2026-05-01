import type { NextRequest } from "next/server";
import { logger } from "@/server/lib/logger";
import { toErrorResponse } from "@/server/http/errors";

type DefaultContext = {
  params: Promise<Record<string, string | string[] | undefined>>;
};

type HandlerWithContext<TParams> = (request: NextRequest, context: TParams) => Promise<Response>;
type HandlerWithoutContext = (request: NextRequest) => Promise<Response>;

export function withHandler<TParams extends DefaultContext>(
  handler: HandlerWithContext<TParams>
): (request: NextRequest, context: TParams) => Promise<Response>;

export function withHandler(
  handler: HandlerWithoutContext
): (request: NextRequest, context: DefaultContext) => Promise<Response>;

export function withHandler<TParams extends DefaultContext>(
  handler: HandlerWithContext<TParams> | HandlerWithoutContext
) {
  return async (request: NextRequest, context: TParams): Promise<Response> => {
    const start = Date.now();

    try {
      const response =
        handler.length >= 2
          ? await (handler as HandlerWithContext<TParams>)(request, context)
          : await (handler as HandlerWithoutContext)(request);

      logger.info(
        {
          method: request.method,
          path: request.nextUrl.pathname,
          statusCode: response.status,
          durationMs: Date.now() - start,
        },
        "API request completed"
      );

      return response;
    } catch (error) {
      const response = toErrorResponse(error);
      logger.warn(
        {
          method: request.method,
          path: request.nextUrl.pathname,
          statusCode: response.status,
          durationMs: Date.now() - start,
        },
        "API request failed"
      );

      return response;
    }
  };
};
