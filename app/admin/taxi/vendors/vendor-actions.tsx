"use client";

import { useActionState, useTransition } from "react";
import { createTaxiVendorAction, toggleTaxiVendorActiveAction } from "@/app/actions/taxi";

export function AddVendorForm() {
  const [state, action, pending] = useActionState(createTaxiVendorAction, null);

  return (
    <form
      action={action}
      key={state?.success ? "reset" : "form"}
      className="bg-white rounded-xl border border-border p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
    >
      <div className="sm:col-span-1">
        <label className="block text-xs font-medium text-foreground mb-1">Vendor name</label>
        <input
          name="name"
          type="text"
          required
          placeholder="e.g. City Cabs"
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>
      <div className="sm:col-span-1">
        <label className="block text-xs font-medium text-foreground mb-1">Phone</label>
        <input
          name="phone"
          type="tel"
          required
          placeholder="+65 XXXXXXXX"
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>
      <div className="sm:col-span-1">
        <label className="block text-xs font-medium text-foreground mb-1">Vehicle type (optional)</label>
        <input
          name="vehicleType"
          type="text"
          placeholder="e.g. Sedan"
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>
      <div className="sm:col-span-1">
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-brand text-white rounded-lg py-2 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add Vendor"}
        </button>
      </div>
      {state?.error && (
        <p className="sm:col-span-4 text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}

export function VendorActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleTaxiVendorActiveAction(id, !isActive))}
      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 ${
        isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
