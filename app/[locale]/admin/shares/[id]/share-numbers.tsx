"use client";

import { useActionState, useTransition, useRef, useState } from "react";
import { createShareNumbersAction, deleteShareNumberAction, deleteAllUnassignedAction } from "@/app/actions/share-certificates";

type Cert = {
  id: string;
  shareNumber: number;
  ownerId: string | null;
  issuedAt: Date | null;
  owner: { fullName: string; email: string } | null;
};

export function ShareNumbersManager({
  projectId,
  certificates,
}: {
  projectId: string;
  certificates: Cert[];
}) {
  // Pending list (client-side, not yet saved)
  const [pending, setPending] = useState<number[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [inputError, setInputError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, action, saving] = useActionState(createShareNumbersAction, null);
  const [deleting, startDelete] = useTransition();

  const available = certificates.filter((c) => !c.ownerId);
  const assigned = certificates.filter((c) => c.ownerId);

  const existingNumbers = new Set(certificates.map((c) => c.shareNumber));

  function addNumber() {
    const raw = inputVal.trim();
    if (!raw) return;
    const n = parseInt(raw, 10);
    if (isNaN(n) || n < 1) { setInputError("Must be a positive integer."); return; }
    if (pending.includes(n)) { setInputError(`#${String(n).padStart(4, "0")} already in list.`); return; }
    if (existingNumbers.has(n)) { setInputError(`#${String(n).padStart(4, "0")} already exists in this project.`); return; }
    setPending((prev) => [...prev, n].sort((a, b) => a - b));
    setInputVal("");
    setInputError("");
    inputRef.current?.focus();
  }

  function removeFromPending(n: number) {
    setPending((prev) => prev.filter((x) => x !== n));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); addNumber(); }
  }

  function handleSave(formData: FormData) {
    formData.set("numbers", JSON.stringify(pending));
    action(formData);
    setPending([]);
  }

  function handleDeleteAll() {
    if (!confirm(`Delete all ${available.length} unassigned share numbers? This cannot be undone.`)) return;
    startDelete(async () => { await deleteAllUnassignedAction(projectId); });
  }

  function handleDelete(certId: string) {
    startDelete(async () => { await deleteShareNumberAction(certId, projectId); });
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Share Numbers</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {certificates.length} total ·{" "}
            <span className="text-green-600 font-medium">{available.length} available</span> ·{" "}
            <span className="text-brand font-medium">{assigned.length} assigned</span>
          </p>
        </div>
        {available.length > 0 && (
          <button type="button" onClick={handleDeleteAll} disabled={deleting}
            className="text-xs text-red-500 hover:text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
            Delete All Unassigned
          </button>
        )}
      </div>

      {/* Add one-by-one input */}
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <p className="text-xs font-semibold text-foreground mb-1">Add Share Numbers</p>
        <p className="text-[11px] text-muted-foreground mb-3">
          Type a unique number and press Enter or + to add it. Each number is the identity of one individual share.
        </p>

        {/* Input row */}
        <div className="flex gap-2 mb-3">
          <input
            ref={inputRef}
            type="number"
            min={1}
            value={inputVal}
            onChange={(e) => { setInputVal(e.target.value); setInputError(""); }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 1001"
            className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
          <button
            type="button"
            onClick={addNumber}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors text-lg font-bold shrink-0"
            title="Add number"
          >
            +
          </button>
        </div>

        {inputError && (
          <p className="text-xs text-red-500 mb-2">{inputError}</p>
        )}

        {/* Pending chips */}
        {pending.length > 0 && (
          <div className="mb-3">
            <p className="text-[11px] text-muted-foreground mb-2">{pending.length} number{pending.length !== 1 ? "s" : ""} ready to save:</p>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {pending.map((n) => (
                <span key={n} className="inline-flex items-center gap-1 text-xs font-mono bg-brand-50 border border-brand/30 text-brand px-2 py-1 rounded-lg">
                  #{String(n).padStart(4, "0")}
                  <button
                    type="button"
                    onClick={() => removeFromPending(n)}
                    className="text-brand/60 hover:text-red-500 ml-0.5 leading-none transition-colors"
                    title="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Save button */}
        {pending.length > 0 && (
          <form action={handleSave}>
            <input type="hidden" name="projectId" value={projectId} />
            <button type="submit" disabled={saving}
              className="bg-brand text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-brand-dark disabled:opacity-60 transition-colors">
              {saving ? "Saving…" : `Save ${pending.length} Share Number${pending.length !== 1 ? "s" : ""}`}
            </button>
          </form>
        )}

        {state?.error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2">
            {state.created} share number{(state.created ?? 0) !== 1 ? "s" : ""} saved successfully.
          </p>
        )}
      </div>

      {/* Existing numbers list */}
      {certificates.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-muted-foreground">
          No share numbers yet. Add them above.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Share #</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Holder</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Issued</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-2.5">
                    <span className="font-mono font-semibold text-foreground text-base">
                      #{String(cert.shareNumber).padStart(4, "0")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {cert.ownerId ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-100 text-green-700">Assigned</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Available</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {cert.owner ? (
                      <div>
                        <p className="text-sm font-medium text-foreground">{cert.owner.fullName}</p>
                        <p className="text-xs text-muted-foreground">{cert.owner.email}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {cert.issuedAt
                      ? cert.issuedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {!cert.ownerId && (
                      <button type="button" onClick={() => handleDelete(cert.id)} disabled={deleting}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
