"use client";

import { useState } from "react";

export function ReferralCard({ code, title, hint, copyLabel, copiedLabel, linkLabel }: {
  code: string;
  title: string;
  hint: string;
  copyLabel: string;
  copiedLabel: string;
  linkLabel: string;
}) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const origin = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const link = `${origin}/register?ref=${code}`;

  function copy(text: string, which: "code" | "link") {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="bg-white rounded-xl border border-border p-5 mb-5">
      <h2 className="font-semibold text-foreground mb-1 text-sm">{title}</h2>
      <p className="text-xs text-muted-foreground mb-3">{hint}</p>

      <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{linkLabel}</label>
      <div className="flex items-center gap-2 mb-3">
        <code className="flex-1 text-xs font-mono text-foreground bg-muted border border-border px-3.5 py-2.5 rounded-lg truncate">
          {link}
        </code>
        <button
          type="button"
          onClick={() => copy(link, "link")}
          className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors shrink-0"
        >
          {copied === "link" ? copiedLabel : copyLabel}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <code className="flex-1 text-sm font-mono font-bold text-brand bg-brand-50 border border-brand/20 px-4 py-2.5 rounded-lg">
          {code}
        </code>
        <button
          type="button"
          onClick={() => copy(code, "code")}
          className="text-xs font-semibold px-4 py-2.5 rounded-lg border border-border hover:border-brand hover:text-brand transition-colors shrink-0"
        >
          {copied === "code" ? copiedLabel : copyLabel}
        </button>
      </div>
    </div>
  );
}
