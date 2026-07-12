"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { createArticleAction, deleteArticleAction, toggleArticleStatusAction } from "@/app/actions/islamic";

const INPUT = "w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white";

export function ArticleForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createArticleAction, null);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors"
      >
        + Add Article
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-base font-bold text-foreground">Add New Article</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <form action={action} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Title *</label>
                <input name="title" required placeholder="Article title..." className={INPUT} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Excerpt <span className="font-normal text-muted-foreground">(short summary shown in listing)</span></label>
                <textarea name="excerpt" rows={2} placeholder="1–2 sentence summary..." className={`${INPUT} resize-none`} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Content *</label>
                <textarea name="content" required rows={10} placeholder="Full article content..." className={`${INPUT} resize-y`} />
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Status</label>
                  <select name="status" className="px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white">
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              {state?.error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{state.error}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-5 py-2 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-60 transition-colors"
                >
                  {pending ? "Saving…" : "Save Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function ArticleActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => toggleArticleStatusAction(id, status))}
        className="text-xs text-brand hover:underline disabled:opacity-50"
      >
        {isPending ? "…" : status === "PUBLISHED" ? "Unpublish" : "Publish"}
      </button>
      <span className="text-border">·</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this article?")) startTransition(() => deleteArticleAction(id));
        }}
        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
