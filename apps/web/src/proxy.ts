import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE_SUFFIX = "better-auth.session_token";

const hasSessionCookie = (request: NextRequest): boolean =>
  request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.endsWith(SESSION_COOKIE_SUFFIX) && cookie.value.length > 0
    );

export const proxy = (request: NextRequest) => {
  if (hasSessionCookie(request)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/login", request.url));
};

export const config = {
  matcher: ["/", "/dashboard/:path*", "/doctors/:path*", "/patients/:path*"],
};
