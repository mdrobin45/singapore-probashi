"use client";

import { useActionState } from "react";
import { createTicketListingAction } from "@/app/actions/admin-tickets";

export function CreateTicketForm() {
  const [state, action, pending] = useActionState(createTicketListingAction, null);

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden sticky top-24">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Add Listing</h3>
      </div>
      <form action={action} className="p-5 space-y-3">
        {[
          { name: "airline", label: "Airline", placeholder: "e.g. Biman Bangladesh Airlines" },
          { name: "origin", label: "Origin", placeholder: "e.g. Singapore (SIN)" },
          { name: "destination", label: "Destination", placeholder: "e.g. Dhaka (DAC)" },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
            <input name={f.name} type="text" required placeholder={f.placeholder}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Depart Date</label>
            <input name="departDate" type="date" required
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Return Date</label>
            <input name="returnDate" type="date"
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Price (৳)</label>
            <input name="price" type="number" required min={1} step={0.01} placeholder="450"
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Seats</label>
            <input name="seats" type="number" required min={1} placeholder="20"
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand" />
          </div>
        </div>
        {state?.error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>}
        {state?.success && <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">Listing created!</p>}
        <button type="submit" disabled={pending}
          className="w-full bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-dark disabled:opacity-60 transition-colors">
          {pending ? "Creating…" : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
