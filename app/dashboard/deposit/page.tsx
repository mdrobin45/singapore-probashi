import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DepositForm } from "./deposit-form";

async function getPaymentAccounts() {
  const rows = await prisma.paymentAccount.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, method: true, label: true, accountNumber: true, accountName: true },
  });
  return rows;
}

export default async function DepositPage({
  searchParams,
}: {
  searchParams: Promise<{ amount?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { amount } = await searchParams;
  const accounts = await getPaymentAccounts();

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-brand transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground">Deposit Funds</span>
        </div>

        <div className="bg-white rounded-2xl border border-border p-7">
          <h1 className="text-xl font-bold text-foreground mb-1">Deposit Funds</h1>
          <p className="text-sm text-muted-foreground mb-6">Transfer money via any method below, then submit the transaction ID. Your wallet will be credited after admin verification.</p>
          <DepositForm accounts={accounts} defaultAmount={amount} />
        </div>
      </div>
    </div>
  );
}
