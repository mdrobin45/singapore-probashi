"use client";

import { useState, useTransition } from "react";
import { runDueRemindersAction } from "@/app/actions/reminders";

export function ReminderCronPanel({ cronUrl }: { cronUrl: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ text: string; error?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-3 pt-5 mt-5 border-t border-border">
      <div>
        <p className="text-sm font-semibold text-foreground">Automatic sending</p>
        <p className="text-xs text-muted-foreground mt-1">
          Reminders are sent when this link is visited. Create a free job at{" "}
          <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer" className="text-brand font-semibold underline">
            cron-job.org
          </a>{" "}
          that opens it <strong>every 5 minutes</strong>. Keep the link private.
        </p>
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={cronUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 min-w-0 text-xs font-mono px-3 py-2 rounded-lg border border-border bg-muted text-foreground"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(cronUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="shrink-0 text-xs font-semibold px-3 py-2 rounded-lg border border-border hover:bg-muted"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await runDueRemindersAction();
            setResult(res.error ? { text: res.error, error: true } : { text: res.message ?? "Done." });
          })
        }
        className="text-xs font-semibold px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send due reminders now"}
      </button>
      {result && <p className={`text-xs ${result.error ? "text-red-600" : "text-green-700"}`}>{result.text}</p>}
    </div>
  );
}
