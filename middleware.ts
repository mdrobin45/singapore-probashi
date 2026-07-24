import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";
import { refreshSessionToken, COOKIE_NAME } from "@/lib/session-edge";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

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
