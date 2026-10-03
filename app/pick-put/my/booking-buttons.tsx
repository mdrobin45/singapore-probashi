"use client";

import { useState, useTransition } from "react";
import { acceptBookingAction, cancelBookingAction, closeTripAction, rejectBookingAction } from "@/app/actions/pick-put";

type Result = { error?: string; success?: boolean };

function ActionButton({
  label,
  confirmText,
  run,
  tone = "neutral",
}: {
  label: string;
  confirmText?: string;
  run: () => Promise<Result>;
  tone?: "primary" | "danger" | "neutral";
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const styles = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    danger: "border border-red-200 text-red-600 hover:bg-red-50",
    neutral: "border border-border text-muted-foreground hover:bg-muted",
  }[tone];

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirmText && !confirm(confirmText)) return;
          setError(null);
          startTransition(async () => {
            const res = await run();
            if (res.error) setError(res.error);
          });
        }}
        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${styles}`}
      >
        {isPending ? "…" : label}
      </button>
      {error && <span className="text-[11px] text-red-600 mt-1 max-w-48">{error}</span>}
    </span>
  );
}

export function TravelerBookingButtons({ bookingId }: { bookingId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton label="Accept" tone="primary" run={() => acceptBookingAction(bookingId)} />
      <ActionButton
        label="Decline"
        tone="danger"
        confirmText="Decline this booking? The customer will be refunded."
        run={() => rejectBookingAction(bookingId)}
      />
    </div>
  );
}

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  return (
    <ActionButton
      label="Cancel & Refund"
      tone="danger"
      confirmText="Cancel this booking? The full amount will be refunded to your wallet."
      run={() => cancelBookingAction(bookingId)}
    />
  );
}

export function CloseTripButton({ tripId }: { tripId: string }) {
  return (
    <ActionButton
      label="Stop Taking Bookings"
      confirmText="Close this trip to new bookings? Existing bookings are kept."
      run={() => closeTripAction(tripId)}
    />
  );
}
