import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { waLink } from "@/lib/whatsapp";
import {
  BOOKING_STATUS_STYLES,
  DIRECTION_LABELS,
  TRIP_STATUS_STYLES,
  formatTravelDate,
  roundKg,
} from "@/lib/pick-put-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CancelBookingButton, CloseTripButton, TravelerBookingButtons } from "./booking-buttons";

export default async function MyPickPutPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [trips, bookings] = await Promise.all([
    prisma.pickPutTrip.findMany({
      where: { travelerId: session.userId },
      orderBy: { travelDate: "desc" },
      include: {
        bookings: {
          orderBy: { createdAt: "desc" },
          include: { customer: { select: { fullName: true, phone: true } } },
        },
      },
    }),
    prisma.pickPutBooking.findMany({
      where: { customerId: session.userId },
      orderBy: { createdAt: "desc" },
      include: { trip: { include: { traveler: { select: { fullName: true, phone: true } } } } },
    }),
  ]);

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href="/pick-put" className="hover:text-brand transition-colors">Pick & Put</Link>
              <span>/</span>
              <span className="text-foreground">Mine</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">My Pick & Put</h1>
          </div>
          <Link href="/pick-put/new" className="shrink-0 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
            + Offer Space
          </Link>
        </div>

        {/* Bookings I made (Put) */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Items I&apos;m Sending ({bookings.length})
          </h2>
          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
              No bookings yet. <Link href="/pick-put" className="text-brand font-semibold">Find a traveler</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-border p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">
                        {Number(b.weightKg)} kg with {b.trip.traveler.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {DIRECTION_LABELS[b.trip.direction]} · {formatTravelDate(b.trip.travelDate)}
                        {b.trip.flightInfo ? ` · ${b.trip.flightInfo}` : ""}
                      </p>
                      <p className="text-sm text-foreground mt-2">{b.itemDescription}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        To: {b.receiverName} · {b.receiverPhone}
                        {b.receiverAddress ? ` · ${b.receiverAddress}` : ""}
                      </p>
                      {b.adminNote && <p className="text-xs text-muted-foreground mt-1">Note: {b.adminNote}</p>}
                    </div>
                    <div className="sm:text-right shrink-0 space-y-2">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${BOOKING_STATUS_STYLES[b.status]}`}>
                        {b.status}
                      </span>
                      <p className="font-bold text-foreground">৳{Number(b.totalAmount).toFixed(2)}</p>
                      {b.status === "PENDING" && <CancelBookingButton bookingId={b.id} />}
                      {b.status === "ACCEPTED" && b.trip.traveler.phone && (
                        <a
                          href={waLink(b.trip.traveler.phone, `Hi ${b.trip.traveler.fullName}, about my ${Number(b.weightKg)} kg Pick & Put booking for ${formatTravelDate(b.trip.travelDate)}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100"
                        >
                          WhatsApp Traveler
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trips I offered (Pick) */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            My Trips ({trips.length})
          </h2>
          {trips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
              Travelling soon? <Link href="/pick-put/new" className="text-brand font-semibold">Offer your spare space</Link> and earn.
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => {
                const earned = trip.bookings
                  .filter((b) => b.status === "DELIVERED")
                  .reduce((sum, b) => sum + Number(b.totalAmount), 0);
                return (
                  <div key={trip.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {DIRECTION_LABELS[trip.direction]} · {formatTravelDate(trip.travelDate)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {roundKg(Number(trip.bookedKg))} / {Number(trip.totalKg)} kg booked · ৳{Number(trip.ratePerKg).toFixed(2)}/kg
                          {earned > 0 ? ` · ৳${earned.toFixed(2)} earned` : ""}
                        </p>
                        {trip.adminNote && <p className="text-xs text-muted-foreground mt-1">Admin: {trip.adminNote}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${TRIP_STATUS_STYLES[trip.status]}`}>
                          {trip.status}
                        </span>
                        {trip.status === "OPEN" && <CloseTripButton tripId={trip.id} />}
                      </div>
                    </div>
                    {trip.bookings.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-muted-foreground">No bookings yet.</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {trip.bookings.map((b) => (
                          <div key={b.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">
                                {Number(b.weightKg)} kg from {b.customer.fullName} · ৳{Number(b.totalAmount).toFixed(2)}
                              </p>
                              <p className="text-sm text-foreground mt-1">{b.itemDescription}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Deliver to: {b.receiverName} · {b.receiverPhone}
                                {b.receiverAddress ? ` · ${b.receiverAddress}` : ""}
                              </p>
                            </div>
                            <div className="flex flex-col sm:items-end gap-2 shrink-0">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${BOOKING_STATUS_STYLES[b.status]}`}>
                                {b.status}
                              </span>
                              {b.status === "PENDING" && <TravelerBookingButtons bookingId={b.id} />}
                              {b.status === "ACCEPTED" && b.customer.phone && (
                                <a
                                  href={waLink(b.customer.phone, `Hi ${b.customer.fullName}, about your ${Number(b.weightKg)} kg Pick & Put booking on my ${formatTravelDate(trip.travelDate)} trip.`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100"
                                >
                                  WhatsApp Customer
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            You&apos;re paid into your wallet once admin confirms each delivery.
          </p>
        </section>
      </div>
    </div>
  );
}
