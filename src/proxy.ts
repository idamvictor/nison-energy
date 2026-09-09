import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic gate only — a valid cookie can still belong to a non-admin or an
// expired session. The real check is `requireAdmin()` in the admin layout and
// the leads route handler (src/lib/auth-dal.ts).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!getSessionCookie(request)) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
