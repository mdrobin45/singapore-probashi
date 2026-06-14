"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.replace(pathname, { locale: e.target.value });
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={locale}
        onChange={handleChange}
        className="appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold border border-border rounded-full bg-white text-foreground hover:border-brand hover:text-brand focus:outline-none focus:border-brand cursor-pointer transition-colors"
      >
        <option value="bn">বাংলা</option>
        <option value="en">English</option>
      </select>
      <svg
        className="pointer-events-none absolute right-2 w-3 h-3 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
