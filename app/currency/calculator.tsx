"use client";

import { useState } from "react";

const CURRENCIES = ["SGD", "BDT", "USD", "EUR", "GBP", "MYR", "SAR", "AED", "INR"];

type Props = { rates: Record<string, number> };

export function CurrencyCalculator({ rates }: Props) {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("SGD");
  const [to, setTo] = useState("BDT");

  const sgdRates: Record<string, number> = { SGD: 1, ...rates };

  function convert(val: number, fromCurrency: string, toCurrency: string) {
    const inSGD = val / (sgdRates[fromCurrency] ?? 1);
    return inSGD * (sgdRates[toCurrency] ?? 1);
  }

  const result = convert(Number(amount) || 0, from, to);

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h2 className="font-semibold text-foreground mb-5">Convert Currency</h2>
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs text-muted-foreground mb-1.5">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            step="any"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-foreground text-lg font-semibold focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div className="w-full sm:w-36">
          <label className="block text-xs text-muted-foreground mb-1.5">From</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:border-brand bg-white"
          >
            {CURRENCIES.filter((c) => sgdRates[c]).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => { setFrom(to); setTo(from); }}
          className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors shrink-0 mb-0.5"
          title="Swap currencies"
        >
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>

        <div className="w-full sm:w-36">
          <label className="block text-xs text-muted-foreground mb-1.5">To</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border text-foreground focus:outline-none focus:border-brand bg-white"
          >
            {CURRENCIES.filter((c) => sgdRates[c]).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 bg-brand-50 rounded-xl px-5 py-4">
        <p className="text-sm text-muted-foreground">
          {amount || "0"} {from} =
        </p>
        <p className="text-3xl font-bold text-brand mt-0.5">
          {result.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {to}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          1 {from} = {convert(1, from, to).toFixed(4)} {to}
        </p>
      </div>
    </div>
  );
}
