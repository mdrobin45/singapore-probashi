"use client";

import { useActionState, useState } from "react";
import { processWithdrawalAction } from "@/app/actions/admin-withdrawals";

export function ProcessWithdrawalForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(processWithdrawalAction, null);
  const [expanded, setExpanded] = useState(false);
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");

  if (state?.success) return <span className="text-xs text-green-600 font-medium">Done ✓</span>;

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)} className="text-xs text-brand font-semibold hover:underline">
        Review
      </button>
    );
  }

  return (
    <div className="min-w-52 space-y-2">
      <div className="flex gap-1.5">
        {(["APPROVED", "REJECTED"] as const).map((d) => (
          <button key={d} type="button" onClick={() => setDecision(d)}
            className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors ${
              decision === d
                ? d === "APPROVED" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                : "border border-border text-muted-foreground"
            }`}>
            {d === "APPROVED" ? "Approve" : "Reject"}
          </button>
        ))}
      </div>
      <form action={action}>
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="decision" value={decision} />
        <input name="adminNote" type="text" placeholder="Note (optional)"
          className="w-full text-xs px-2 py-1.5 rounded border border-border focus:outline-none focus:border-brand mb-1.5" />
        {state?.error && <p className="text-[11px] text-red-600 mb-1">{state.error}</p>}
        <div className="flex gap-1.5">
          <button type="submit" disabled={pending}
            className={`flex-1 text-xs py-1.5 rounded-lg font-semibold text-white disabled:opacity-50 ${decision === "APPROVED" ? "bg-green-500" : "bg-red-500"}`}>
            {pending ? "…" : "Confirm"}
          </button>
          <button type="button" onClick={() => setExpanded(false)}
            className="text-xs px-2 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
