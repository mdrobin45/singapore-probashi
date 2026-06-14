"use client";

import { useActionState, useState } from "react";
import { processPurchaseAction } from "@/app/actions/admin-shares";

export function ProcessPurchaseForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(processPurchaseAction, null);
  const [expanded, setExpanded] = useState(false);
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");

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
    <div className="min-w-52 space-y-2">
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
  );
}
