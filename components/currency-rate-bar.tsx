import { getCurrencySettings, getLiveBdtRate } from "@/lib/currency";
import Link from "next/link";

export async function CurrencyRateBar() {
  const settings = await getCurrencySettings();
  if (!settings.showBar) return null;

  let rate: number;
  let isManual: boolean;
  let fetchFailed = false;

  if (settings.source === "manual") {
    rate = settings.manualRate;
    isManual = true;
  } else {
    const live = await getLiveBdtRate();
    if (live !== null) {
      rate = live;
      isManual = false;
    } else {
      rate = settings.manualRate;
      isManual = false;
      fetchFailed = true;
    }
  }

  return (
    <Link
      href="/currency"
      className="flex items-center justify-center gap-2 bg-brand text-white text-xs py-1.5 px-4 hover:bg-brand/90 transition-colors"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isManual ? "bg-white/60" : fetchFailed ? "bg-amber-300" : "bg-green-300 animate-pulse"
        }`}
      />
      <span className="font-medium">
        1 SGD = {rate.toFixed(2)} ৳ BDT
      </span>
      <span className="opacity-70">
        · {isManual ? "Admin rate" : fetchFailed ? "Offline" : "Live"}
      </span>
      <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
