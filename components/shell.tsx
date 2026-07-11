"use client";

import { usePathname } from "@/i18n/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BottomNav } from "@/components/bottom-nav";
import type { SessionPayload } from "@/lib/session";

const AUTH_PATHS = ["/login", "/register", "/verify-otp", "/forgot-password", "/reset-password", "/admin"];

type ShellProps = {
  children: React.ReactNode;
  user: SessionPayload | null;
  rateBar?: React.ReactNode;
};

export function Shell({ children, user, rateBar }: ShellProps) {
  const pathname = usePathname();

  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isAuth) return <>{children}</>;

  return (
    <>
      <Navbar user={user} />
      {rateBar}
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <BottomNav user={user} />
    </>
  );
}
