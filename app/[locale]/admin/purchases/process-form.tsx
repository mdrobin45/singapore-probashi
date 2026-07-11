"use client";

import { useActionState, useState } from "react";
import { processPurchaseAction } from "@/app/actions/admin-shares";

type Props = {
  requestId: string;
  txId?: string | null;
  screenshotUrl?: string | null;
};

export function ProcessPurchaseForm({ requestId, txId, screenshotUrl }: Props) {
  const [state, action, pending] = useActionState(processPurchaseAction, null);
  const [expanded, setExpanded] = useState(false);
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [lightbox, setLightbox] = useState(false);

  if (state?.success) {
    return <span className="text-xs text-green-600 font-medium">Done ✓</span>;
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs text-brand font-semibold hover:underline"
      >
        Review
      </button>
    );
  }

  return (
    <>
      {/* Lightbox */}
      {lightbox && screenshotUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg leading-none"
            >
              ×
            </button>
            <img
              src={screenshotUrl}
              alt="Payment screenshot"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="min-w-52 space-y-2">
        {/* Payment proof */}
        {(txId || screenshotUrl) && (
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Payment Proof
            </p>
            {txId && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Transaction ID</p>
                <p className="text-xs font-mono text-foreground break-all">{txId}</p>
              </div>
            )}
            {screenshotUrl && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Screenshot</p>
                <button
                  type="button"
                  onClick={() => setLightbox(true)}
                  className="block w-full"
                >
                  <img
                    src={screenshotUrl}
                    alt="Payment screenshot"
                    className="w-full max-h-28 object-cover rounded border border-border hover:opacity-90 transition-opacity cursor-zoom-in"
                  />
                  <p className="text-[10px] text-brand mt-1 text-center">Click to enlarge</p>
                </button>
              </div>
            )}
            {!txId && !screenshotUrl && (
              <p className="text-xs text-muted-foreground italic">No proof provided</p>
            )}
          </div>
        )}

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setDecision("APPROVED")}
            className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors ${
              decision === "APPROVED"
                ? "bg-green-500 text-white"
                : "border border-border text-muted-foreground hover:border-green-400"
            }`}
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => setDecision("REJECTED")}
            className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors ${
              decision === "REJECTED"
                ? "bg-red-500 text-white"
                : "border border-border text-muted-foreground hover:border-red-400"
            }`}
          >
            Reject
          </button>
        </div>
        <form action={action}>
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="decision" value={decision} />
          <input
            name="adminNote"
            type="text"
            placeholder="Note (optional)"
            className="w-full text-xs px-2 py-1.5 rounded border border-border focus:outline-none focus:border-brand mb-1.5"
          />
          {state?.error && <p className="text-[11px] text-red-600 mb-1">{state.error}</p>}
          <div className="flex gap-1.5">
            <button
              type="submit"
              disabled={pending}
              className={`flex-1 text-xs py-1.5 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 ${
                decision === "APPROVED" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {pending ? "…" : "Confirm"}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-xs px-2 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
