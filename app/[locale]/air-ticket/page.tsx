import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getTranslations } from "next-intl/server";
import { BookingForm } from "./booking-form";

async function getListings() {
  return prisma.airTicketListing.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { departDate: "asc" },
    include: {
      _count: { select: { bookings: true } },
    },
  });
}

async function getMyReferrals(userId: string) {
  return prisma.ticketReferral.findMany({
    where: { referrerId: userId },
    include: {
      listing: { select: { airline: true, destination: true, price: true, departDate: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AirTicketPage() {
  const [listings, session, t] = await Promise.all([
    getListings(),
    getSession(),
    getTranslations("airTicket"),
  ]);
  const myReferrals = session ? await getMyReferrals(session.userId) : [];

  return (
    <div className="min-h-screen bg-muted">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand-50 px-3 py-1 rounded-full mb-3">
            {t("badge")}
          </span>
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {listings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {t("noFlights")}
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((l) => (
              <div key={l.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    {/* Flight info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                          <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                        <span className="font-semibold text-foreground">{l.airline}</span>
                        {l.returnDate && (
                          <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">{t("returnBadge")}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">{l.origin.split("(")[1]?.replace(")", "") ?? l.origin}</p>
                          <p className="text-xs text-muted-foreground">{l.origin.split("(")[0]?.trim()}</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex items-center gap-1">
                            <div className="flex-1 h-px bg-border" />
                            <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <div className="flex-1 h-px bg-border" />
                          </div>
                          <p className="text-[11px] text-muted-foreground">{t("direct")}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">{l.destination.split("(")[1]?.replace(")", "") ?? l.destination}</p>
                          <p className="text-xs text-muted-foreground">{l.destination.split("(")[0]?.trim()}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
                        <span>📅 {t("depart")}: <strong className="text-foreground">{formatDate(l.departDate)}</strong></span>
                        {l.returnDate && <span>📅 {t("return")}: <strong className="text-foreground">{formatDate(l.returnDate)}</strong></span>}
                        <span>💺 {t("seatsLeft")}: <strong className="text-foreground">{l.seats}</strong></span>
                        <span>📋 {t("bookings")}: <strong className="text-foreground">{l._count.bookings}</strong></span>
                      </div>
                    </div>

                    {/* Price & book */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-3xl font-bold text-brand">৳{Number(l.price).toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">{t("perPerson")}</p>
                      </div>
                      {session ? (
                        l.seats > 0 ? (
                          <BookingForm listingId={l.id} price={Number(l.price)} airline={l.airline} destination={l.destination} />
                        ) : (
                          <span className="text-xs text-red-500 font-semibold">{t("fullyBooked")}</span>
                        )
                      ) : (
                        <a href="/login" className="bg-brand text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
                          {t("loginToBook")}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">{t("howItWorks.title")}</h3>
          <ol className="space-y-1.5 text-sm text-blue-800">
            <li>1. {t("howItWorks.step1")}</li>
            <li>2. {t("howItWorks.step2")}</li>
            <li>3. {t("howItWorks.step3")}</li>
            <li>4. {t("howItWorks.step4")}</li>
          </ol>
        </div>

        {/* My Referral Codes */}
        {session && myReferrals.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground">{t("referrals.title")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t("referrals.subtitle")}</p>
            </div>
            <div className="divide-y divide-border">
              {myReferrals.map((r) => (
                <div key={r.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.listing.airline} → {r.listing.destination}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("depart")} {formatDate(r.listing.departDate)} · ৳{Number(r.listing.price).toFixed(0)}/{t("perPerson")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{r.bookingCount} {t("bookings")}</p>
                      <p className="text-xs font-semibold text-green-600">৳{Number(r.totalEarnings).toFixed(2)} {t("referrals.earned")}</p>
                    </div>
                    <code className="text-sm font-mono font-bold text-brand bg-brand-50 border border-brand/20 px-3 py-1.5 rounded-lg">
                      {r.referralCode}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
