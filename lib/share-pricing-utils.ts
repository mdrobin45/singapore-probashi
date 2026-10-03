// Client-safe — no prisma import. See lib/share-pricing.ts for the server-only rate lookup.
export function sgdToBdt(sgdAmount: number, rate: number): number {
  return Math.round(sgdAmount * rate * 100) / 100;
}

// A ShareCertificate's own priceSgd overrides the project's base price when set.
export function effectiveShareCertPrice(certPriceSgd: number | null, projectSharePriceSgd: number): number {
  return certPriceSgd ?? projectSharePriceSgd;
}

// Share 4 buy-request offer amounts (BDT): ৳100 to ৳5,000 in steps of ৳100.
// The form only offers these and the server rejects anything else.
export const SHARE4_AMOUNTS: number[] = Array.from({ length: 50 }, (_, i) => (i + 1) * 100);
