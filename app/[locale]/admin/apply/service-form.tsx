"use client";

import { useActionState, useState, useEffect, useTransition } from "react";
import { createServiceAction, updateServiceAction, toggleServiceAction, deleteServiceAction } from "@/app/actions/apply";

const INPUT = "w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white";

export function CreateServiceModal() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createServiceAction, null);

  useEffect(() => { if (state?.success) setOpen(false); }, [state]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="text-sm font-semibold bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors">
        + Add Service
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">Add New Service</h2>
              <button type="button" onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form action={action} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Service Name *</label>
                <input name="name" required placeholder="e.g. Work Permit Renewal, Visa Application..." className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Description</label>
                <textarea name="description" rows={3} placeholder="What documents are required, what the service includes..." className={`${INPUT} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Price (৳) *</label>
                  <input name="price" type="number" step="0.01" min="0" required placeholder="0.00" className={INPUT} />
                  <p className="text-[11px] text-muted-foreground mt-1">Hidden from applicants</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Sort Order</label>
                  <input name="sortOrder" type="number" defaultValue="0" className={INPUT} />
                </div>
              </div>
              {state?.error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{state.error}</p>}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <button type="button" onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={pending}
                  className="px-5 py-2 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-60 transition-colors">
                  {pending ? "Saving…" : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function ServiceActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <button type="button" disabled={isPending}
        onClick={() => startTransition(() => toggleServiceAction(id))}
        className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 ${
          isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}>
        {isPending ? "…" : isActive ? "Active" : "Inactive"}
      </button>
      <button type="button" disabled={isPending}
        onClick={() => { if (confirm("Delete this service?")) startTransition(() => deleteServiceAction(id)); }}
        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
        Delete
      </button>
    </div>
  );
}
