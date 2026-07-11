import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Shell } from "@/components/shell";
import { getSession } from "@/lib/session";
import { CurrencyRateBar } from "@/components/currency-rate-bar";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "bn")) {
    notFound();
  }

  const [messages, session] = await Promise.all([getMessages(), getSession()]);

  return (
    <NextIntlClientProvider messages={messages}>
      <Shell user={session} rateBar={<CurrencyRateBar />}>{children}</Shell>
    </NextIntlClientProvider>
  );
}
