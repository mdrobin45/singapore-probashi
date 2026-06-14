import { prisma } from "@/lib/prisma";
import { CreateProjectForm } from "./create-form";
import { ResellActions } from "./resell-actions";

async function getData() {
  const [projects, pendingListings, pendingTrades] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { fullName: true } },
        _count: { select: { shares: true, purchaseRequests: true } },
      },
    }),
    prisma.shareListing.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { fullName: true, email: true, phone: true } },
        project: { select: { name: true, sharePrice: true } },
      },
    }),
    prisma.shareTrade.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        buyer: { select: { fullName: true, email: true, phone: true } },
        listing: {
          include: {
            seller: { select: { fullName: true } },
            project: { select: { name: true } },
          },
        },
      },
    }),
  ]);
  return { projects, pendingListings, pendingTrades };
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  COMPLETED: "bg-blue-100 text-blue-700",
};

export default async function AdminSharesPage() {
  const { projects, pendingListings, pendingTrades } = await getData();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Share Management</h1>
        <p className="text-sm text-muted-foreground">
          {projects.length} projects · {pendingListings.length} pending resell listings · {pendingTrades.length} pending trades
        </p>
      </div>

      {/* Pending resell listings */}
      {pendingListings.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-amber-50">
            <h2 className="font-semibold text-amber-800">
              Pending Resell Listings ({pendingListings.length})
            </h2>
            <p className="text-xs text-amber-700 mt-0.5">Review and approve or reject member resell requests</p>
          </div>
          <div className="divide-y divide-border">
            {pendingListings.map((l) => (
              <div key={l.id} className="px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{l.project.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Seller: {l.seller.fullName} · {l.seller.email} · {l.seller.phone}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span>Qty: <strong className="text-foreground">{l.quantity}</strong></span>
                      <span>Asking: <strong className="text-foreground">S${Number(l.askingPrice).toFixed(2)}</strong></span>
                      <span>Market: <strong className="text-foreground">S${Number(l.project.sharePrice).toFixed(2)}</strong></span>
                      <span>Total: <strong className="text-foreground">S${(l.quantity * Number(l.askingPrice)).toFixed(2)}</strong></span>
                    </div>
                  </div>
                  <ResellActions listingId={l.id} type="listing" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending trades */}
      {pendingTrades.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-blue-50">
            <h2 className="font-semibold text-blue-800">
              Pending Secondary Market Trades ({pendingTrades.length})
            </h2>
            <p className="text-xs text-blue-700 mt-0.5">Approve to transfer shares from seller to buyer</p>
          </div>
          <div className="divide-y divide-border">
            {pendingTrades.map((t) => (
              <div key={t.id} className="px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{t.listing.project.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Buyer: {t.buyer.fullName} · {t.buyer.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Seller: {t.listing.seller.fullName}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs">
                      <span>Qty: <strong className="text-foreground">{t.quantity}</strong></span>
                      <span>Total: <strong className="text-foreground">S${Number(t.totalAmount).toFixed(2)}</strong></span>
                      <span>Method: <strong className="text-foreground">{t.paymentMethod}</strong></span>
                      {t.txId && <span>TXN: <strong className="text-foreground font-mono">{t.txId}</strong></span>}
                    </div>
                  </div>
                  <ResellActions tradeId={t.id} type="trade" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects + create form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-foreground">All Projects</h2>
          {projects.map((p) => {
            const soldPct = Math.round(((p.totalShares - p.availableShares) / p.totalShares) * 100);
            return (
              <div key={p.id} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[p.status]}`}>
                    {p.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center mb-3">
                  <div>
                    <p className="font-bold text-foreground">S${Number(p.sharePrice).toFixed(0)}</p>
                    <p className="text-[11px] text-muted-foreground">Price</p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{p.totalShares}</p>
                    <p className="text-[11px] text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{p.availableShares}</p>
                    <p className="text-[11px] text-muted-foreground">Available</p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{p._count.purchaseRequests}</p>
                    <p className="text-[11px] text-muted-foreground">Requests</p>
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: `${soldPct}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                  <span>{soldPct}% sold</span>
                  <span>by {p.createdBy.fullName}</span>
                </div>
              </div>
            );
          })}
          {projects.length === 0 && (
            <div className="bg-white rounded-xl border border-border p-10 text-center text-muted-foreground text-sm">
              No projects yet. Create one using the form.
            </div>
          )}
        </div>
        <div>
          <CreateProjectForm />
        </div>
      </div>
    </div>
  );
}
