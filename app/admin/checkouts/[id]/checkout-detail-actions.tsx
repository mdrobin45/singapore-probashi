"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generatePaymentLinkAction, approveCheckoutAction, rejectCheckoutAction, deleteCheckoutAction } from "@/app/actions/checkout";
import { waLink } from "@/lib/whatsapp";

// Persistent, always-renderable display of a checkout's pay link — the token
// lives on the Checkout row itself, so this can be shown any time after
// generation, not just in the moment right after clicking "Generate".
export function PaymentLinkCard({
  url,
  customerName,
  customerPhone,
  total,
}: {
  url: string;
  customerName: string;
  customerPhone: string | null;
  total: number;
}) {
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

export function GenerateLinkButton({ checkoutId }: { checkoutId: string }) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      const res = await generatePaymentLinkAction(checkoutId);
      if (res.error) setError(res.error);
      // No client-side success state needed — generating flips the checkout's
      // status server-side, which revalidates this page and the persistent
      // PaymentLinkCard (rendered by the parent based on checkout.status/token)
      // takes over from here.
    });
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

export function DeleteCheckoutButton({ checkoutId }: { checkoutId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this draft checkout? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteCheckoutAction(checkoutId);
      if (res.error) setError(res.error);
      else router.push("/admin/checkouts");
    });
  }

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="text-sm font-semibold px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
      >
        {isPending ? "Deleting…" : "Delete Checkout"}
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
