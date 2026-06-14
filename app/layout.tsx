import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Shell } from "@/components/shell";
import { GoogleTranslateInit } from "@/components/google-translate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const showpnocari = localFont({
  src: [
    { path: "./fonts/Showpnocari-Light.ttf",          weight: "300", style: "normal" },
    { path: "./fonts/Showpnocari-Regular.ttf",         weight: "400", style: "normal" },
    { path: "./fonts/Showpnocari-Italic.ttf",          weight: "400", style: "italic" },
    { path: "./fonts/Showpnocari-Medium.ttf",          weight: "500", style: "normal" },
    { path: "./fonts/Showpnocari-MediumItalic.ttf",    weight: "500", style: "italic" },
    { path: "./fonts/Showpnocari-SemiBold.ttf",        weight: "600", style: "normal" },
    { path: "./fonts/Showpnocari-SemiBoldItalic.ttf",  weight: "600", style: "italic" },
    { path: "./fonts/Showpnocari-Bold.ttf",            weight: "700", style: "normal" },
    { path: "./fonts/Showpnocari-BoldItalic.ttf",      weight: "700", style: "italic" },
  ],
  variable: "--font-bangla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Singapur Probashi – Bangladesh Community in Singapore",
  description:
    "Complete community platform for Bangladeshi expatriates in Singapore. Share investments, air tickets, currency converter, Islamic center, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${showpnocari.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <GoogleTranslateInit />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
