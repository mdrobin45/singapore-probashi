"use client";

import { useActionState, useState, useTransition } from "react";
import {
  acceptBookingAction,
  approveTripAction,
  closeTripAction,
  createRateAction,
  deleteRateAction,
  markDeliveredAction,
  rejectBookingAction,
  rejectTripAction,
} from "@/app/actions/pick-put";

type Result = { error?: string; success?: boolean };

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm";

function useRunner() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function run(fn: () => Promise<Result>, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
    });
  }
  return { isPending, error, run };
}

export function TripApproval({ tripId, suggestedRate }: { tripId: string; suggestedRate: number }) {
  const { isPending, error, run } = useRunner();
  const [rate, setRate] = useState(suggestedRate > 0 ? String(suggestedRate) : "");
  const [note, setNote] = useState("");

  return (
    <div className="space-y-2 w-full sm:w-64">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
        <input
          type="number"
          min={0.01}
          step={0.01}
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="Rate per kg"
          className={`${INPUT} pl-7 pr-12`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/kg</span>
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className={INPUT} />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => approveTripAction(tripId, Number(rate), note))}
          className="flex-1 text-xs font-semibold py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => rejectTripAction(tripId, note), "Reject this trip?")}
          className="flex-1 text-xs font-semibold py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function CloseTrip({ tripId }: { tripId: string }) {
  const { isPending, error, run } = useRunner();
  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        disabled={isPending}
        onClick={() => run(() => closeTripAction(tripId), "Close this trip to new bookings?")}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
      >
        Close Trip
      </button>
      {error && <span className="text-xs text-red-600 mt-1">{error}</span>}
    </span>
  );
}

export function BookingSettlement({ bookingId, status }: { bookingId: string; status: "PENDING" | "ACCEPTED" }) {
  const { isPending, error, run } = useRunner();
  return (
    <div className="flex flex-col sm:items-end gap-1">
      <div className="flex flex-wrap gap-2">
        {status === "PENDING" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => acceptBookingAction(bookingId))}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
          >
            Accept
          </button>
        )}
        {status === "ACCEPTED" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => markDeliveredAction(bookingId), "Confirm delivery? The held amount will be paid to the traveler's wallet.")}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            Mark Delivered & Pay Traveler
          </button>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => rejectBookingAction(bookingId), "Reject this booking and refund the customer?")}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Reject & Refund
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function DeleteRate({ rateId }: { rateId: string }) {
  const { isPending, error, run } = useRunner();
  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        disabled={isPending}
        onClick={() => run(() => deleteRateAction(rateId), "Delete this rate? Existing trips keep their locked rate.")}
        className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
      >
        Delete
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}

export function RateForm() {
  const [state, action, pending] = useActionState(createRateAction, null);

  return (
    <form action={action} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
      <div className="lg:col-span-1">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Route</label>
        <select name="direction" defaultValue="BOTH" className={INPUT}>
          <option value="BOTH">Both ways</option>
          <option value="SG_TO_BD">SG → BD</option>
          <option value="BD_TO_SG">BD → SG</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">From</label>
        <input name="startDate" type="date" required className={INPUT} />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">To</label>
        <input name="endDate" type="date" required className={INPUT} />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Rate (৳/kg)</label>
        <input name="ratePerKg" type="number" required min={0.01} step={0.01} placeholder="e.g. 500" className={INPUT} />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Note</label>
        <input name="note" type="text" maxLength={200} placeholder="e.g. Eid rush" className={INPUT} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add Rate"}
      </button>
      {state?.error && <p className="sm:col-span-2 lg:col-span-6 text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="sm:col-span-2 lg:col-span-6 text-sm text-green-700">Rate added.</p>}
    </form>
  );
}
