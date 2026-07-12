"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "@/components/google-translate";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import type { SessionPayload } from "@/lib/session";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "MODERATOR"];

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function AvatarDropdown({ user }: { user: SessionPayload }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAdmin = ADMIN_ROLES.includes(user.role);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span className="w-9 h-9 rounded-full bg-brand text-white text-sm font-bold flex items-center justify-center select-none shrink-0">
          {getInitials(user.fullName)}
        </span>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-border py-1 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <span className="mt-1 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand">
              {user.role.replace("_", " ")}
            </span>
          </div>

          {/* Links */}
          <div className="py-1">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Admin Panel
              </Link>
            )}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              {t("dashboard")}
            </Link>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              {t("profile")}
            </Link>
          </div>

          {/* My sections */}
          <div className="border-t border-border py-1">
            <p className="px-4 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">My Sections</p>
            <Link
              href="/shares/my"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <polyline strokeLinecap="round" strokeLinejoin="round" points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline strokeLinecap="round" strokeLinejoin="round" points="16 7 22 7 22 13" />
              </svg>
              My Investments
            </Link>
            <Link
              href="/lost-found/my"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
              </svg>
              My Lost & Found
            </Link>
            <Link
              href="/apply"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Apply for Service
            </Link>
            <Link
              href="/wallet"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <rect x="1" y="4" width="22" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="1" y1="10" x2="23" y2="10" strokeLinecap="round" />
              </svg>
              Wallet
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-border py-1">
            <form action="/api/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                {t("logout")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ user }: { user: SessionPayload | null }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const isAdmin = user ? ADMIN_ROLES.includes(user.role) : false;

  const navLinks = user
    ? [
        { href: "/shares/my",     label: t("myInvestments") },
        { href: "/services",      label: t("services") },
        { href: "/air-ticket",    label: t("airTicket") },
        { href: "/currency",      label: t("currency") },
        { href: "/blog",          label: t("blog") },
        { href: "/islamic-center",label: t("islamicCenter") },
        { href: "/lost-found/my", label: t("myLostFound") },
      ]
    : [
        { href: "/shares",        label: t("shares") },
        { href: "/services",      label: t("services") },
        { href: "/air-ticket",    label: t("airTicket") },
        { href: "/currency",      label: t("currency") },
        { href: "/blog",          label: t("blog") },
        { href: "/islamic-center",label: t("islamicCenter") },
        { href: "/lost-found",    label: t("lostFound") },
      ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="Singapur Probashi"
              width={160}
              height={40}
              className="h-8 lg:h-9 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-brand hover:bg-brand-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile right: lang toggle + tappable avatar */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageToggle />
            {user && (
              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                className="w-8 h-8 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center shrink-0 active:scale-90 transition-transform"
              >
                {getInitials(user.fullName)}
              </Link>
            )}
            {!user && (
              <Link
                href="/login"
                className="text-xs font-semibold text-brand border border-brand px-3 py-1.5 rounded-full"
              >
                Login
              </Link>
            )}
          </div>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageToggle />
            {user ? (
              <AvatarDropdown user={user} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 text-sm font-semibold text-brand border border-brand rounded-full hover:bg-brand-50 transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 text-sm font-semibold text-white bg-brand rounded-full hover:bg-brand-dark transition-colors"
                >
                  {t("register")}
                </Link>
              </>
            )}
          </div>

          {/* Desktop mobile toggle (hidden since bottom nav handles mobile) */}
          <button
            className="hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            {open ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu removed — bottom nav handles mobile navigation */}
      </div>
    </header>
  );
}
