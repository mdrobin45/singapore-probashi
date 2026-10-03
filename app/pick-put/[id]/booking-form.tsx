"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { bookTripAction } from "@/app/actions/pick-put";
import { bookingTotal } from "@/lib/pick-put-utils";

const INPUT =
  "w-full px-3.5 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm";

export function BookingForm({
  tripId,
  ratePerKg,
  remainingKg,
  balance,
}: {
  tripId: string;
  ratePerKg: number;
  remainingKg: number;
  balance: number;
}) {
  const [state, action, pending] = useActionState(bookTripAction, null);
  const [weight, setWeight] = useState("");

  const weightNum = Number(weight) || 0;
  const total = weightNum > 0 ? bookingTotal(weightNum, ratePerKg) : 0;
  const short = total > balance;

  if (state?.success) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-semibold text-foreground mb-2">Space booked!</p>
        <p className="text-sm text-muted-foreground mb-5">{state.message}</p>
        <Link href="/pick-put/my" className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
          View My Bookings
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="tripId" value={tripId} />
      <h2 className="font-semibold text-foreground">Book space</h2>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Weight (kg)</label>
        <input
          name="weightKg"
          type="number"
          required
          min={0.5}
          max={remainingKg}
          step={0.5}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder={`Up to ${remainingKg} kg`}
          className={INPUT}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">What are you sending?</label>
        <textarea name="itemDescription" required rows={3} maxLength={500} placeholder="e.g. Clothes and dry food, 1 sealed bag" className={INPUT} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Receiver Name</label>
          <input name="receiverName" type="text" required maxLength={100} className={INPUT} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Receiver Phone</label>
          <input name="receiverPhone" type="tel" required maxLength={30} placeholder="01700-000000" className={INPUT} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Receiver Address <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input name="receiverAddress" type="text" maxLength={300} className={INPUT} />
      </div>

      {weightNum > 0 && (
        <div className="bg-muted rounded-xl px-4 py-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{weightNum} kg × ৳{ratePerKg.toFixed(2)}</span>
            <span className={`font-bold ${short ? "text-red-600" : "text-foreground"}`}>৳{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Wallet balance</span>
            <span className="text-muted-foreground">৳{balance.toFixed(2)}</span>
          </div>
          {short && (
            <p className="text-xs text-red-600 pt-1">
              Not enough balance. <Link href="/dashboard/deposit" className="font-semibold underline">Deposit funds</Link> first.
            </p>
          )}
        </div>
      )}

      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <button
        type="submit"
        disabled={pending || short}
        className="w-full bg-brand text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {pending ? "Booking…" : total > 0 ? `Pay ৳${total.toFixed(2)} & Book` : "Book Space"}
      </button>
      <p className="text-[11px] text-muted-foreground text-center">
        Your payment is held by the platform and only released to the traveler after delivery. Full refund if rejected.
      </p>
    </form>
  );
}
