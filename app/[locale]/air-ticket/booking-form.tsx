"use client";

import { useActionState, useState } from "react";
import { bookTicketAction } from "@/app/actions/tickets";

type Props = {
  listingId: string;
  price: number;
  airline: string;
  destination: string;
};

export function BookingForm({ listingId, price, airline, destination }: Props) {
  const [state, action, pending] = useActionState(bookTicketAction, null);
  const [open, setOpen] = useState(false);
  const [passengers, setPassengers] = useState(1);

  if (state?.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 max-w-xs text-sm text-green-700 font-medium">
        ✓ {state.message}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-brand text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
      >
        Book Now
      </button>
    );
  }

  return (
    <div className="bg-muted border border-border rounded-xl p-4 w-full max-w-xs">
      <p className="text-xs font-semibold text-foreground mb-3">
        {airline} → {destination.split("(")[0]?.trim()}
      </p>
      <form action={action} className="space-y-3">
        <input type="hidden" name="listingId" value={listingId} />
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Passengers</label>
          <input
            name="passengers"
            type="number"
            value={passengers}
            onChange={(e) => setPassengers(Math.max(1, Math.min(10, Number(e.target.value))))}
            min={1}
            max={10}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Referral Code (optional)</label>
          <input
            name="referralCode"
            type="text"
            placeholder="Enter code if you have one"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Notes (optional)</label>
          <input
            name="notes"
            type="text"
            placeholder="e.g. window seat preference"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand bg-white"
          />
        </div>
        <div className="bg-brand-50 rounded-lg px-3 py-2 flex justify-between text-xs">
          <span className="text-muted-foreground">Estimated total</span>
          <span className="font-bold text-brand">S${(price * passengers).toFixed(2)}</span>
        </div>
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={pending}
            className="flex-1 bg-brand text-white text-xs font-semibold py-2 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors">
            {pending ? "Submitting…" : "Submit Request"}
          </button>
          <button type="button" onClick={() => setOpen(false)}
            className="px-3 text-xs border border-border rounded-lg hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
