import { getCurrencySettings, getLiveBdtRate } from "@/lib/currency";
import { getAllCommissionSettings } from "@/lib/commission";
import { getShareSgdRate } from "@/lib/share-pricing";
import { prisma } from "@/lib/prisma";
import { CurrencySettingsForm } from "./currency-form";
import { BankRatesForm } from "./bank-rates-form";
import { CommissionSettingsForm } from "./commission-form";
import { SharePricingForm } from "./share-pricing-form";

async function getBankRates() {
  try {
    const rows = await prisma.bankRate.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    return rows.map((r) => ({ id: r.id, bankName: r.bankName, rate: Number(r.rate), isActive: r.isActive }));
  } catch {
    return [];
  }
}

export default async function AdminSettingsPage() {
  const [settings, liveRate, banks, commissionSettings, shareRate] = await Promise.all([
    getCurrencySettings(),
    getLiveBdtRate(),
    getBankRates(),
    getAllCommissionSettings(),
    getShareSgdRate(),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage site-wide configuration</p>
      </div>

      {/* Currency source control */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Rate Bar Source (SGD → BDT)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Controls the rate shown in the top bar and the calculator default
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <CurrencySettingsForm settings={settings} liveRate={liveRate} />
        </div>
      </div>

      {/* Share pricing rate */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Share Pricing (SGD → BDT)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share prices are listed in SGD; this rate converts the actual BDT charged at purchase
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <SharePricingForm rate={shareRate} />
        </div>
      </div>

      {/* Bank rates */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Bank Rates</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add banks and their SGD → BDT rates — shown as cards on the currency page
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <BankRatesForm banks={banks} />
        </div>
      </div>

      {/* Agent commission rate */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6M2 7h20M12 3v4M8 7l4-4 4 4" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Agent Commission</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set a percentage or fixed ৳ amount agents earn per module, on referred requests
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <CommissionSettingsForm settings={commissionSettings} />
        </div>
      </div>
    </div>
  );
}
