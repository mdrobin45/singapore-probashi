import { prisma } from "@/lib/prisma";
import { getShareSgdRate, sgdToBdt } from "@/lib/share-pricing";
import { ProcessPurchaseForm } from "./process-form";

async function getPurchaseRequests() {
  return prisma.sharePurchaseRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      buyer: { select: { fullName: true, email: true, nidNumber: true } },
      project: { select: { name: true, sharePriceSgd: true } },
    },
  });
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Bank",
  BKASH: "bKash",
  NAGAD: "Nagad",
  ROCKET: "Rocket",
  WALLET: "Wallet",
};

export default async function AdminPurchasesPage() {
  const [requests, rate] = await Promise.all([getPurchaseRequests(), getShareSgdRate()]);
  const pending = requests.filter((r) => r.status === "PENDING");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Purchase Requests</h1>
          <p className="text-sm text-muted-foreground">
            {pending.length} pending · {requests.length} total
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Buyer</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Project</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Shares</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Payment</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3.5">
                    <p className="font-medium text-foreground">{r.buyer.fullName}</p>
                    <p className="text-xs text-muted-foreground">{r.buyer.email}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{r.buyer.nidNumber}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-foreground max-w-40 truncate">{r.project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${Number(r.project.sharePriceSgd).toFixed(2)} SGD/share
                      <span className="text-muted-foreground/70"> (≈ ৳{sgdToBdt(Number(r.project.sharePriceSgd), rate).toFixed(2)})</span>
                    </p>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-foreground">{r.quantity}</td>
                  <td className="px-4 py-3.5 font-semibold text-foreground">৳{Number(r.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-medium text-muted-foreground">{METHOD_LABELS[r.paymentMethod] ?? r.paymentMethod}</span>
                    {r.txId && (
                      <p className="text-[11px] font-mono text-muted-foreground truncate max-w-28">{r.txId}</p>
                    )}
                    {r.screenshotUrl && (
                      <p className="text-[11px] text-brand font-medium mt-0.5">📎 Screenshot</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                    {r.adminNote && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 max-w-32 truncate">{r.adminNote}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                    {r.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5">
                    {r.status === "PENDING" && (
                      <ProcessPurchaseForm
                        requestId={r.id}
                        txId={r.txId ?? null}
                        screenshotUrl={r.screenshotUrl ?? null}
                      />
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    No purchase requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
