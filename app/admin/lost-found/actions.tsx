"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  resolveLostFoundPostAction,
  removeLostFoundPostAction,
  updateLostFoundPostAction,
  deleteLostFoundPostAction,
} from "@/app/actions/lost-found";

const INPUT = "w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white";

type Post = {
  id: string;
  status: string;
  type: "LOST" | "FOUND";
  title: string;
  description: string;
  location: string | null;
};

function EditPostModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateLostFoundPostAction, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pb-20 lg:pb-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[calc(100vh-6rem)] lg:max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-bold text-foreground">Edit Post</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form action={action} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <input type="hidden" name="postId" value={post.id} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Type *</label>
              <select name="type" required defaultValue={post.type} className={INPUT}>
                <option value="LOST">Lost</option>
                <option value="FOUND">Found</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Location</label>
              <input name="location" defaultValue={post.location ?? ""} placeholder="e.g. Little India MRT" className={INPUT} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Title *</label>
            <input name="title" required defaultValue={post.title} className={INPUT} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Description *</label>
            <textarea name="description" required rows={4} defaultValue={post.description} className={`${INPUT} resize-none`} />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{state.error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-60 transition-colors"
            >
              {pending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function LostFoundActions({ id, status, type, title, description, location }: Post) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {status === "OPEN" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => resolveLostFoundPostAction(id))}
            className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {isPending ? "…" : "Resolve"}
          </button>
        )}
        {status === "OPEN" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => removeLostFoundPostAction(id))}
            className="text-xs px-3 py-1.5 border border-border text-muted-foreground rounded-lg font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 transition-colors"
          >
            Remove
          </button>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() => setEditing(true)}
          className="text-xs px-3 py-1.5 border border-border text-muted-foreground rounded-lg font-medium hover:bg-muted hover:text-foreground disabled:opacity-50 transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (confirm("Delete this post permanently? This cannot be undone.")) {
              startTransition(() => deleteLostFoundPostAction(id));
            }
          }}
          className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          Delete
        </button>
      </div>

      {editing && (
        <EditPostModal
          post={{ id, status, type, title, description, location }}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
