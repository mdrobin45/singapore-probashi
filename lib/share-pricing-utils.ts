// Client-safe — no prisma import. See lib/share-pricing.ts for the server-only rate lookup.
export function sgdToBdt(sgdAmount: number, rate: number): number {
  return Math.round(sgdAmount * rate * 100) / 100;
}
