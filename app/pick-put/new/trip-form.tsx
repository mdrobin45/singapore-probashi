"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createTripAction } from "@/app/actions/pick-put";
import { DIRECTION_LABELS, type TripDirection } from "@/lib/pick-put-utils";

type Rate = { direction: TripDirection | null; startDate: string; endDate: string; ratePerKg: number };

const INPUT =
  "w-full px-3.5 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm";

// Mirrors resolvePickPutRate() in lib/pick-put.ts — rates arrive newest first.
function previewRate(rates: Rate[], date: string, direction: TripDirection | null): number | null {
  if (!date || !direction) return null;
  const match = rates.find(
    (r) => r.startDate <= date && r.endDate >= date && (r.direction === null || r.direction === direction)
  );
  return match ? match.ratePerKg : null;
}

export function TripForm({ rates, minDate }: { rates: Rate[]; minDate: string }) {
  const [state, action, pending] = useActionState(createTripAction, null);
  const [direction, setDirection] = useState<TripDirection | null>(null);
  const [date, setDate] = useState("");
  const [kg, setKg] = useState("");

  const rate = previewRate(rates, date, direction);
  const kgNum = Number(kg) || 0;

  if (state?.success) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-semibold text-foreground mb-2">Trip submitted!</p>
        <p className="text-sm text-muted-foreground mb-5">{state.message}</p>
        <Link href="/pick-put/my" className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
          View My Trips
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Route</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(DIRECTION_LABELS) as TripDirection[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={`border-2 rounded-xl px-4 py-3 text-sm font-semibold text-center transition-all ${
                direction === d ? "border-brand bg-brand-50 text-brand" : "border-border text-muted-foreground hover:border-brand/40"
              }`}
            >
              {DIRECTION_LABELS[d]}
            </button>
          ))}
        </div>
        <input type="hidden" name="direction" value={direction ?? ""} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Travel Date</label>
          <input name="travelDate" type="date" required min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Spare Space (kg)</label>
          <input
            name="totalKg"
            type="number"
            required
            min={1}
            max={100}
            step={0.5}
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            placeholder="e.g. 10"
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Flight <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input name="flightInfo" type="text" maxLength={100} placeholder="e.g. SQ 446, Changi T3" className={INPUT} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Notes <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          maxLength={500}
          placeholder="What you will / won't carry, where to hand over items, etc."
          className={INPUT}
        />
      </div>

      {direction && date && (
        <div className="bg-muted rounded-xl px-4 py-3 text-sm">
          {rate !== null ? (
            <p className="text-foreground">
              Rate for this date: <strong>৳{rate.toFixed(2)}/kg</strong>
              {kgNum > 0 && (
                <span className="text-muted-foreground"> · up to ৳{(rate * kgNum).toFixed(2)} if fully booked</span>
              )}
            </p>
          ) : (
            <p className="text-muted-foreground">Admin will set the per-kg rate for this date when approving your trip.</p>
          )}
        </div>
      )}

      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <button
        type="submit"
        disabled={pending || !direction}
        className="w-full bg-brand text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit Trip for Approval"}
      </button>
    </form>
  );
}
