"use client";

import { useState, useTransition } from "react";
import { processResellAction } from "@/app/actions/admin-shares";

export function ResellActions({
  listingId,
  tradeId,
  buyRequestId,
  type,
}: {
  listingId?: string;
  tradeId?: string;
  buyRequestId?: string;
  type: "listing" | "trade" | "buyRequest";
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [ticketFileBase64, setTicketFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleStandard(status: "APPROVED" | "REJECTED") {
    setError(null);
    startTransition(async () => {
      const result = await processResellAction({ listingId, tradeId, buyRequestId, type, status });
      if (result?.error) setError(result.error);
    });
  }

  function handleConfirmBuyRequest(status: "APPROVED" | "REJECTED") {
    setError(null);
    startTransition(async () => {
      const result = await processResellAction({
        listingId,
        tradeId,
        buyRequestId,
        type,
        status,
        ticketFileUrl: ticketFileBase64 ?? undefined,
        adminNote: adminNote || undefined,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setConfirming(false);
      }
    });
  }

  if (type === "buyRequest" && confirming) {
    return (
      <div className="bg-white border border-border rounded-xl shadow-lg p-3.5 w-72 space-y-2.5 text-left shrink-0 z-10 animate-in fade-in">
        <p className="text-xs font-bold text-foreground">Confirm Buy Request</p>
        
        <div>
          <label className="block text-[10px] text-muted-foreground font-semibold mb-1">
            Attach Slip / Ticket (Optional PDF or Image):
          </label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setFileName(file.name);
              const reader = new FileReader();
              reader.onload = () => setTicketFileBase64(reader.result as string);
              reader.readAsDataURL(file);
            }}
            className="w-full text-[10px] text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-brand-50 file:text-brand"
          />
          {fileName && <p className="text-[10px] text-brand truncate mt-0.5">Attached: {fileName}</p>}
        </div>

        <div>
          <label className="block text-[10px] text-muted-foreground font-semibold mb-1">
            Admin Note (Optional):
          </label>
          <input
            type="text"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="e.g. Ticket purchased, good luck!"
            className="w-full text-xs px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {error && (
          <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            disabled={pending}
            onClick={() => handleConfirmBuyRequest("APPROVED")}
            className="flex-1 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
          >
            {pending ? "…" : "Confirm & Deduct"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="text-xs px-2.5 py-1.5 border border-border rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (type === "buyRequest") {
              setConfirming(true);
            } else {
              handleStandard("APPROVED");
            }
          }}
          disabled={pending}
          className="text-xs font-semibold bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
        >
          {pending ? "…" : "Approve"}
        </button>
        <button
          onClick={() => {
            if (type === "buyRequest") {
              handleConfirmBuyRequest("REJECTED");
            } else {
              handleStandard("REJECTED");
            }
          }}
          disabled={pending}
          className="text-xs font-semibold bg-red-100 hover:bg-red-500 hover:text-white text-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
        >
          Reject
        </button>
      </div>
      {error && <p className="text-[11px] text-red-600 max-w-48 text-right">{error}</p>}
    </div>
  );
}
