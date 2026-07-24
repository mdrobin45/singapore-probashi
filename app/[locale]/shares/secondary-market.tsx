"use client";

import { useActionState, useState } from "react";
import { requestShareTradeAction } from "@/app/actions/shares";
import { sgdToBdt } from "@/lib/share-pricing-utils";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { SessionPayload } from "@/lib/session";

type Listing = {
  id: string;
  quantity: number;
  askingPrice: unknown;
  status: string;
  createdAt: Date;
  seller: { fullName: string };
  project: { name: string; sharePriceSgd: unknown };
};

const PAYMENT_METHODS = [
  { value: "BKASH", label: "bKash", needsTxId: true },
  { value: "NAGAD", label: "Nagad", needsTxId: true },
  { value: "ROCKET", label: "Rocket", needsTxId: true },
  { value: "BANK_TRANSFER", label: "Bank Transfer", needsTxId: true },
  { value: "WALLET", label: "Platform Wallet", needsTxId: false },
];

function TradeForm({ listing, rate }: { listing: Listing; rate: number }) {
  const t = useTranslations("shares");
  const [state, action, pending] = useActionState(requestShareTradeAction, null);
  const [qty, setQty] = useState(1);
  const [method, setMethod] = useState("BKASH");

  if (state?.success) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
        {state.message}
      </div>
    );
  }

  const askingPrice = Number(listing.askingPrice);
  const marketPrice = sgdToBdt(Number(listing.project.sharePriceSgd), rate);
  const premium = askingPrice > marketPrice
    ? `+${(((askingPrice - marketPrice) / marketPrice) * 100).toFixed(1)}%`
    : askingPrice < marketPrice
    ? `${(((askingPrice - marketPrice) / marketPrice) * 100).toFixed(1)}%`
    : t("atMarket");
  const needsTxId = PAYMENT_METHODS.find((m) => m.value === method)?.needsTxId ?? true;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="listingId" value={listing.id} />

      <div>
        <label className="block text-xs font-medium text-foreground mb-1">{t("quantityMax", { max: listing.quantity })}</label>
        <input
          type="number"
          name="quantity"
          min={1}
          max={listing.quantity}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          required
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        />
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("total")}: <span className="font-bold text-foreground">৳{(qty * askingPrice).toFixed(2)}</span>
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1">{t("paymentMethod")}</label>
        <select
          name="paymentMethod"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {needsTxId && (
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">{t("transactionId")}</label>
          <input
            type="text"
            name="txId"
            placeholder="e.g. BKS2026XXXXXX"
            required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
      )}

      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-brand text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {pending ? t("submitting") : t("buyShares")}
      </button>
    </form>
  );
}

function ListingCard({ listing, session, rate }: { listing: Listing; session: SessionPayload | null; rate: number }) {
  const t = useTranslations("shares");
  const [expanded, setExpanded] = useState(false);
  const askingPrice = Number(listing.askingPrice);
  const marketPrice = sgdToBdt(Number(listing.project.sharePriceSgd), rate);
  const diff = askingPrice - marketPrice;
  const pct = ((diff / marketPrice) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-brand bg-brand-50 px-2 py-0.5 rounded">{t("resellLabel")}</span>
              <span className="text-xs text-muted-foreground">
                {t("bySeller", { name: listing.seller.fullName.split(" ")[0] })}
              </span>
            </div>
            <h3 className="font-semibold text-foreground">{listing.project.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("sharesAvailable", { count: listing.quantity })}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-foreground">৳{askingPrice.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">{t("perShareLabel")}</p>
            <p className={`text-[11px] font-semibold mt-0.5 ${diff > 0 ? "text-red-500" : diff < 0 ? "text-green-600" : "text-muted-foreground"}`}>
              {diff > 0
                ? t("vsMarketAbove", { pct: `+${pct}` })
                : diff < 0
                ? t("vsMarketBelow", { pct })
                : t("atMarketPrice")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-muted-foreground">
            {t("totalValue")}: <span className="font-semibold text-foreground">৳{(listing.quantity * askingPrice).toFixed(2)}</span>
          </div>
          {session ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm font-semibold text-brand hover:underline"
            >
              {expanded ? t("cancelBuy") : t("buyArrow")}
            </button>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-brand hover:underline">
              {t("loginToBuy")}
            </Link>
          )}
        </div>

        {expanded && session && (
          <div className="mt-5 pt-5 border-t border-border">
            <TradeForm listing={listing} rate={rate} />
          </div>
        )}
      </div>
    </div>
  );
}

export function SecondaryMarket({
  listings,
  session,
  rate,
}: {
  listings: Listing[];
  session: SessionPayload | null;
  rate: number;
}) {
  const t = useTranslations("shares");

  if (listings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📉</div>
        <h3 className="font-bold text-foreground text-lg mb-2">{t("noResellListings")}</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {t("noResellDesc")}
        </p>
        <Link href="/shares" className="inline-block mt-5 bg-brand text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
          {t("browsePrimaryMarket")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-800">
        <strong>{t("secondaryTab")}</strong> — {t("secondaryMarketNotice")}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} session={session} rate={rate} />
        ))}
      </div>
    </div>
  );
}
