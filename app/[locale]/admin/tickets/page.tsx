import { prisma } from "@/lib/prisma";
import { CreateTicketForm } from "./create-form";

async function getData() {
  const [listings, bookings, referrals] = await Promise.all([
    prisma.airTicketListing.findMany({
      orderBy: { departDate: "asc" },
      include: { _count: { select: { bookings: true, referrals: true } } },
    }),
    prisma.ticketBookingRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        listing: { select: { airline: true, origin: true, destination: true, departDate: true, price: true } },
      },
    }),
    prisma.ticketReferral.findMany({
      orderBy: { bookingCount: "desc" },
      include: {
        referrer: { select: { fullName: true, email: true, phone: true } },
        listing: { select: { airline: true, destination: true, price: true } },
      },
    }),
  ]);
  return { listings, bookings, referrals };
}

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  ARCHIVED: "bg-red-100 text-red-600",
};

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminTicketsPage() {
  const { listings, bookings, referrals } = await getData();
  const totalReferralEarnings = referrals.reduce((s, r) => s + Number(r.totalEarnings), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Air Tickets</h1>
        <p className="text-sm text-muted-foreground">
          {listings.length} listings · {bookings.length} pending bookings · {referrals.length} referral agents
        </p>
      </div>

      {/* Pending bookings */}
      {bookings.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-amber-50">
            <h2 className="font-semibold text-amber-800">Pending Booking Requests ({bookings.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {bookings.map((b) => (
              <div key={b.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{b.user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{b.user.email} · {b.user.phone}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.listing.airline}: {b.listing.origin} → {b.listing.destination} · {fmt(b.listing.departDate)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-foreground">{b.passengers} pax · ৳{Number(b.totalPrice).toFixed(2)}</p>
                  {b.referralCode && (
                    <p className="text-xs text-brand font-semibold">Ref: {b.referralCode}</p>
                  )}
                  {b.notes && <p className="text-xs text-muted-foreground italic">{b.notes}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{fmt(b.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referral Agents */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Referral Agents</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {referrals.length} agents · ৳{totalReferralEarnings.toFixed(2)} total earnings
            </p>
          </div>
        </div>

        {referrals.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            No referral codes yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Agent</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Referral Code</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Listing</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Bookings</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <p className="font-medium text-foreground">{r.referrer.fullName}</p>
                      <p className="text-xs text-muted-foreground">{r.referrer.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-brand-50 text-brand font-mono px-2 py-0.5 rounded">
                        {r.referralCode}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {r.listing.airline}<br />→ {r.listing.destination}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.bookingCount > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {r.bookingCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground text-xs">
                      ৳{Number(r.totalEarnings).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Listings + create form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-foreground">All Listings</h2>
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-foreground">{l.airline}</p>
                  <p className="text-sm text-muted-foreground">{l.origin} → {l.destination}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[l.status]}`}>
                  {l.status}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-xs mt-3">
                <div><p className="font-bold text-foreground">৳{Number(l.price).toFixed(0)}</p><p className="text-muted-foreground">Price</p></div>
                <div><p className="font-bold text-foreground">{l.seats}</p><p className="text-muted-foreground">Seats</p></div>
                <div><p className="font-bold text-foreground">{l._count.bookings}</p><p className="text-muted-foreground">Bookings</p></div>
                <div><p className="font-bold text-foreground">{l._count.referrals}</p><p className="text-muted-foreground">Referrals</p></div>
                <div><p className="font-bold text-foreground">{fmt(l.departDate)}</p><p className="text-muted-foreground">Depart</p></div>
              </div>
            </div>
          ))}
          {listings.length === 0 && (
            <div className="bg-white rounded-xl border border-border p-10 text-center text-muted-foreground text-sm">
              No listings yet. Create one using the form.
            </div>
          )}
        </div>
        <div><CreateTicketForm /></div>
      </div>
    </div>
  );
}
