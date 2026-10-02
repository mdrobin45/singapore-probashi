"use client";

import { useActionState, useState } from "react";
import { saveShareRateAction } from "@/app/actions/admin-settings";

type Props = {
  rate: number;
};

export function SharePricingForm({ rate }: Props) {
  const [state, action, pending] = useActionState(saveShareRateAction, null);
  const [value, setValue] = useState(String(rate));

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Share Rate <span className="text-muted-foreground font-normal">(1 SGD = ? BDT)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
            1 SGD =
          </span>
          <input
            name="rate"
            type="number"
            step="0.01"
            min="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="83.50"
            className="w-full pl-20 pr-16 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-foreground font-semibold"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
            ৳ BDT
          </span>
        </div>
        {value && !isNaN(parseFloat(value)) && parseFloat(value) > 0 && (
          <p className="text-xs text-muted-foreground mt-1.5">
            Preview: 1 SGD = {parseFloat(value).toFixed(2)} ৳ BDT
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          This rate is always manually set by an admin — it never fetches a live rate, unlike the general currency converter above.
        </p>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2.5 rounded-lg">
          Share rate saved successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-brand text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand/90 transition-colors disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Share Rate"}
      </button>
    </form>
  );
}
