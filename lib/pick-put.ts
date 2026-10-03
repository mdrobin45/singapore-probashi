import { prisma } from "@/lib/prisma";
import type { TripDirection } from "@/lib/pick-put-utils";

// Today's date as a UTC-midnight Date, comparable with the DATE travelDate column.
export function todayDate(): Date {
  return new Date(new Date().toISOString().slice(0, 10));
}

// The admin-set per-kg rate for a travel date — a direction-specific rate or
// one that covers both. When several ranges overlap, the newest one wins.
// Returns null when admin hasn't set a rate covering that date.
export async function resolvePickPutRate(travelDate: Date, direction: TripDirection): Promise<number | null> {
  const rate = await prisma.pickPutRate.findFirst({
    where: {
      startDate: { lte: travelDate },
      endDate: { gte: travelDate },
      OR: [{ direction }, { direction: null }],
    },
    orderBy: { createdAt: "desc" },
    select: { ratePerKg: true },
  });
  return rate ? Number(rate.ratePerKg) : null;
}
