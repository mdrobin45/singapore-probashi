import { prisma } from "@/lib/prisma";

export { sgdToBdt } from "@/lib/share-pricing-utils";

// Always a fixed, admin-set rate — deliberately independent of the general
// currency-converter's rate (lib/currency.ts), which can be switched to a live
// internet-fetched rate. Share pricing must never fluctuate on its own.
export async function getShareSgdRate(): Promise<number> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "share_sgd_rate" } });
    const rate = row ? parseFloat(row.value) : NaN;
    return isNaN(rate) ? 83.5 : rate;
  } catch {
    return 83.5;
  }
}

export async function saveShareSgdRate(rate: number): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: "share_sgd_rate" },
    create: { key: "share_sgd_rate", value: String(rate) },
    update: { value: String(rate) },
  });
}
