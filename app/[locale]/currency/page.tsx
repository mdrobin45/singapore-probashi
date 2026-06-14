import { CurrencyCalculator } from "./calculator";

const CURRENCY_META: Record<string, { name: string; symbol: string }> = {
  BDT: { name: "Bangladeshi Taka", symbol: "৳" },
  USD: { name: "US Dollar", symbol: "$" },
  EUR: { name: "Euro", symbol: "€" },
  GBP: { name: "British Pound", symbol: "£" },
  MYR: { name: "Malaysian Ringgit", symbol: "RM" },
  SAR: { name: "Saudi Riyal", symbol: "﷼" },
  AED: { name: "UAE Dirham", symbol: "د.إ" },
  INR: { name: "Indian Rupee", symbol: "₹" },
};

async function getRates(): Promise<{ rates: Record<string, number>; updatedAt: string } | null> {
  try {
    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/SGD",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    return { rates: data.rates as Record<string, number>, updatedAt: data.date ?? "unknown" };
  } catch {
    // Fallback rates (approximate — displayed with a warning)
    return {
      rates: { BDT: 83.5, USD: 0.74, EUR: 0.69, GBP: 0.59, MYR: 3.47, SAR: 2.77, AED: 2.72, INR: 61.8 },
      updatedAt: "fallback",
    };
  }
}

export default async function CurrencyPage() {
  const data = await getRates();
  const rates = data?.rates ?? {};
  const isFallback = data?.updatedAt === "fallback";

  const displayCurrencies = Object.keys(CURRENCY_META).filter((c) => rates[c]);

  return (
    <div className="min-h-screen bg-muted">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand-50 px-3 py-1 rounded-full mb-3">
            Currency Converter
          </span>
          <h1 className="text-3xl font-bold text-foreground">SGD Exchange Rates</h1>
          <p className="text-muted-foreground mt-2">
            Live rates updated hourly. Base currency: Singapore Dollar (SGD).
          </p>
          {isFallback && (
            <p className="text-xs text-amber-600 mt-1">⚠ Using approximate rates — live data temporarily unavailable.</p>
          )}
          {!isFallback && (
            <p className="text-xs text-muted-foreground mt-1">Last updated: {data?.updatedAt}</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Interactive calculator */}
        <CurrencyCalculator rates={rates} />

        {/* Rate grid */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">1 SGD equals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayCurrencies.map((code) => {
              const meta = CURRENCY_META[code];
              const rate = rates[code];
              return (
                <div key={code} className="bg-white rounded-2xl border border-border p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{code}</p>
                      <p className="text-xs text-muted-foreground">{meta.name}</p>
                    </div>
                    <span className="text-lg text-muted-foreground">{meta.symbol}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {rate < 10 ? rate.toFixed(4) : rate.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    1 {code} = S${(1 / rate).toFixed(4)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-800">
          <strong>Note:</strong> Exchange rates are indicative only. Actual rates at banks or remittance services may vary. Always confirm with your provider before transferring money.
        </div>
      </div>
    </div>
  );
}
