import { Link } from "@/i18n/navigation";
import { CheckoutBuilder } from "./checkout-builder";

export default function NewCheckoutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/checkouts"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Checkouts
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Bundle a customer&apos;s taxi, air ticket, and service requests into one combined payment.
        </p>
      </div>

      <CheckoutBuilder />
    </div>
  );
}
