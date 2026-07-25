"use client";

import { useActionState, useState } from "react";
import { createShareBuyRequestAction } from "@/app/actions/shares";
import { sgdToBdt } from "@/lib/share-pricing-utils";

export function BuyRequestForm({ defaultName, rate }: { defaultName: string; rate: number }) {
  const [state, action, pending] = useActionState(createShareBuyRequestAction, null);
  const [price, setPrice] = useState("");

  if (state?.success) {
    return (
      <div className="px-7 py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-bold text-foreground text-lg mb-1">Buy Request Submitted!</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="p-7 space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Your Name</label>
        <input
          type="text"
          name="name"
          defaultValue={defaultName}
          required
          minLength={2}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
        />
      </div>

      {/* Share number */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Share Number</label>
        <input
          type="text"
          name="shareNumber"
          placeholder="e.g. 0007"
          maxLength={20}
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
        />
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Share Size</label>
        <select
          name="size"
          defaultValue="SMALL"
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
        >
          <option value="SMALL">Small</option>
          <option value="BIG">Big</option>
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Desired Price (SGD){" "}
          <span className="text-muted-foreground font-normal">1 SGD = ৳{rate.toFixed(2)} BDT</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
          <input
            type="number"
            name="price"
            min={0.01}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
          />
        </div>
        {price && Number(price) > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            BDT equivalent: <span className="font-semibold text-foreground">৳{sgdToBdt(Number(price), rate).toFixed(2)}</span>
          </p>
        )}
      </div>

      {/* Preferred date */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Date</label>
        <input
          type="date"
          name="preferredDate"
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
        />
      </div>

      {state?.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-brand text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit Buy Request"}
      </button>
    </form>
  );
}
