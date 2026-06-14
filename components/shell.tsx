"use client";

import { usePathname } from "@/i18n/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

// Paths that should NOT show the Navbar/Footer (locale-stripped)
const AUTH_PATHS = ["/login", "/register", "/verify-otp", "/forgot-password", "/reset-password", "/admin"];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // returns path without locale prefix via next-intl

  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isAuth) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
