"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { payCheckoutWithWalletAction } from "@/app/actions/checkout";

export function WalletPayButton({ token, walletBalance, totalAmount }: { token: string; walletBalance: number; totalAmount: number }) {
  const boundAction = payCheckoutWithWalletAction.bind(null, token);
  const [state, action, pending] = useActionState(boundAction, null);
  const router = useRouter();

  if (state?.success) {
    router.refresh();
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium text-center">
        Payment confirmed from your wallet!
      </div>
    );
  }

  return (
    <div className="mb-6">
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="w-full flex items-center justify-between gap-3 bg-brand text-white rounded-xl px-4 py-3.5 hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          <span className="flex items-center gap-2.5">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-semibold">
              {pending ? "Processing…" : "Pay from Platform Wallet"}
            </span>
          </span>
          <span className="text-sm font-bold">৳{totalAmount.toFixed(2)}</span>
        </button>
        <p className="text-xs text-muted-foreground text-center mt-1.5">
          Wallet balance: ৳{walletBalance.toFixed(2)}
        </p>
      </form>

      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mt-3">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3 my-5">
        <div className="h-px bg-border flex-1" />
        <span className="text-xs text-muted-foreground">or pay another way</span>
        <div className="h-px bg-border flex-1" />
      </div>
    </div>
  );
}
