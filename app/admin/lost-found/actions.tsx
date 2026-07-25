"use client";

import { useTransition } from "react";
import { resolveLostFoundPostAction, removeLostFoundPostAction } from "@/app/actions/lost-found";

export function LostFoundActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  if (status !== "OPEN") return null;

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => resolveLostFoundPostAction(id))}
        className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
      >
        {isPending ? "…" : "Resolve"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => removeLostFoundPostAction(id))}
        className="text-xs px-3 py-1.5 border border-border text-muted-foreground rounded-lg font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 transition-colors"
      >
        Remove
      </button>
    </div>
  );
}
