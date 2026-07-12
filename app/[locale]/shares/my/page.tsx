import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";

async function getMyShareData(userId: string) {
  const [ownerships, purchases, listings] = await Promise.all([
    prisma.shareOwnership.findMany({
      where: { ownerId: userId },
      orderBy: { acquiredAt: "desc" },
      include: { project: { select: { name: true, sharePrice: true, status: true } } },
    }),
    prisma.sharePurchaseRequest.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: "desc" },
      include: { project: { select: { name: true, sharePrice: true } } },
    }),
    prisma.shareListing.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      include: { project: { select: { name: true } } },
    }),
  ]);
  return { ownerships, purchases, listings };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function MySharesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { ownerships, purchases, listings } = await getMyShareData(session.userId);

  const totalValue = ownerships.reduce(
    (sum, o) => sum + o.quantity * Number(o.project.sharePrice),
    0
  );
  const totalShares = ownerships.reduce((sum, o) => sum + o.quantity, 0);
  const pendingCount = purchases.filter((p) => p.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Share Investments</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalShares} shares across {ownerships.length} projects · ৳{totalValue.toFixed(2)} value
              </p>
            </div>
            <Link
              href="/shares"
              className="shrink-0 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
            >
              Browse Projects
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-muted rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground">Portfolio Value</p>
              <p className="text-lg font-bold text-foreground">৳{totalValue.toFixed(0)}</p>
            </div>
            <div className="bg-muted rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground">Total Shares</p>
              <p className="text-lg font-bold text-foreground">{totalShares}</p>
            </div>
            <div className="bg-muted rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground">Pending Requests</p>
              <p className="text-lg font-bold text-foreground">{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Owned Shares */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Owned Shares ({ownerships.length})
          </h2>
          {ownerships.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <p className="text-muted-foreground text-sm mb-4">You don&apos;t own any shares yet.</p>
              <Link
                href="/shares"
                className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
              >
                Browse Projects
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Project</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Shares</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Price/Share</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Value</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ownerships.map((o) => (
                      <tr key={o.id} className="hover:bg-muted/30">
                        <td className="px-5 py-3.5 font-medium text-foreground">{o.project.name}</td>
                        <td className="px-4 py-3.5 text-foreground">{o.quantity}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">৳{Number(o.project.sharePrice).toFixed(0)}</td>
                        <td className="px-4 py-3.5 font-semibold text-foreground">
                          ৳{(o.quantity * Number(o.project.sharePrice)).toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Link
                            href={`/shares/resell?ownershipId=${o.id}`}
                            className="text-xs font-semibold text-brand border border-brand/30 px-2.5 py-1 rounded-lg hover:bg-brand hover:text-white transition-colors"
                          >
                            List for Sale
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Purchase Requests */}
        {purchases.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Purchase History ({purchases.length})
            </h2>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Project</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Qty</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Amount</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {purchases.map((p) => (
                      <tr key={p.id} className={`hover:bg-muted/30 ${p.status === "REJECTED" ? "opacity-60" : ""}`}>
                        <td className="px-5 py-3.5 font-medium text-foreground">{p.project.name}</td>
                        <td className="px-4 py-3.5 text-foreground">{p.quantity}</td>
                        <td className="px-4 py-3.5 text-foreground">৳{Number(p.totalAmount).toFixed(2)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status] ?? ""}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {p.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* My Listings */}
        {listings.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              My Resell Listings ({listings.length})
            </h2>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Project</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Qty</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Asking Price</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Listed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {listings.map((l) => (
                      <tr key={l.id} className="hover:bg-muted/30">
                        <td className="px-5 py-3.5 font-medium text-foreground">{l.project.name}</td>
                        <td className="px-4 py-3.5 text-foreground">{l.quantity}</td>
                        <td className="px-4 py-3.5 text-foreground">৳{Number(l.askingPrice).toFixed(2)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[l.status] ?? ""}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {l.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
