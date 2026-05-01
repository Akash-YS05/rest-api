import { NextResponse } from "next/server";

export const ok = <T>(data: T, status = 200): NextResponse => {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
};

export const fail = (status: number, code: string, message: string, details?: unknown): NextResponse => {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
};
