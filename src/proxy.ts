import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const needsAuth = protectedRoutes.some((route) => path === route || path.startsWith(`${route}/`));

  if (!needsAuth) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
