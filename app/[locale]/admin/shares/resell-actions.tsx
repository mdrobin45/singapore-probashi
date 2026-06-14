"use client";

import { useTransition } from "react";
import { processResellAction } from "@/app/actions/admin-shares";

export function ResellActions({
  listingId,
  tradeId,
  type,
}: {
  listingId?: string;
  tradeId?: string;
  type: "listing" | "trade";
}) {
  const [pending, startTransition] = useTransition();

  function handle(status: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      await processResellAction({ listingId, tradeId, type, status });
    });
  }

  return (
    <div className="flex gap-2 shrink-0">
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
  );
}
