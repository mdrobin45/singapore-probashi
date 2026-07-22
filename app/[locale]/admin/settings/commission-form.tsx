"use client";

import { useActionState } from "react";
import { saveCommissionRateAction } from "@/app/actions/admin-settings";

export function CommissionSettingsForm({ rate }: { rate: number }) {
  const [state, action, pending] = useActionState(saveCommissionRateAction, null);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Commission Rate <span className="text-muted-foreground font-normal">(applies to every agent, on every referred request)</span>
        </label>
        <div className="relative max-w-[160px]">
          <input
            name="rate"
            type="number"
            step="0.1"
            min={0}
            max={100}
            defaultValue={rate}
            className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-foreground font-semibold"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">%</span>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2.5 rounded-lg">
          Commission rate saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand/90 transition-colors disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Rate"}
      </button>
    </form>
  );
}
