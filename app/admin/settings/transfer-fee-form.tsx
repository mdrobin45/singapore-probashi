"use client";

import { useActionState, useState } from "react";
import { saveTransferFeeAction } from "@/app/actions/admin-settings";
import type { TransferFeeMode, TransferFeeSetting } from "@/lib/wallet-tx";

export function TransferFeeForm({ setting }: { setting: TransferFeeSetting }) {
  const [state, action, pending] = useActionState(saveTransferFeeAction, null);
  const [mode, setMode] = useState<TransferFeeMode>(setting.mode);

  return (
    <form action={action} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 shrink-0">
          {(["PERCENTAGE", "FIXED"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === m ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {m === "PERCENTAGE" ? "Percentage" : "Fixed ৳"}
            </button>
          ))}
        </div>
        <input type="hidden" name="mode" value={mode} />

        <div className="relative max-w-35">
          <input
            name="value"
            type="number"
            step="0.01"
            min={0}
            max={mode === "PERCENTAGE" ? 100 : undefined}
            defaultValue={setting.value}
            className="w-full pl-3.5 pr-9 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-foreground font-semibold text-sm"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">
            {mode === "PERCENTAGE" ? "%" : "৳"}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Charged to the sender on top of the amount — the recipient always receives the full amount. Set 0 for free transfers.
      </p>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2.5 rounded-lg">
          Transfer fee saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand/90 transition-colors disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Transfer Fee"}
      </button>
    </form>
  );
}
