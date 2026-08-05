// Edge-safe — no prisma import. Shared between middleware.ts (sets the
// cookie from a ?ref= link visit) and app/actions/auth.ts (reads it on
// signup/login to attach the permanent referrer via lib/commission.ts).
export const REFERRAL_COOKIE_NAME = "sp_ref";
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 3; // 3 days
