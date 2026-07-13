"use client";

import { useActionState, useState } from "react";
import { createShareBuyRequestAction } from "@/app/actions/shares";
import { useTranslations } from "next-intl";

export function BuyRequestForm({ defaultName }: { defaultName: string }) {
  const t = useTranslations("shares");
  const [state, action, pending] = useActionState(createShareBuyRequestAction, null);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");
  const total = qty * Number(price || 0);

  if (state?.success) {
    return (
      <div className="px-7 py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-bold text-foreground text-lg mb-1">{t("buyRequestSubmitted")}</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="p-7 space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t("yourName")}</label>
        <input
          type="text"
          name="name"
          defaultValue={defaultName}
          required
          minLength={2}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
        />
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t("quantityWanted")}</label>
        <input
          type="number"
          name="quantity"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
        />
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t("shareSize")}</label>
        <select
          name="size"
          defaultValue="SMALL"
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
        >
          <option value="SMALL">{t("sizeSmall")}</option>
          <option value="BIG">{t("sizeBig")}</option>
        </select>
      </div>

      {/* Price per share */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t("desiredPricePerShare")}</label>
        <input
          type="number"
          name="pricePerShare"
          min={1}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
        />
        {price && Number(price) > 0 && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t("total")}: <span className="font-bold text-foreground">৳{total.toFixed(2)}</span>
          </p>
        )}
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
        {pending ? t("submitting") : t("submitBuyRequest")}
      </button>
    </form>
  );
}
