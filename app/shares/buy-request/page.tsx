import { getSession } from "@/lib/session";
import { getShareSgdRate } from "@/lib/share-pricing";
import { redirect } from "next/navigation";
import { BuyRequestForm } from "./buy-request-form";
import Link from "next/link";

export default async function BuyRequestPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const rate = await getShareSgdRate();

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-brand transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/shares" className="hover:text-brand transition-colors">Shares</Link>
          <span>/</span>
          <span className="text-foreground">Buy Request</span>
        </div>

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-7 py-5 border-b border-border">
            <h1 className="font-bold text-foreground text-xl">Request to Buy Shares</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tell us the share number you want, the size, your offered price, and your preferred date. Admin will review and get in touch.
            </p>
          </div>

          <BuyRequestForm defaultName={session.fullName} rate={rate} />
        </div>

        {/* Info */}
        <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800 space-y-1.5">
          <p className="font-semibold">How buy requests work</p>
          <ol className="space-y-1 text-xs text-blue-700 list-decimal list-inside">
            <li>Submit your request with share number, size, price and preferred date</li>
            <li>Admin reviews your request</li>
            <li>Once approved, admin will contact you to complete the purchase</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
