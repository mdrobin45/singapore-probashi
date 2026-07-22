"use client";

import { useState, useTransition } from "react";
import { generatePaymentLinkAction, approveCheckoutAction, rejectCheckoutAction } from "@/app/actions/checkout";
import { waLink } from "@/lib/whatsapp";

export function GenerateLinkButton({
  checkoutId,
  baseUrl,
  customerName,
  customerPhone,
  total,
}: {
  checkoutId: string;
  baseUrl: string;
  customerName: string;
  customerPhone: string | null;
  total: number;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      const res = await generatePaymentLinkAction(checkoutId);
      if (res.error) setError(res.error);
      else if (res.token) setToken(res.token);
    });
  }

  if (token) {
    const url = `${baseUrl}/pay/${token}`;
    const message = `Hi ${customerName}, here's your payment link for ৳${total.toFixed(2)}: ${url}`;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input readOnly value={url} className="flex-1 text-xs px-3 py-2 border border-border rounded-lg bg-muted/50" />
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(url)}
            className="text-xs font-semibold px-3 py-2 border border-border rounded-lg hover:border-brand hover:text-brand transition-colors"
          >
            Copy
          </button>
        </div>
        {customerPhone && (
          <a
            href={waLink(customerPhone, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#25D366] px-3 py-2 rounded-lg hover:bg-[#1ebe5a] transition-colors"
          >
            Send via WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={generate}
        className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {isPending ? "Generating…" : "Generate Payment Link"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}

export function ReviewActions({ checkoutId }: { checkoutId: string }) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function approve() {
    startTransition(() => approveCheckoutAction(checkoutId));
  }

  function reject() {
    startTransition(async () => {
      await rejectCheckoutAction(checkoutId, note);
      setRejecting(false);
    });
  }

  if (rejecting) {
    return (
      <div className="space-y-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason for rejection"
          rows={2}
          className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-brand resize-none"
        />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={reject}
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            Confirm Reject
          </button>
          <button
            type="button"
            onClick={() => setRejecting(false)}
            className="text-sm font-semibold px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={approve}
        className="text-sm font-semibold px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        {isPending ? "Approving…" : "Approve Payment"}
      </button>
      <button
        type="button"
        onClick={() => setRejecting(true)}
        className="text-sm font-semibold px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
      >
        Reject
      </button>
    </div>
  );
}
