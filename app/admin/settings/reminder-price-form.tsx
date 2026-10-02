"use client";

import { useActionState } from "react";
import { saveReminderSlotPriceAction } from "@/app/actions/admin-settings";

export function ReminderPriceForm({ currentPrice }: { currentPrice: number }) {
  const [state, action, pending] = useActionState(saveReminderSlotPriceAction, null);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Reminder Slot Unlock Price (BDT ৳)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground font-semibold text-sm">
            ৳
          </span>
          <input
            name="slotPrice"
            type="number"
            step="1"
            min="0"
            defaultValue={currentPrice}
            required
            className="w-full text-sm pl-8 pr-3.5 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-semibold"
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Amount deducted from user platform wallet when unlocking Slots 2 through 10 (Slot 1 is always free).
        </p>
      </div>

      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {state.error}
        </p>
      )}

      {state?.success && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          Reminder slot price updated successfully!
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Saving…" : "Save Reminder Price"}
      </button>
    </form>
  );
}
