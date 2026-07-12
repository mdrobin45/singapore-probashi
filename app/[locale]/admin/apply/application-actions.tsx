"use client";

import { useState, useTransition } from "react";
import { updateApplicationStatusAction } from "@/app/actions/apply";

const STATUS_OPTIONS = [
  { value: "PENDING",     label: "Pending",     color: "bg-amber-100 text-amber-700" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { value: "COMPLETED",   label: "Completed",   color: "bg-green-100 text-green-700" },
  { value: "REJECTED",    label: "Rejected",    color: "bg-red-100 text-red-700" },
];

export function ApplicationActions({ id, status }: { id: string; status: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const current = STATUS_OPTIONS.find((s) => s.value === status);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 ${current?.color ?? ""}`}
      >
        {current?.label ?? status}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-40 bg-white rounded-xl shadow-lg border border-border w-56 p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Change Status</p>
            <div className="space-y-1 mb-3">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isPending || opt.value === status}
                  onClick={() => {
                    startTransition(() => updateApplicationStatusAction(id, opt.value, note || undefined));
                    setOpen(false);
                  }}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                    opt.value === status
                      ? "font-bold " + opt.color
                      : "hover:bg-muted text-foreground"
                  } disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add note (optional)…"
              rows={2}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-brand/30 resize-none"
            />
          </div>
        </>
      )}
    </div>
  );
}

export function FileViewer({ label, url }: { label: string; url: string | null }) {
  const [lightbox, setLightbox] = useState(false);

  if (!url) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <>
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="text-xs text-brand underline hover:no-underline"
      >
        {label}
      </button>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setLightbox(false)}>
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-foreground hover:bg-muted z-10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {url.startsWith("data:image") ? (
              <img src={url} alt={label} className="max-h-[85vh] rounded-xl object-contain" />
            ) : (
              <div className="bg-white rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">{label} (non-image file)</p>
                <a href={url} download className="text-sm text-brand underline">Download file</a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
