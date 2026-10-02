import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getMyCheckouts(userId: string) {
  return prisma.checkout.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  AWAITING_PAYMENT: "bg-amber-100 text-amber-700",
  PROOF_SUBMITTED: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  AWAITING_PAYMENT: "Awaiting Payment",
  PROOF_SUBMITTED: "Under Review",
  PAID: "Paid",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const NEEDS_ACTION = new Set(["AWAITING_PAYMENT", "REJECTED"]);

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const checkouts = await getMyCheckouts(session.userId);

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-brand transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground">My Checkouts</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Checkouts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Payment requests sent to you for taxi, air ticket, and service bookings.
          </p>
        </div>

        {checkouts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border py-16 text-center text-sm text-muted-foreground">
            You don&apos;t have any checkouts yet. When admin sends you a payment request, it&apos;ll show up here.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {checkouts.map((c) => {
                const firstItem = c.items[0];
                const extraCount = c.items.length - 1;
                return (
                  <Link
                    key={c.id}
                    href={`/pay/${c.token}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[c.status]}`}>
                          {STATUS_LABELS[c.status] ?? c.status}
                        </span>
                        {NEEDS_ACTION.has(c.status) && (
                          <span className="text-[11px] font-semibold text-brand">Action needed</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">
                        {firstItem?.description ?? "Checkout"}
                        {extraCount > 0 && <span className="text-muted-foreground"> +{extraCount} more</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-foreground">৳{Number(c.totalAmount).toFixed(2)}</p>
                      <p className="text-xs text-brand font-medium mt-0.5">View →</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
