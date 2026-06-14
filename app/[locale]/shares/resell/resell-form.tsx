"use client";

import { useActionState, useState } from "react";
import { createShareListingAction } from "@/app/actions/shares";
import { useTranslations } from "next-intl";

type Ownership = {
  id: string;
  quantity: number;
  purchasePrice: unknown;
  project: { id: string; name: string; sharePrice: unknown; status: string };
};

export function ResellForm({
  ownerships,
  selectedId,
}: {
  ownerships: Ownership[];
  selectedId: string | null;
}) {
  const t = useTranslations("shares");
  const [state, action, pending] = useActionState(createShareListingAction, null);
  const [ownershipId, setOwnershipId] = useState(selectedId ?? ownerships[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");

  const selected = ownerships.find((o) => o.id === ownershipId);
  const marketPrice = selected ? Number(selected.project.sharePrice) : 0;
  const total = qty * Number(price || 0);

  if (state?.success) {
    return (
      <div className="px-7 py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-bold text-foreground text-lg mb-1">{t("listingSubmitted")}</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="p-7 space-y-5">
      {/* Select project */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t("selectProject")}</label>
        <select
          name="ownershipId"
          value={ownershipId}
          onChange={(e) => {
            setOwnershipId(e.target.value);
            setQty(1);
            setPrice("");
          }}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
        >
          {ownerships.map((o) => (
            <option key={o.id} value={o.id}>
              {o.project.name} — {t("sharesOwned", { count: o.quantity })}
            </option>
          ))}
        </select>
        {selected && (
          <p className="text-xs text-muted-foreground mt-1">
            {t("marketPriceLabel")}: <span className="font-semibold text-foreground">S${marketPrice.toFixed(2)}</span> {t("perShareLabel")} ·
            {t("boughtAtLabel")}: <span className="font-semibold text-foreground">S${Number(selected.purchasePrice).toFixed(2)}</span>
          </p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {t("quantityToSell")} <span className="text-muted-foreground font-normal">({t("maxLabel", { max: selected?.quantity ?? 0 })})</span>
        </label>
        <input
          type="number"
          name="quantity"
          min={1}
          max={selected?.quantity ?? 1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
        />
      </div>

      {/* Asking price */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t("resell.price")}</label>
        <input
          type="number"
          name="askingPrice"
          min={1}
          step="0.01"
          placeholder={`${t("marketPriceLabel")}: ${marketPrice.toFixed(2)}`}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
        />
        {price && Number(price) > 0 && (
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {t("totalListingValue")}: <span className="font-bold text-foreground">S${total.toFixed(2)}</span>
            </span>
            {Number(price) !== marketPrice && (
              <span className={`font-semibold ${Number(price) > marketPrice ? "text-red-500" : "text-green-600"}`}>
                {Number(price) > marketPrice
                  ? t("aboveMarket", { pct: (((Number(price) - marketPrice) / marketPrice) * 100).toFixed(1) })
                  : t("belowMarket", { pct: (((Number(price) - marketPrice) / marketPrice) * 100).toFixed(1) })}
              </span>
            )}
          </div>
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
        {pending ? t("submitting") : t("resell.submit")}
      </button>
    </form>
  );
}
