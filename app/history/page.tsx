import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

const STATUS_BADGES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-green-100 text-green-700",
  APPROVED: "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
  PAID: "bg-green-100 text-green-700",
  PROOF_SUBMITTED: "bg-blue-100 text-blue-700",
  AWAITING_PAYMENT: "bg-amber-100 text-amber-700",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { tab = "all" } = await searchParams;

  const [sharePurchases, shareTrades, shareListings, taxiRequests, airTickets, wallet, checkouts] =
    await Promise.all([
      prisma.sharePurchaseRequest.findMany({
        where: { buyerId: session.userId },
        orderBy: { createdAt: "desc" },
        include: { project: { select: { name: true } } },
      }),
      prisma.shareTrade.findMany({
        where: { buyerId: session.userId },
        orderBy: { createdAt: "desc" },
        include: { listing: { include: { project: { select: { name: true } } } } },
      }),
      prisma.shareListing.findMany({
        where: { sellerId: session.userId },
        orderBy: { createdAt: "desc" },
        include: { project: { select: { name: true } } },
      }),
      prisma.taxiRequest.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        include: { assignedVendor: true },
      }),
      prisma.airTicketRequest.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.wallet.findUnique({
        where: { userId: session.userId },
        include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
      }),
      prisma.checkout.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
    ]);

  const tabs = [
    { id: "all", label: "Overview" },
    { id: "shares", label: `Shares (${sharePurchases.length + shareTrades.length})` },
    { id: "taxi", label: `Taxi (${taxiRequests.length})` },
    { id: "air", label: `Air Tickets (${airTickets.length})` },
    { id: "wallet", label: `Wallet (${wallet?.transactions.length ?? 0})` },
    { id: "checkouts", label: `Checkouts (${checkouts.length})` },
  ];

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand-50 px-3 py-1 rounded-full mb-1">
              Account Activity
            </span>
            <h1 className="text-2xl font-bold text-foreground">History & Records</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              All your share investments, taxi bookings, flight tickets, checkouts, and wallet transactions in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-border">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <Link
                key={t.id}
                href={`/history?tab=${t.id}`}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-white text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        {/* TAB 1: SHARES */}
        {(tab === "all" || tab === "shares") && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center justify-between">
              <span>📈 Share Investments & Purchases</span>
              <Link href="/shares/my" className="text-xs font-semibold text-brand hover:underline">
                View My Portfolio →
              </Link>
            </h2>

            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3">Project</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Shares</th>
                      <th className="px-4 py-3">Total Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sharePurchases.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20">
                        <td className="px-5 py-3 font-semibold text-foreground">{p.project.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">Primary Purchase</td>
                        <td className="px-4 py-3 font-bold text-foreground">{p.quantity}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">৳{Number(p.totalAmount).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_BADGES[p.status]}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                    {shareTrades.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/20">
                        <td className="px-5 py-3 font-semibold text-foreground">{t.listing.project.name}</td>
                        <td className="px-4 py-3 text-brand font-medium">Secondary Resale</td>
                        <td className="px-4 py-3 font-bold text-foreground">{t.quantity}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">৳{Number(t.totalAmount).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_BADGES[t.status]}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {t.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                    {sharePurchases.length === 0 && shareTrades.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                          No share purchases yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TAXI */}
        {(tab === "all" || tab === "taxi") && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center justify-between">
              <span>🚕 Taxi Bookings</span>
              <Link href="/taxi" className="text-xs font-semibold text-brand hover:underline">
                Book a Taxi →
              </Link>
            </h2>

            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3">Pickup → Destination</th>
                      <th className="px-4 py-3">Ride Date</th>
                      <th className="px-4 py-3">Passengers</th>
                      <th className="px-4 py-3">Assigned Driver</th>
                      <th className="px-4 py-3">Fare</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {taxiRequests.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/20">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-foreground">{t.pickupLocation}</p>
                          <p className="text-muted-foreground text-[11px]">→ {t.destination}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {t.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-foreground">{t.passengerCount}</td>
                        <td className="px-4 py-3">
                          {t.assignedVendor ? (
                            <div>
                              <p className="font-medium text-foreground">{t.assignedVendor.name}</p>
                              <a href={`tel:${t.assignedVendor.phone}`} className="text-brand text-[11px] hover:underline">
                                {t.assignedVendor.phone}
                              </a>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Assigning soon</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {t.price ? `৳${Number(t.price).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_BADGES[t.status]}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {taxiRequests.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                          No taxi bookings yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AIR TICKETS */}
        {(tab === "all" || tab === "air") && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center justify-between">
              <span>✈️ Air Ticket Bookings</span>
              <Link href="/air-ticket" className="text-xs font-semibold text-brand hover:underline">
                Book a Flight →
              </Link>
            </h2>

            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3">Route</th>
                      <th className="px-4 py-3">Airline</th>
                      <th className="px-4 py-3">Travel Date</th>
                      <th className="px-4 py-3">Passengers</th>
                      <th className="px-4 py-3">Fare</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">E-Ticket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {airTickets.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/20">
                        <td className="px-5 py-3 font-semibold text-foreground">
                          {a.origin} → {a.destination}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{a.preferredAirline ?? "Any"}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {a.departDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-foreground">{a.passengers}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {a.price ? `৳${Number(a.price).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_BADGES[a.status]}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {a.ticketUrl ? (
                            <a
                              href={a.ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand bg-brand-50 px-2 py-1 rounded-lg hover:bg-brand hover:text-white transition-colors"
                            >
                              📥 E-Ticket
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">Pending issue</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {airTickets.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                          No air ticket bookings yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WALLET TRANSACTIONS */}
        {(tab === "all" || tab === "wallet") && wallet && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center justify-between">
              <span>💰 Platform Wallet Activity</span>
              <Link href="/dashboard" className="text-xs font-semibold text-brand hover:underline">
                Current Balance: ৳{Number(wallet.balance).toFixed(2)}
              </Link>
            </h2>

            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Balance After</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {wallet.transactions.map((tx) => {
                      const isCredit = ["DEPOSIT", "SHARE_SALE", "REFUND", "COMMISSION", "ADMIN_CREDIT"].includes(tx.type);
                      return (
                        <tr key={tx.id} className="hover:bg-muted/20">
                          <td className="px-5 py-3 font-semibold text-foreground">{tx.type}</td>
                          <td className="px-4 py-3 text-muted-foreground">{tx.description}</td>
                          <td className={`px-4 py-3 font-bold ${isCredit ? "text-green-600" : "text-red-600"}`}>
                            {isCredit ? "+" : "−"}৳{Number(tx.amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-foreground font-mono">
                            ৳{Number(tx.balanceAfter).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {tx.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      );
                    })}
                    {wallet.transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                          No transactions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CHECKOUTS */}
        {(tab === "all" || tab === "checkouts") && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground">
              💳 Checkouts & Invoices
            </h2>

            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3">Items</th>
                      <th className="px-4 py-3">Total Due</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {checkouts.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/20">
                        <td className="px-5 py-3">
                          {c.items.map((it) => (
                            <p key={it.id} className="font-medium text-foreground">
                              {it.description} ({it.quantity}×)
                            </p>
                          ))}
                        </td>
                        <td className="px-4 py-3 font-bold text-foreground">৳{Number(c.totalAmount).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_BADGES[c.status]}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {c.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/pay/${c.token}`}
                            className="text-xs font-semibold text-brand hover:underline"
                          >
                            View Invoice →
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {checkouts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                          No checkouts yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
