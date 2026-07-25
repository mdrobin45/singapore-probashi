import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/shell";
import { getSession } from "@/lib/session";
import { CurrencyRateBar } from "@/components/currency-rate-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Singapur Probashi – Bangladesh Community in Singapore",
  description:
    "Complete community platform for Bangladeshi expatriates in Singapore. Share investments, air tickets, currency converter, Islamic center, and more.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <Shell user={session} rateBar={<CurrencyRateBar />}>{children}</Shell>
      </body>
    </html>
  );
}
