import { SignJWT, jwtVerify } from "jose";

// Edge-runtime-safe session token helpers — no `prisma`/`next/headers` imports
// here. middleware.ts runs on the Edge runtime and can only ever import from
// this file, never from lib/session.ts (which touches the database via a
// Node-only `pg` TCP driver that Edge can't run).

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret-change-in-production-32chars!!"
);

export const COOKIE_NAME = "sp_session";

// How long a session may sit idle before it's dead, regardless of "remember me".
// Refreshed on every request (see middleware.ts) as long as the user is active —
// this is what actually enforces "logged out after a few minutes of inactivity".
export const INACTIVITY_SECONDS = 10 * 60; // 10 minutes

export type SessionPayload = {
  userId: string;
  role: string;
  email: string;
  fullName: string;
};

export type TokenClaims = SessionPayload & { absExp: number };

export async function signSessionToken(claims: TokenClaims, maxAge: number): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(now + maxAge)
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<TokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as TokenClaims;
  } catch {
    return null;
  }
}

// Re-signs a still-valid token with a fresh sliding expiry, capped at the
// original absolute session lifetime. Pure JWT operation (no DB access) so it's
// safe to call from middleware. Returns null if the token is missing/invalid/
// expired/past its absolute cap — callers should just leave the cookie alone in
// that case (it'll stop working on its own).
export async function refreshSessionToken(token: string): Promise<{ token: string; maxAge: number } | null> {
  const claims = await verifySessionToken(token);
  if (!claims?.absExp) return null;

  const now = Math.floor(Date.now() / 1000);
  if (now >= claims.absExp) return null;

  const maxAge = Math.min(INACTIVITY_SECONDS, claims.absExp - now);
  const newToken = await signSessionToken(claims, maxAge);
  return { token: newToken, maxAge };
}
