"use client";

import { useActionState } from "react";
import { requestDepositAction } from "@/app/actions/deposits";
import Link from "next/link";

const METHODS = [
  { value: "BKASH", label: "bKash", account: "01700-000000 (Agent)" },
  { value: "NAGAD", label: "Nagad", account: "01800-000000 (Agent)" },
  { value: "ROCKET", label: "Rocket", account: "01900-000000 (Agent)" },
  { value: "BANK_TRANSFER", label: "Bank Transfer", account: "DBS Bank: 123-456789-0" },
];

export default function DepositPage() {
  const [state, action, pending] = useActionState(requestDepositAction, null);

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-brand transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-foreground">Deposit Funds</span>
        </div>

        <div className="bg-white rounded-2xl border border-border p-7">
          <h1 className="text-xl font-bold text-foreground mb-1">Deposit Funds</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Transfer money via any method below, then submit the transaction ID. Your wallet will be credited after admin verification.
          </p>

          {state?.success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-semibold text-foreground mb-2">Deposit request submitted!</p>
              <p className="text-sm text-muted-foreground mb-5">We'll verify your payment and credit your wallet within a few hours.</p>
              <Link href="/dashboard" className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <form action={action} className="space-y-5">
              {/* Payment accounts */}
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-foreground mb-2">Payment Accounts</p>
                {METHODS.map((m) => (
                  <div key={m.value} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{m.label}</span>
                    <span className="font-mono text-muted-foreground">{m.account}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount (S$)</label>
                <input
                  name="amount"
                  type="number"
                  required
                  min={10}
                  step={0.01}
                  placeholder="Minimum S$10"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map((m) => (
                    <label key={m.value} className="cursor-pointer">
                      <input type="radio" name="paymentMethod" value={m.value} className="sr-only peer" required />
                      <div className="border border-border rounded-lg px-3 py-2 text-sm font-medium text-center transition-colors peer-checked:bg-brand-50 peer-checked:border-brand peer-checked:text-brand hover:border-brand/40 text-muted-foreground">
                        {m.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Transaction ID</label>
                <input
                  name="txId"
                  type="text"
                  required
                  placeholder="Transaction reference number"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">Found in your mobile banking app after transfer</p>
              </div>

              {state?.error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {state.error}
                </div>
              )}

              <button type="submit" disabled={pending}
                className="w-full bg-brand text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60">
                {pending ? "Submitting…" : "Submit Deposit Request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
