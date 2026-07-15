"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addBankRateAction,
  updateBankRateAction,
  toggleBankRateAction,
  deleteBankRateAction,
} from "@/app/actions/admin-settings";

type BankRow = {
  id: string;
  bankName: string;
  rate: number;
  isActive: boolean;
};

type Props = { banks: BankRow[] };

function EditRow({ bank, onDone }: { bank: BankRow; onDone: () => void }) {
  const [state, action, pending] = useActionState(updateBankRateAction, null);

  if (state?.success) {
    onDone();
    return null;
  }

  return (
    <form action={action} className="flex flex-col sm:flex-row sm:items-center gap-2 py-2">
      <input type="hidden" name="id" value={bank.id} />
      <input
        name="bankName"
        defaultValue={bank.bankName}
        className="flex-1 min-w-0 text-sm px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:border-brand"
        placeholder="Bank name"
      />
      <div className="relative w-full sm:w-36">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">1 SGD =</span>
        <input
          name="rate"
          type="number"
          step="0.0001"
          min="0.0001"
          defaultValue={bank.rate}
          className="w-full pl-14 pr-8 py-1.5 rounded-lg border border-border text-sm focus:outline-none focus:border-brand"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">৳</span>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex gap-2 shrink-0">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 sm:flex-none text-xs px-3 py-1.5 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 disabled:opacity-50"
        >
          {pending ? "…" : "Save"}
        </button>
        <button type="button" onClick={onDone} className="flex-1 sm:flex-none text-xs px-2.5 py-1.5 border border-border rounded-lg text-muted-foreground hover:bg-muted">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function BankRatesForm({ banks: initial }: Props) {
  const [banks, setBanks] = useState<BankRow[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addState, addAction, addPending] = useActionState(addBankRateAction, null);
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: string, current: boolean) {
    setBanks((prev) => prev.map((b) => b.id === id ? { ...b, isActive: !current } : b));
    startTransition(() => toggleBankRateAction(id, !current));
  }

  function handleDelete(id: string) {
    setBanks((prev) => prev.filter((b) => b.id !== id));
    startTransition(() => deleteBankRateAction(id));
  }

  const maxRate = banks.length > 0 ? Math.max(...banks.map((b) => b.rate)) : 0;

  return (
    <div className="space-y-4">
      {/* Bank list */}
      {banks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
          No banks added yet. Add one below.
        </p>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
          {banks.map((bank) => (
            <div key={bank.id}>
              {editingId === bank.id ? (
                <div className="px-4">
                  <EditRow
                    bank={bank}
                    onDone={() => {
                      setEditingId(null);
                      // Re-fetch would happen via revalidation; optimistic update not needed
                    }}
                  />
                </div>
              ) : (
                <div className={`flex items-center gap-3 px-4 py-3 transition-colors ${bank.isActive ? "" : "opacity-50"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{bank.bankName}</p>
                      {bank.rate === maxRate && bank.isActive && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">
                          Best
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      1 SGD = <span className="font-semibold text-foreground">{Number(bank.rate).toFixed(4)} ৳</span>
                    </p>
                  </div>

                  {/* Active toggle */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={bank.isActive}
                      onChange={() => handleToggle(bank.id, bank.isActive)}
                      disabled={isPending}
                    />
                    <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-brand transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>

                  <button
                    type="button"
                    onClick={() => setEditingId(bank.id)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(bank.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add bank form */}
      <form
        action={addAction}
        onSubmit={() => {
          // Optimistically reset isn't needed — revalidation refreshes the page
        }}
        className="border border-dashed border-border rounded-xl p-4 space-y-3"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add Bank</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            name="bankName"
            required
            placeholder="e.g. Dutch-Bangla Bank"
            className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg border border-border focus:outline-none focus:border-brand placeholder:text-muted-foreground"
          />
          <div className="relative w-full sm:w-40">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">1 SGD =</span>
            <input
              name="rate"
              type="number"
              step="0.0001"
              min="0.0001"
              required
              placeholder="83.50"
              className="w-full pl-14 pr-7 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-brand"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">৳</span>
          </div>
          <button
            type="submit"
            disabled={addPending}
            className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 disabled:opacity-50 shrink-0"
          >
            {addPending ? "…" : "+ Add"}
          </button>
        </div>
        {addState?.error && (
          <p className="text-xs text-red-600">{addState.error}</p>
        )}
      </form>
    </div>
  );
}
