"use client";

import { useTransition } from "react";
import { resolveLostFoundPostAction, removeLostFoundPostAction } from "@/app/actions/lost-found";

export function PostOwnerActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="border-t border-border pt-3 mt-3 flex gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => resolveLostFoundPostAction(id))}
        className="flex-1 text-xs py-1.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
      >
        {isPending ? "…" : "✓ Mark Resolved"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("Remove this post?")) {
            startTransition(() => removeLostFoundPostAction(id));
          }
        }}
        className="text-xs px-3 py-1.5 border border-border text-muted-foreground rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 transition-colors"
      >
        Remove
      </button>
    </div>
  );
}
