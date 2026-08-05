import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  COOKIE_NAME,
  INACTIVITY_SECONDS,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session-edge";

export type { SessionPayload } from "@/lib/session-edge";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

export async function createSession(payload: SessionPayload, rememberMe = false) {
  const now = Math.floor(Date.now() / 1000);
  const absoluteMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30d or 1d — the hard ceiling
  const absExp = now + absoluteMaxAge;
  const slidingMaxAge = Math.min(INACTIVITY_SECONDS, absoluteMaxAge);

  const token = await signSessionToken({ ...payload, absExp }, slidingMaxAge);

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, cookieOptions(slidingMaxAge));
}

// Verifies the session cookie AND re-checks the user's current role/isActive in
// the database — a JWT claim alone could be stale for the session's whole
// lifetime, so a ban or role change made by an admin now takes effect on the
// user's very next request instead of waiting for the token to expire. Memoized
// per-request since several layouts/pages call this independently in one render.
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const claims = await verifySessionToken(token);
  if (!claims) return null;

  const user = await prisma.user.findUnique({
    where: { id: claims.userId },
    select: { role: true, isActive: true, email: true, fullName: true },
  });
  if (!user || !user.isActive) return null;

  return { userId: claims.userId, role: user.role, email: user.email, fullName: user.fullName };
});

export async function deleteSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
