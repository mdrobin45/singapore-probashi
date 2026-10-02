"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addPaymentAccountAction,
  updatePaymentAccountAction,
  togglePaymentAccountAction,
  deletePaymentAccountAction,
} from "@/app/actions/admin-settings";

const METHODS = [
  { value: "BKASH", label: "bKash" },
  { value: "NAGAD", label: "Nagad" },
  { value: "ROCKET", label: "Rocket" },
  { value: "GCASH", label: "GCash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "PAYNOW", label: "PayNow" },
];

function methodLabel(value: string) {
  return METHODS.find((m) => m.value === value)?.label ?? value;
}

type AccountRow = {
  id: string;
  method: string;
  label: string;
  accountNumber: string;
  accountName: string | null;
  isActive: boolean;
};

type Props = { accounts: AccountRow[] };

function EditRow({ account, onDone }: { account: AccountRow; onDone: () => void }) {
  const [state, action, pending] = useActionState(updatePaymentAccountAction, null);

  if (state?.success) {
    onDone();
    return null;
  }

  return (
    <form action={action} className="space-y-2 py-3">
      <input type="hidden" name="id" value={account.id} />
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          name="method"
          defaultValue={account.method}
          className="w-full sm:w-40 text-sm px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:border-brand bg-white"
        >
          {METHODS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <input
          name="label"
          defaultValue={account.label}
          placeholder="Display label"
          className="flex-1 min-w-0 text-sm px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:border-brand"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          name="accountNumber"
          defaultValue={account.accountNumber}
          placeholder="Account / mobile number"
          className="flex-1 min-w-0 text-sm px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:border-brand font-mono"
        />
        <input
          name="accountName"
          defaultValue={account.accountName ?? ""}
          placeholder="Account name (optional)"
          className="flex-1 min-w-0 text-sm px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:border-brand"
        />
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="text-xs px-3 py-1.5 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 disabled:opacity-50"
        >
          {pending ? "…" : "Save"}
        </button>
        <button type="button" onClick={onDone} className="text-xs px-2.5 py-1.5 border border-border rounded-lg text-muted-foreground hover:bg-muted">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function PaymentAccountsForm({ accounts: initial }: Props) {
  const [accounts, setAccounts] = useState<AccountRow[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addState, addAction, addPending] = useActionState(addPaymentAccountAction, null);
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: string, current: boolean) {
    setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, isActive: !current } : a));
    startTransition(() => togglePaymentAccountAction(id, !current));
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this payment account? Customers will no longer see it.")) return;
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    startTransition(() => deletePaymentAccountAction(id));
  }

  return (
    <div className="space-y-4">
      {/* Account list */}
      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
          No payment accounts added yet. Add one below.
        </p>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
          {accounts.map((account) => (
            <div key={account.id} className="px-4">
              {editingId === account.id ? (
                <EditRow account={account} onDone={() => setEditingId(null)} />
              ) : (
                <div className={`flex items-center gap-3 py-3 transition-colors ${account.isActive ? "" : "opacity-50"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-brand-50 text-brand shrink-0">
                        {methodLabel(account.method)}
                      </span>
                      <p className="text-sm font-semibold text-foreground truncate">{account.label}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {account.accountNumber}
                      {account.accountName && <span className="font-sans"> · {account.accountName}</span>}
                    </p>
                  </div>

                  {/* Active toggle */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={account.isActive}
                      onChange={() => handleToggle(account.id, account.isActive)}
                      disabled={isPending}
                    />
                    <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-brand transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>

                  <button
                    type="button"
                    onClick={() => setEditingId(account.id)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(account.id)}
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

      {/* Add account form */}
      <form action={addAction} className="border border-dashed border-border rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add Payment Account</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            name="method"
            defaultValue="BKASH"
            className="w-full sm:w-40 text-sm px-3 py-2 rounded-lg border border-border focus:outline-none focus:border-brand bg-white"
          >
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <input
            name="label"
            required
            placeholder="Display label, e.g. bKash"
            className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg border border-border focus:outline-none focus:border-brand placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            name="accountNumber"
            required
            placeholder="Account / mobile number"
            className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg border border-border focus:outline-none focus:border-brand placeholder:text-muted-foreground font-mono"
          />
          <input
            name="accountName"
            placeholder="Account name (optional)"
            className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg border border-border focus:outline-none focus:border-brand placeholder:text-muted-foreground"
          />
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
