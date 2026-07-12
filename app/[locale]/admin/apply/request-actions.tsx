"use client";

import { useTransition, useState } from "react";
import { updateServiceRequestStatusAction } from "@/app/actions/service-requests";

type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "PENDING",     label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED",   label: "Completed" },
  { value: "REJECTED",    label: "Rejected" },
];

const STATUS_STYLES: Record<Status, string> = {
  PENDING:     "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED:   "bg-green-100 text-green-700",
  REJECTED:    "bg-red-100 text-red-700",
};

export function RequestActions({ id, status }: { id: string; status: Status }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function update(s: Status) {
    startTransition(async () => {
      await updateServiceRequestStatusAction(id, s, note);
      setOpen(false);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}
      >
        {status.replace("_", " ")}
      </button>

      {open && (
        <div className="absolute right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-20 w-52 p-3 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Admin note (optional)"
            rows={2}
            className="w-full text-xs px-2 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand resize-none"
          />
          <div className="grid grid-cols-2 gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={isPending || opt.value === status}
                onClick={() => update(opt.value)}
                className={`text-[10px] font-semibold px-2 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                  opt.value === status
                    ? "border-brand bg-brand text-white"
                    : "border-border hover:border-brand hover:text-brand"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setOpen(false)}
            className="w-full text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export function DocLink({ label, url }: { label: string; url: string | null }) {
  if (!url) return null;
  const isImage = url.startsWith("data:image");
  return isImage ? (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[11px] text-brand hover:underline">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {label}
    </a>
  ) : (
    <a href={url} download
      className="inline-flex items-center gap-1 text-[11px] text-brand hover:underline">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {label}
    </a>
  );
}
