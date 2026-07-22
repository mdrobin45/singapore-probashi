"use client";

import { useState } from "react";

export function ReferralCard({ code, title, hint, copyLabel, copiedLabel }: {
  code: string;
  title: string;
  hint: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="bg-white rounded-xl border border-border p-5 mb-5">
      <h2 className="font-semibold text-foreground mb-1 text-sm">{title}</h2>
      <p className="text-xs text-muted-foreground mb-3">{hint}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-sm font-mono font-bold text-brand bg-brand-50 border border-brand/20 px-4 py-2.5 rounded-lg">
          {code}
        </code>
        <button
          type="button"
          onClick={copy}
          className="text-xs font-semibold px-4 py-2.5 rounded-lg border border-border hover:border-brand hover:text-brand transition-colors"
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
    </div>
  );
}
