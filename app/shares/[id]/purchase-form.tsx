"use client";

import { useActionState, useState } from "react";
import { requestSharePurchaseAction } from "@/app/actions/shares";

const PAYMENT_METHODS = [
  { value: "BKASH", label: "bKash", needsTxId: true },
  { value: "NAGAD", label: "Nagad", needsTxId: true },
  { value: "ROCKET", label: "Rocket", needsTxId: true },
  { value: "BANK_TRANSFER", label: "Bank Transfer", needsTxId: true },
  { value: "WALLET", label: "Platform Wallet", needsTxId: false },
];

type Props = {
  projectId: string;
  sharePrice: number;
  availableShares: number;
  hasPending: boolean;
};

export function PurchaseForm({ projectId, sharePrice, availableShares, hasPending }: Props) {
  const [state, action, pending] = useActionState(requestSharePurchaseAction, null);
  const [qty, setQty] = useState(1);
  const [method, setMethod] = useState("BKASH");

  const total = qty * sharePrice;
  const selectedMethod = PAYMENT_METHODS.find((m) => m.value === method);

  if (hasPending) {
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-semibold text-foreground text-sm">Purchase request pending</p>
          <p className="text-xs text-muted-foreground mt-1">Wait for admin approval before submitting another.</p>
        </div>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-semibold text-green-700 text-sm">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden sticky top-24">
      <div className="px-6 py-5 border-b border-border">
        <h3 className="font-bold text-foreground text-lg">Buy Shares</h3>
        <p className="text-xs text-muted-foreground mt-0.5">S${sharePrice.toFixed(2)} per share</p>
      </div>

      <form action={action} className="p-6 space-y-5">
        <input type="hidden" name="projectId" value={projectId} />

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Number of Shares
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-lg font-medium hover:bg-muted transition-colors"
            >
              −
            </button>
            <input
              name="quantity"
              type="number"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(availableShares, Number(e.target.value))))}
              min={1}
              max={availableShares}
              className="flex-1 text-center px-3 py-2 rounded-lg border border-border text-foreground font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
            <button
              type="button"
              onClick={() => setQty(Math.min(availableShares, qty + 1))}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-lg font-medium hover:bg-muted transition-colors"
            >
              +
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{availableShares} shares available</p>
        </div>

        {/* Total */}
        <div className="bg-brand-50 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-brand font-medium">Total Amount</span>
          <span className="text-xl font-bold text-brand">S${total.toFixed(2)}</span>
        </div>

        {/* Payment method */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMethod(m.value)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-left ${
                  method === m.value
                    ? "bg-brand-50 border-brand text-brand"
                    : "border-border text-muted-foreground hover:border-brand/40"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="paymentMethod" value={method} />
        </div>

        {/* Transaction ID */}
        {selectedMethod?.needsTxId && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Transaction ID <span className="text-red-500">*</span>
            </label>
            <input
              name="txId"
              type="text"
              required
              placeholder={`${selectedMethod.label} transaction ID`}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors"
            />
          </div>
        )}

        {/* Error */}
        {state?.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || availableShares === 0}
          className="w-full bg-brand text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Submitting…" : `Buy ${qty} Share${qty > 1 ? "s" : ""} · S$${total.toFixed(2)}`}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Your request will be reviewed by an admin before shares are transferred.
        </p>
      </form>
    </div>
  );
}
