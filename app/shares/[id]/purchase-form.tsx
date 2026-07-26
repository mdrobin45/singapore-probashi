"use client";

import { useActionState, useState, useRef } from "react";
import { requestSharePurchaseAction } from "@/app/actions/shares";
import { sgdToBdt } from "@/lib/share-pricing-utils";

const PAYMENT_METHODS = [
  { value: "BKASH", label: "bKash", needsTxId: true },
  { value: "NAGAD", label: "Nagad", needsTxId: true },
  { value: "ROCKET", label: "Rocket", needsTxId: true },
  { value: "GCASH", label: "GCash", needsTxId: true },
  { value: "BANK_TRANSFER", label: "Bank Transfer", needsTxId: true },
  { value: "WALLET", label: "Platform Wallet", needsTxId: false },
];

type Props = {
  projectId: string;
  sharePriceSgd: number;
  rate: number;
  availableShareNumbers: number[];
  hasPending: boolean;
};

export function PurchaseForm({ projectId, sharePriceSgd, rate, availableShareNumbers, hasPending }: Props) {
  const [state, action, pending] = useActionState(requestSharePurchaseAction, null);
  const [selected, setSelected] = useState<number[]>([]);
  const [method, setMethod] = useState("BKASH");
  const [proofMode, setProofMode] = useState<"txid" | "screenshot">("txid");
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const qty = selected.length;
  const totalSgd = qty * sharePriceSgd;
  const total = sgdToBdt(totalSgd, rate);
  const selectedMethod = PAYMENT_METHODS.find((m) => m.value === method);

  function toggle(n: number) {
    setSelected((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)));
  }

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
        <p className="text-xs text-muted-foreground mt-0.5">${sharePriceSgd.toFixed(2)} SGD per share</p>
        <p className="text-[11px] text-muted-foreground/70 mt-0.5">1 SGD = ৳{rate.toFixed(2)} BDT</p>
      </div>

      <form action={action} className="p-6 space-y-5">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="shareNumbers" value={JSON.stringify(selected)} />

        {/* Share number picker */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-foreground">
              Select Share Numbers
            </label>
            <span className="text-xs text-muted-foreground">{availableShareNumbers.length} available</span>
          </div>

          {availableShareNumbers.length === 0 ? (
            <p className="text-xs text-muted-foreground border border-border rounded-lg px-3 py-4 text-center">
              No share numbers available right now.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 max-h-56 overflow-y-auto p-1 border border-border rounded-lg">
              {availableShareNumbers.map((n) => {
                const isSelected = selected.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggle(n)}
                    className={`px-2 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                      isSelected
                        ? "bg-brand text-white"
                        : "bg-muted text-muted-foreground hover:bg-brand-50 hover:text-brand"
                    }`}
                  >
                    #{String(n).padStart(4, "0")}
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {qty} share{qty !== 1 ? "s" : ""} selected
          </p>
        </div>

        {/* Total */}
        <div className="bg-brand-50 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-brand font-medium">Total Amount</span>
          <span className="text-xl font-bold text-brand">৳{total.toFixed(2)}</span>
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

        {/* Transaction proof */}
        {selectedMethod?.needsTxId && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                Transaction ID <span className="text-red-500">*</span>
              </label>
              {/* Toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setProofMode("txid")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    proofMode === "txid" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Type ID
                </button>
                <button
                  type="button"
                  onClick={() => setProofMode("screenshot")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    proofMode === "screenshot" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Screenshot
                </button>
              </div>
            </div>

            {proofMode === "txid" ? (
              <input
                name="txId"
                type="text"
                required
                placeholder={`${selectedMethod.label} transaction ID`}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors"
              />
            ) : (
              <div>
                {/* Hidden base64 value submitted with form */}
                <input type="hidden" name="screenshotUrl" value={screenshotBase64 ?? ""} />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    setScreenshotError(null);
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 3 * 1024 * 1024) {
                      setScreenshotError("Image must be under 3 MB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                      setScreenshotBase64(reader.result as string);
                      setScreenshotName(file.name);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed transition-colors ${
                    screenshotName
                      ? "border-brand bg-brand-50 text-brand"
                      : "border-border text-muted-foreground hover:border-brand/40"
                  }`}
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 9.75h.008v.008H3V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 6h16.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V6.75A.75.75 0 013.75 6z" />
                  </svg>
                  <span className="text-sm truncate">
                    {screenshotName ?? "Tap to upload payment screenshot"}
                  </span>
                </button>
                {screenshotError && (
                  <p className="text-xs text-red-600 mt-1">{screenshotError}</p>
                )}
              </div>
            )}
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
          disabled={pending || qty === 0}
          className="w-full bg-brand text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending
            ? "Submitting…"
            : qty === 0
            ? "Select share numbers to continue"
            : `Buy ${qty} Share${qty > 1 ? "s" : ""} · ৳${total.toFixed(2)}`}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Your request will be reviewed by an admin before shares are transferred.
        </p>
      </form>
    </div>
  );
}
