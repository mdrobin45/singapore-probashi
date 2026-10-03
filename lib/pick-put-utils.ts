// Client-safe — no prisma import. See lib/pick-put.ts for the server side.

export type TripDirection = "SG_TO_BD" | "BD_TO_SG";

export const DIRECTION_LABELS: Record<TripDirection, string> = {
  SG_TO_BD: "Singapore → Bangladesh",
  BD_TO_SG: "Bangladesh → Singapore",
};

export const TRIP_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  OPEN: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
  REJECTED: "bg-red-100 text-red-700",
};

export const BOOKING_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

// Travel dates are stored as plain DATE columns (UTC midnight), so they must
// be formatted in UTC or they can shift a day in a viewer's local timezone.
export function formatTravelDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function roundKg(kg: number): number {
  return Math.round(kg * 100) / 100;
}

export function bookingTotal(weightKg: number, ratePerKg: number): number {
  return Math.round(weightKg * ratePerKg * 100) / 100;
}
