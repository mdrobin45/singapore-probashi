import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ResellForm } from "./resell-form";
import Link from "next/link";

export default async function ResellPage({
  searchParams,
}: {
  searchParams: Promise<{ ownershipId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { ownershipId } = await searchParams;

  const ownerships = await prisma.shareOwnership.findMany({
    where: { ownerId: session.userId },
    include: { project: { select: { id: true, name: true, sharePrice: true, status: true } } },
    orderBy: { acquiredAt: "desc" },
  });

  const selected = ownershipId
    ? ownerships.find((o) => o.id === ownershipId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-brand transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/shares" className="hover:text-brand transition-colors">Shares</Link>
          <span>/</span>
          <span className="text-foreground">List for Sale</span>
        </div>

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-7 py-5 border-b border-border">
            <h1 className="font-bold text-foreground text-xl">List Shares for Resale</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Set your asking price and quantity. Admin will review and publish your listing to the secondary market.
            </p>
          </div>

          {ownerships.length === 0 ? (
            <div className="px-7 py-12 text-center">
              <p className="text-muted-foreground mb-4">You don't own any shares to list.</p>
              <Link href="/shares" className="bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
                Browse Projects
              </Link>
            </div>
          ) : (
            <ResellForm ownerships={ownerships} selectedId={ownershipId ?? null} />
          )}
        </div>

        {/* Info */}
        <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800 space-y-1.5">
          <p className="font-semibold">How reselling works</p>
          <ol className="space-y-1 text-xs text-blue-700 list-decimal list-inside">
            <li>Submit your listing — admin reviews and approves it</li>
            <li>Your listing appears on the Secondary Market tab</li>
            <li>Another member submits a buy request with payment proof</li>
            <li>Admin processes the trade: deducts from your ownership, credits the buyer</li>
            <li>Your wallet is credited after successful settlement</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
