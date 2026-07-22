import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";

async function getCheckouts() {
  return prisma.checkout.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { fullName: true, email: true } },
      _count: { select: { items: true } },
    },
  });
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  AWAITING_PAYMENT: "bg-amber-100 text-amber-700",
  PROOF_SUBMITTED: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-500",
};

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminCheckoutsPage() {
  const checkouts = await getCheckouts();
  const needsReview = checkouts.filter((c) => c.status === "PROOF_SUBMITTED");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Checkouts</h1>
          <p className="text-sm text-muted-foreground">{needsReview.length} awaiting review · {checkouts.length} total</p>
        </div>
        <Link
          href="/admin/checkouts/new"
          className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors"
        >
          + New Checkout
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Items</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Total</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {checkouts.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3.5">
                    <Link href={`/admin/checkouts/${c.id}`} className="font-medium text-foreground hover:text-brand transition-colors">
                      {c.user.fullName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{c.user.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-foreground">{c._count.items}</td>
                  <td className="px-4 py-3.5 font-semibold text-foreground">৳{Number(c.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{fmt(c.createdAt)}</td>
                </tr>
              ))}
              {checkouts.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">No checkouts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
