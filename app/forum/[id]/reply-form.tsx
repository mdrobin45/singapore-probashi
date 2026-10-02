"use client";

import { useActionState, useRef, useEffect } from "react";
import { createReplyAction } from "@/app/actions/forum";

export function ReplyForm({ topicId }: { topicId: string }) {
  const [state, action, pending] = useActionState(createReplyAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="topicId" value={topicId} />
      <textarea
        name="content"
        required
        rows={3}
        placeholder="Write your reply or answer..."
        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none bg-white"
      />

      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-60 shadow-2xs cursor-pointer"
        >
          {pending ? "Replying…" : "Post Reply"}
        </button>
      </div>
    </form>
  );
}
