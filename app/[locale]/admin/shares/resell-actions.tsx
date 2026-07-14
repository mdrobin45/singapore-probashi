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

  function handle(status: "APPROVED" | "REJECTED") {
    setError(null);
    startTransition(async () => {
      const result = await processResellAction({ listingId, tradeId, buyRequestId, type, status });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      <div className="flex gap-2">
        <button
          onClick={() => handle("APPROVED")}
          disabled={pending}
          className="text-xs font-semibold bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {pending ? "…" : "Approve"}
        </button>
        <button
          onClick={() => handle("REJECTED")}
          disabled={pending}
          className="text-xs font-semibold bg-red-100 hover:bg-red-500 hover:text-white text-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
        >
          Reject
        </button>
      </div>
      {error && <p className="text-[11px] text-red-600 max-w-48 text-right">{error}</p>}
    </div>
  );
}
