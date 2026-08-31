"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { payCheckoutWithWalletAction } from "@/app/actions/checkout";
import Link from "next/link";

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

  if (walletBalance < totalAmount) {
    const needed = totalAmount - walletBalance;
    return (
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 mb-6 text-center space-y-3 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-800 text-lg">
          ⚠️
        </div>
        <div>
          <p className="font-bold text-amber-950 text-sm">Insufficient Platform Wallet Balance</p>
          <p className="text-xs text-amber-900 mt-1">
            Wallet Balance: <strong>৳{walletBalance.toFixed(2)}</strong> · Total Due: <strong>৳{totalAmount.toFixed(2)}</strong>
          </p>
          <p className="text-xs text-amber-800 mt-0.5">
            Deposit <strong>৳{Math.ceil(needed)}</strong> to complete your booking payment.
          </p>
        </div>
        <Link
          href={`/dashboard/deposit?amount=${Math.ceil(needed)}`}
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-brand text-white font-semibold text-xs rounded-xl hover:bg-brand-dark transition-colors shadow-xs"
        >
          + Deposit ৳{Math.ceil(needed)} into Wallet →
        </Link>
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
