"use client";

import { useActionState } from "react";
import { requestTaxiAction } from "@/app/actions/taxi";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function TaxiRequestForm() {
  const [state, action, pending] = useActionState(requestTaxiAction, null);
  const t = useTranslations("taxi");

  if (state?.success) {
    return (
      <div className="bg-white rounded-2xl border border-border p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{t("successTitle")}</h3>
        <p className="text-muted-foreground text-sm mb-5">{state.message}</p>
        <Link
          href="/taxi/my"
          className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
        >
          {t("myRequests")}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-7 py-5 border-b border-border">
        <h2 className="font-bold text-foreground text-lg">{t("formTitle")}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{t("formSubtitle")}</p>
      </div>

      <form action={action} className="p-7 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("pickup")}</label>
            <input
              name="pickupLocation"
              type="text"
              required
              placeholder={t("pickupPlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("dropoff")}</label>
            <input
              name="destination"
              type="text"
              required
              placeholder={t("dropoffPlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("date")}</label>
            <input
              name="date"
              type="datetime-local"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("passengers")}</label>
            <input
              name="passengerCount"
              type="number"
              required
              min={1}
              max={10}
              defaultValue={1}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("notes")} <span className="text-muted-foreground font-normal">({t("notesOptional")})</span>
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder={t("notesPlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm resize-none transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("referralCode")} <span className="text-muted-foreground font-normal">({t("notesOptional")})</span>
            </label>
            <input
              name="referralCode"
              type="text"
              placeholder={t("referralCodePlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors uppercase"
            />
          </div>
        </div>

        {state?.error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-brand text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>
    </div>
  );
}
