import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { todayDate } from "@/lib/pick-put";
import { DIRECTION_LABELS, formatTravelDate, roundKg, type TripDirection } from "@/lib/pick-put-utils";
import Link from "next/link";

async function getOpenTrips(direction?: TripDirection) {
  return prisma.pickPutTrip.findMany({
    where: {
      status: "OPEN",
      travelDate: { gte: todayDate() },
      ...(direction ? { direction } : {}),
    },
    orderBy: { travelDate: "asc" },
    include: { traveler: { select: { fullName: true } } },
  });
}

export default async function PickPutPage({
  searchParams,
}: {
  searchParams: Promise<{ direction?: string }>;
}) {
  const { direction: rawDirection } = await searchParams;
  const direction = rawDirection === "SG_TO_BD" || rawDirection === "BD_TO_SG" ? rawDirection : undefined;
  const [trips, session] = await Promise.all([getOpenTrips(direction), getSession()]);

  const filters = [
    { label: "All Trips", value: undefined },
    { label: "SG → BD", value: "SG_TO_BD" },
    { label: "BD → SG", value: "BD_TO_SG" },
  ] as const;

  return (
    <div className="min-h-screen bg-muted">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand-50 px-3 py-1 rounded-full mb-3">
                Pick & Put
              </span>
              <h1 className="text-3xl font-bold text-foreground">Send Items with a Traveler</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Probashis flying between Singapore and Bangladesh share their spare luggage space. Book the kg you need,
                pay from your wallet, and your money is held safely until delivery.
              </p>
            </div>
            {session ? (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/pick-put/my"
                  className="bg-muted text-foreground text-sm font-semibold px-4 py-2.5 rounded-xl border border-border hover:bg-muted/80 transition-colors"
                >
                  My Pick & Put
                </Link>
                <Link
                  href="/pick-put/new"
                  className="bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
                >
                  + I&apos;m Travelling
                </Link>
              </div>
            ) : (
              <Link href="/login" className="shrink-0 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
                Login to Book or Offer Space
              </Link>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mt-5">
            {filters.map((f) => (
              <Link
                key={f.label}
                href={f.value ? `/pick-put?direction=${f.value}` : "/pick-put"}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors ${
                  direction === f.value
                    ? "bg-brand text-white border-brand"
                    : "border-border text-muted-foreground hover:border-brand hover:text-brand"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🧳</div>
            <p className="text-lg font-semibold text-foreground mb-2">No upcoming trips yet</p>
            <p className="text-muted-foreground text-sm mb-5">Travelling soon with spare luggage space? Offer it and earn.</p>
            {session && (
              <Link href="/pick-put/new" className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
                + Offer Space
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((trip) => {
              const remaining = roundKg(Number(trip.totalKg) - Number(trip.bookedKg));
              return (
                <div key={trip.id} className="bg-white rounded-2xl border border-border p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-50 text-brand">
                      {DIRECTION_LABELS[trip.direction]}
                    </span>
                    <span className="text-xs font-semibold text-foreground whitespace-nowrap">{formatTravelDate(trip.travelDate)}</span>
                  </div>
                  <p className="font-semibold text-foreground">{trip.traveler.fullName}</p>
                  {trip.flightInfo && <p className="text-xs text-muted-foreground mt-0.5">✈️ {trip.flightInfo}</p>}
                  {trip.notes && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{trip.notes}</p>}

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Space left</p>
                      <p className="font-bold text-foreground">{remaining > 0 ? `${remaining} kg` : "Full"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Rate</p>
                      <p className="font-bold text-foreground">৳{Number(trip.ratePerKg).toFixed(2)}/kg</p>
                    </div>
                  </div>

                  {remaining > 0 && session?.userId !== trip.travelerId ? (
                    <Link
                      href={`/pick-put/${trip.id}`}
                      className="mt-4 text-center bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
                    >
                      Book Space
                    </Link>
                  ) : (
                    <p className="mt-4 text-center text-xs text-muted-foreground py-2.5">
                      {remaining > 0 ? "This is your trip" : "No space left"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800 space-y-1.5">
          <p className="font-semibold">How Pick & Put works</p>
          <ol className="space-y-1 text-xs text-blue-700 list-decimal list-inside">
            <li>A traveler posts their flight and how many spare kg they can carry. Admin approves it and sets the per-kg rate for that date.</li>
            <li>You book the kg you need — the cost is paid from your wallet and held by the platform.</li>
            <li>The traveler accepts, you hand over your items, and they deliver to your receiver.</li>
            <li>Once delivery is confirmed, the traveler is paid. If a booking is rejected or cancelled, you get a full refund.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
