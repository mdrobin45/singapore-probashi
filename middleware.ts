import { NextRequest, NextResponse } from "next/server";
import { refreshSessionToken, COOKIE_NAME } from "@/lib/session-edge";
import { REFERRAL_COOKIE_NAME, REFERRAL_COOKIE_MAX_AGE } from "@/lib/referral-constants";

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Capture an agent's referral link (?ref=CODE) on any page. First click
  // wins for the life of the cookie — a later ?ref= visit before signup
  // never overwrites an already-captured code. Actually attaching the
  // referral to the account happens at signup/login, see app/actions/auth.ts.
  const refParam = request.nextUrl.searchParams.get("ref");
  if (refParam && !request.cookies.get(REFERRAL_COOKIE_NAME)?.value) {
    response.cookies.set(REFERRAL_COOKIE_NAME, refParam, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  // Slide the session's inactivity window forward on every active request —
  // this is what actually logs someone out after a few idle minutes: if they
  // stop making requests, the cookie is never refreshed and simply expires.
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    const refreshed = await refreshSessionToken(token);
    if (refreshed) {
      response.cookies.set(COOKIE_NAME, refreshed.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: refreshed.maxAge,
        path: "/",
      });
    }
  }

  return response;
}

export const config = {
  // Match all paths except: API routes, Next.js internals, static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
