import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { todayDate } from "@/lib/pick-put";
import { DIRECTION_LABELS, formatTravelDate, roundKg } from "@/lib/pick-put-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookingForm } from "./booking-form";

export default async function PickPutTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [trip, session] = await Promise.all([
    prisma.pickPutTrip.findUnique({
      where: { id },
      include: { traveler: { select: { fullName: true } } },
    }),
    getSession(),
  ]);
  if (!trip || trip.status !== "OPEN") notFound();

  const wallet = session
    ? await prisma.wallet.findUnique({ where: { userId: session.userId }, select: { balance: true } })
    : null;
  const remaining = roundKg(Number(trip.totalKg) - Number(trip.bookedKg));
  const bookable = remaining > 0 && trip.travelDate >= todayDate();

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/pick-put" className="hover:text-brand transition-colors">Pick & Put</Link>
          <span>/</span>
          <span className="text-foreground">Book Space</span>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 mb-5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-50 text-brand">
            {DIRECTION_LABELS[trip.direction]}
          </span>
          <h1 className="text-xl font-bold text-foreground mt-3">{trip.traveler.fullName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Travelling {formatTravelDate(trip.travelDate)}
            {trip.flightInfo ? ` · ✈️ ${trip.flightInfo}` : ""}
          </p>
          {trip.notes && <p className="text-sm text-foreground mt-3 whitespace-pre-line">{trip.notes}</p>}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Space left</p>
              <p className="font-bold text-foreground">{remaining} kg</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Rate</p>
              <p className="font-bold text-foreground">৳{Number(trip.ratePerKg).toFixed(2)}/kg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          {!session ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">Log in to book space on this trip.</p>
              <Link href="/login" className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
                Login
              </Link>
            </div>
          ) : session.userId === trip.travelerId ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              This is your trip. Manage its bookings from <Link href="/pick-put/my" className="text-brand font-semibold">My Pick & Put</Link>.
            </p>
          ) : !bookable ? (
            <p className="text-sm text-muted-foreground text-center py-4">This trip is no longer taking bookings.</p>
          ) : (
            <BookingForm
              tripId={trip.id}
              ratePerKg={Number(trip.ratePerKg)}
              remainingKg={remaining}
              balance={wallet ? Number(wallet.balance) : 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}
