import { prisma } from "@/lib/prisma";
import { PayForm } from "./pay-form";

async function getCheckoutByToken(token: string) {
  return prisma.checkout.findUnique({
    where: { token },
    include: { items: true, user: { select: { fullName: true } } },
  });
}

async function getPaymentAccounts() {
  const rows = await prisma.paymentAccount.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, method: true, label: true, accountNumber: true, accountName: true },
  });
  return rows;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-border p-7">{children}</div>
    </div>
  );
}

export default async function PayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [checkout, accounts] = await Promise.all([getCheckoutByToken(token), getPaymentAccounts()]);

  if (!checkout) {
    return (
      <Shell>
        <div className="text-center py-6">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="font-bold text-foreground text-lg mb-2">Payment link not found</h1>
          <p className="text-sm text-muted-foreground">This link may be incorrect. Please check with the person who sent it to you.</p>
        </div>
      </Shell>
    );
  }

  const expired = checkout.expiresAt != null && checkout.expiresAt < new Date();

  return (
    <Shell>
      <h1 className="text-xl font-bold text-foreground mb-1">Payment Summary</h1>
      <p className="text-sm text-muted-foreground mb-6">For {checkout.user.fullName}</p>

      <div className="border border-border rounded-xl overflow-hidden mb-6">
        <div className="divide-y divide-border">
          {checkout.items.map((item) => (
            <div key={item.id} className="px-4 py-3 flex items-center justify-between text-sm">
              <div>
                <p className="text-foreground">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × ৳{Number(item.unitPrice).toFixed(2)}
                </p>
              </div>
              <p className="font-semibold text-foreground">৳{Number(item.lineTotal).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="px-4 py-4 bg-muted/40 space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">৳{Number(checkout.subtotal).toFixed(2)}</span>
          </div>
          {Number(checkout.discountAmount) > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-red-600">−৳{Number(checkout.discountAmount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-base font-bold pt-1.5 border-t border-border">
            <span className="text-foreground">Total Payable</span>
            <span className="text-brand">৳{Number(checkout.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {checkout.status === "PAID" ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-semibold text-foreground mb-1">Payment confirmed</p>
          <p className="text-sm text-muted-foreground">Thank you — your booking(s) are confirmed.</p>
        </div>
      ) : checkout.status === "PROOF_SUBMITTED" ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-semibold text-foreground mb-1">Payment under review</p>
          <p className="text-sm text-muted-foreground">We&apos;re verifying your payment and will confirm shortly.</p>
        </div>
      ) : expired ? (
        <div className="text-center py-6">
          <div className="text-5xl mb-4">⏳</div>
          <p className="font-semibold text-foreground mb-1">This payment link has expired</p>
          <p className="text-sm text-muted-foreground">Please contact us for a new link.</p>
        </div>
      ) : checkout.status === "AWAITING_PAYMENT" || checkout.status === "REJECTED" ? (
        <>
          {checkout.status === "REJECTED" && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
              Your previous payment proof couldn&apos;t be verified{checkout.adminNote ? `: ${checkout.adminNote}` : ""}. Please resubmit below.
            </div>
          )}
          <PayForm token={token} accounts={accounts} />
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">This checkout isn&apos;t ready for payment yet.</p>
        </div>
      )}
    </Shell>
  );
}
