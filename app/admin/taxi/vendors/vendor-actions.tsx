"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  createTaxiVendorAction,
  toggleTaxiVendorActiveAction,
  updateTaxiVendorAction,
  deleteTaxiVendorAction,
} from "@/app/actions/taxi";

type Vendor = { id: string; name: string; phone: string; vehicleType: string | null };

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

function EditVendorModal({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateTaxiVendorAction, null);

  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pb-20 lg:pb-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100vh-6rem)] lg:max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">Edit Vendor</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form action={action} className="px-6 py-5 space-y-4">
          <input type="hidden" name="vendorId" value={vendor.id} />
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Vendor name</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={vendor.name}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              required
              defaultValue={vendor.phone}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Vehicle type (optional)</label>
            <input
              name="vehicleType"
              type="text"
              defaultValue={vendor.vehicleType ?? ""}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          {state?.error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{state.error}</p>}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-60 transition-colors"
            >
              {pending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function VendorRowActions({ vendor }: { vendor: Vendor }) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("Delete this vendor? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteTaxiVendorAction(vendor.id);
      setDeleteError(res?.error ?? null);
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="text-xs font-medium text-brand hover:text-brand-dark transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
        >
          Delete
        </button>
      </div>
      {deleteError && <p className="text-xs text-red-600 mt-1 max-w-55">{deleteError}</p>}
      {editOpen && <EditVendorModal vendor={vendor} onClose={() => setEditOpen(false)} />}
    </div>
  );
}
