"use client";

import { useActionState } from "react";
import { requestWithdrawalAction } from "@/app/actions/withdrawals";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const METHODS = [
  { value: "BKASH", label: "bKash" },
  { value: "NAGAD", label: "Nagad" },
  { value: "ROCKET", label: "Rocket" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

export function WithdrawForm({ balance }: { balance: number }) {
  const [state, action, pending] = useActionState(requestWithdrawalAction, null);
  const t = useTranslations("withdraw");

  if (state?.success) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-semibold text-foreground mb-2">{t("successTitle")}</p>
        <p className="text-sm text-muted-foreground mb-5">{t("successMessage")}</p>
        <Link href="/dashboard" className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
          {t("backToDashboard")}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t("amount")}</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">৳</span>
          <input
            name="amount"
            type="number"
            required
            min={10}
            max={balance}
            step={0.01}
            placeholder={t("amountPlaceholder")}
            className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
          />
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">{t("paymentMethod")}</label>
        <div className="grid grid-cols-2 gap-2">
          {METHODS.map((m) => (
            <label key={m.value} className="cursor-pointer">
              <input type="radio" name="paymentMethod" value={m.value} className="sr-only peer" required />
              <div className="border border-border rounded-lg px-3 py-2 text-sm font-medium text-center transition-colors peer-checked:bg-brand-50 peer-checked:border-brand peer-checked:text-brand hover:border-brand/40 text-muted-foreground">
                {m.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Account number */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t("accountNumber")}</label>
        <input
          name="accountNumber"
          type="text"
          required
          placeholder={t("accountNumberPlaceholder")}
          className="w-full px-3.5 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
        />
      </div>

      {/* Account name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t("accountName")}</label>
        <input
          name="accountName"
          type="text"
          required
          placeholder={t("accountNamePlaceholder")}
          className="w-full px-3.5 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
        />
      </div>

      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending || balance < 10}
        className="w-full bg-brand text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
