"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Bank = { id: string; bankName: string; rate: number };

type Props = {
  banks: Bank[];
  defaultRate: number;
  isManual: boolean;
};

export function BankCalculator({ banks, defaultRate, isManual }: Props) {
  const t = useTranslations("currency");
  const [amount, setAmount] = useState("1");
  const [reversed, setReversed] = useState(false); // false = SGD→BDT, true = BDT→SGD
  const [selectedBankId, setSelectedBankId] = useState<string | null>(
    banks.length > 0 ? banks[0].id : null
  );

  const selectedBank = banks.find((b) => b.id === selectedBankId) ?? null;
  const rate = selectedBank?.rate ?? defaultRate;

  const numAmount = parseFloat(amount) || 0;
  const result = reversed ? numAmount / rate : numAmount * rate;

  const fromCurrency = reversed ? "BDT" : "SGD";
  const toCurrency = reversed ? "SGD" : "BDT";
  const fromSymbol = reversed ? "৳" : "S$";
  const toSymbol = reversed ? "S$" : "৳";

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h2 className="font-semibold text-foreground mb-5">{t("convertTitle")}</h2>

      <div className="flex flex-col sm:flex-row gap-3 items-end">
        {/* Amount input */}
        <div className="flex-1">
          <label className="block text-xs text-muted-foreground mb-1.5">
            {fromCurrency} {t("amountLabel")}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              {fromSymbol}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
              step="any"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border text-foreground text-lg font-semibold focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={() => setReversed((v) => !v)}
          className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors shrink-0 mb-0.5"
          title="Swap direction"
        >
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>

        {/* Bank selector */}
        {banks.length > 0 && (
          <div className="w-full sm:w-52">
            <label className="block text-xs text-muted-foreground mb-1.5">Bank</label>
            <select
              value={selectedBankId ?? ""}
              onChange={(e) => setSelectedBankId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border text-foreground text-sm focus:outline-none focus:border-brand bg-white"
            >
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bankName} ({b.rate.toFixed(2)} ৳)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Result */}
      <div className="mt-5 bg-brand-50 rounded-xl px-5 py-4">
        <p className="text-sm text-muted-foreground">
          {amount || "0"} {fromCurrency} =
        </p>
        <p className="text-3xl font-bold text-brand mt-0.5">
          {toSymbol} {result.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="text-base font-normal text-brand/70 ml-2">{toCurrency}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Rate: 1 SGD = {rate.toFixed(4)} ৳ BDT
          {selectedBank ? ` · ${selectedBank.bankName}` : ""}
          {!selectedBank && (
            <span className="ml-1 text-brand/70">({isManual ? "Admin rate" : "Live rate"})</span>
          )}
        </p>
      </div>
    </div>
  );
}
