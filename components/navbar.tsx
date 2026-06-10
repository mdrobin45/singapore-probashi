"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LanguageToggle } from "@/components/google-translate";

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/islamic-center", label: "Islamic Center" },
  { href: "/lost-found", label: "Lost & Found" },
  { href: "/currency", label: "Currency" },
  { href: "/air-ticket", label: "Air Ticket" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="Singapur Probashi"
              width={160}
              height={40}
              className="h-9"
              style={{ width: "auto" }}
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

          {/* Auth buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageToggle />
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-semibold text-brand border border-brand rounded-full hover:bg-brand-50 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-semibold text-white bg-brand rounded-full hover:bg-brand-dark transition-colors"
            >
              Register Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
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

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden pb-4 pt-2 border-t border-border">
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 text-sm font-medium text-foreground hover:text-brand hover:bg-brand-50 rounded-lg transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-2 border-t border-border pb-1">
                <LanguageToggle />
              </div>
              <div className="flex gap-3 pt-2">
                <Link
                  href="/login"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-brand border border-brand rounded-full hover:bg-brand-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-brand rounded-full hover:bg-brand-dark transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Register Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
