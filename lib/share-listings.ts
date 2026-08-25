import { prisma } from "@/lib/prisma";

// A share number counts as "locked" while it's sitting in a listing that's
// still awaiting a decision (PENDING) or already live on the secondary
// market (APPROVED) and not yet fully claimed by an approved trade. Once a
// listing is REJECTED, or every one of its numbers has been traded away, its
// numbers free up again.
export async function getLockedShareNumbers(sellerId: string, projectId: string): Promise<Set<number>> {
  const listings = await prisma.shareListing.findMany({
    where: { sellerId, projectId, status: { in: ["PENDING", "APPROVED"] } },
    select: {
      listedShareNumbers: true,
      trades: { where: { status: "APPROVED" }, select: { tradedShareNumbers: true } },
    },
  });

  const locked = new Set<number>();
  for (const listing of listings) {
    const consumed = new Set(listing.trades.flatMap((t) => t.tradedShareNumbers));
    for (const n of listing.listedShareNumbers) {
      if (!consumed.has(n)) locked.add(n);
    }
  }
  return locked;
}

// How many of a listing's shares are still unclaimed by an approved trade —
// what a buyer can actually still purchase from it.
export function getListingRemainingCount(listing: { listedShareNumbers: number[]; quantity: number; trades: { status: string; tradedShareNumbers: number[] }[] }): number {
  const consumed = new Set(
    listing.trades.filter((t) => t.status === "APPROVED").flatMap((t) => t.tradedShareNumbers)
  );
  // Legacy listings with no tracked numbers fall back to the raw quantity.
  if (listing.listedShareNumbers.length === 0) return listing.quantity;
  return listing.listedShareNumbers.filter((n) => !consumed.has(n)).length;
}
