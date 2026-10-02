// Client-safe — no prisma import. See lib/share-pricing.ts for the server-only rate lookup.
export function sgdToBdt(sgdAmount: number, rate: number): number {
  return Math.round(sgdAmount * rate * 100) / 100;
}

// A ShareCertificate's own priceSgd overrides the project's base price when set.
export function effectiveShareCertPrice(certPriceSgd: number | null, projectSharePriceSgd: number): number {
  return certPriceSgd ?? projectSharePriceSgd;
}
