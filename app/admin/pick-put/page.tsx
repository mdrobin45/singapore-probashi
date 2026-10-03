import { prisma } from "@/lib/prisma";
import { resolvePickPutRate, todayDate } from "@/lib/pick-put";
import {
  BOOKING_STATUS_STYLES,
  DIRECTION_LABELS,
  formatTravelDate,
  roundKg,
} from "@/lib/pick-put-utils";
import { BookingSettlement, CloseTrip, DeleteRate, RateForm, TripApproval } from "./admin-actions";

async function getData() {
  const [rates, pendingTrips, openTrips, activeBookings, recentSettled] = await Promise.all([
    prisma.pickPutRate.findMany({ orderBy: [{ startDate: "desc" }, { createdAt: "desc" }] }),
    prisma.pickPutTrip.findMany({
      where: { status: "PENDING" },
      orderBy: { travelDate: "asc" },
      include: { traveler: { select: { fullName: true, email: true, phone: true } } },
    }),
    prisma.pickPutTrip.findMany({
      where: { status: "OPEN" },
      orderBy: { travelDate: "asc" },
      include: { traveler: { select: { fullName: true } } },
    }),
    prisma.pickPutBooking.findMany({
      where: { status: { in: ["PENDING", "ACCEPTED"] } },
      orderBy: { createdAt: "asc" },
      include: {
        customer: { select: { fullName: true, phone: true } },
        trip: { include: { traveler: { select: { fullName: true, phone: true } } } },
      },
    }),
    prisma.pickPutBooking.findMany({
      where: { status: { in: ["DELIVERED", "REJECTED", "CANCELLED"] } },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        customer: { select: { fullName: true } },
        trip: { include: { traveler: { select: { fullName: true } } } },
      },
    }),
  ]);

  // Pre-fill each pending trip's approval with its locked rate, or the
  // current admin rate for its date if none was set when it was submitted.
  const suggestedRates = await Promise.all(
    pendingTrips.map(async (t) => Number(t.ratePerKg) || (await resolvePickPutRate(t.travelDate, t.direction)) || 0)
  );

  return { rates, pendingTrips, openTrips, activeBookings, recentSettled, suggestedRates };
}

const CARD = "bg-white rounded-xl border border-border overflow-hidden";

export default async function AdminPickPutPage() {
  const { rates, pendingTrips, openTrips, activeBookings, recentSettled, suggestedRates } = await getData();
  const today = todayDate();
  const heldAmount = activeBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pick & Put</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {pendingTrips.length} trips awaiting approval · {openTrips.length} open trips · {activeBookings.length} active bookings ·
          ৳{heldAmount.toFixed(2)} held in escrow
        </p>
      </div>

      {/* Rates */}
      <div className={CARD}>
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Per-kg Rates by Date</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            New trips lock the rate covering their travel date. When ranges overlap, the most recently added rate wins.
          </p>
        </div>
        <div className="p-6 space-y-5">
          <RateForm />
          {rates.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-semibold">Route</th>
                    <th className="py-2 pr-4 font-semibold">Dates</th>
                    <th className="py-2 pr-4 font-semibold">Rate</th>
                    <th className="py-2 pr-4 font-semibold">Note</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rates.map((r) => (
                    <tr key={r.id} className={r.endDate < today ? "opacity-50" : ""}>
                      <td className="py-2.5 pr-4">{r.direction ? DIRECTION_LABELS[r.direction] : "Both ways"}</td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        {formatTravelDate(r.startDate)} – {formatTravelDate(r.endDate)}
                      </td>
                      <td className="py-2.5 pr-4 font-semibold">৳{Number(r.ratePerKg).toFixed(2)}/kg</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{r.note ?? "—"}</td>
                      <td className="py-2.5 text-right"><DeleteRate rateId={r.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pending trips */}
      {pendingTrips.length > 0 && (
        <div className={CARD}>
          <div className="px-6 py-4 border-b border-border bg-amber-50">
            <h2 className="font-semibold text-amber-800">Trips Awaiting Approval ({pendingTrips.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {pendingTrips.map((t, i) => (
              <div key={t.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{t.traveler.fullName}</p>
                  <p className="text-xs text-muted-foreground">{t.traveler.email} · {t.traveler.phone ?? "no phone"}</p>
                  <p className="text-sm text-foreground mt-2">
                    {DIRECTION_LABELS[t.direction]} · {formatTravelDate(t.travelDate)} · {Number(t.totalKg)} kg
                    {t.flightInfo ? ` · ${t.flightInfo}` : ""}
                  </p>
                  {t.notes && <p className="text-xs text-muted-foreground mt-1">{t.notes}</p>}
                </div>
                <TripApproval tripId={t.id} suggestedRate={suggestedRates[i]} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active bookings */}
      <div className={CARD}>
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Active Bookings ({activeBookings.length})</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Money is held until you mark a booking delivered (paid to the traveler) or reject it (refunded to the customer).
          </p>
        </div>
        {activeBookings.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">No active bookings.</p>
        ) : (
          <div className="divide-y divide-border">
            {activeBookings.map((b) => (
              <div key={b.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${BOOKING_STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                    <p className="font-semibold text-foreground text-sm">
                      {Number(b.weightKg)} kg · ৳{Number(b.totalAmount).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {b.customer.fullName} ({b.customer.phone ?? "no phone"}) → traveler {b.trip.traveler.fullName} ({b.trip.traveler.phone ?? "no phone"})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {DIRECTION_LABELS[b.trip.direction]} · {formatTravelDate(b.trip.travelDate)}
                  </p>
                  <p className="text-sm text-foreground mt-1">{b.itemDescription}</p>
                  <p className="text-xs text-muted-foreground">
                    Receiver: {b.receiverName} · {b.receiverPhone}
                    {b.receiverAddress ? ` · ${b.receiverAddress}` : ""}
                  </p>
                </div>
                <BookingSettlement bookingId={b.id} status={b.status as "PENDING" | "ACCEPTED"} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open trips */}
      <div className={CARD}>
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Open Trips ({openTrips.length})</h2>
        </div>
        {openTrips.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">No open trips.</p>
        ) : (
          <div className="divide-y divide-border">
            {openTrips.map((t) => (
              <div key={t.id} className="px-6 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-foreground">
                    {t.traveler.fullName} · {DIRECTION_LABELS[t.direction]} · {formatTravelDate(t.travelDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {roundKg(Number(t.bookedKg))} / {Number(t.totalKg)} kg booked · ৳{Number(t.ratePerKg).toFixed(2)}/kg
                    {t.travelDate < today ? " · travel date passed" : ""}
                  </p>
                </div>
                <CloseTrip tripId={t.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently settled */}
      {recentSettled.length > 0 && (
        <div className={CARD}>
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Recently Settled</h2>
          </div>
          <div className="divide-y divide-border">
            {recentSettled.map((b) => (
              <div key={b.id} className="px-6 py-3 flex items-center justify-between gap-4 text-sm">
                <p className="text-foreground min-w-0">
                  {b.customer.fullName} → {b.trip.traveler.fullName} · {Number(b.weightKg)} kg · ৳{Number(b.totalAmount).toFixed(2)}
                </p>
                <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${BOOKING_STATUS_STYLES[b.status]}`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
