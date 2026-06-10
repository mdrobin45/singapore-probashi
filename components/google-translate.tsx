"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages: string;
            autoDisplay: boolean;
          },
          elementId: string
        ) => void;
      };
    };
  }
}

function getActiveLang(): "bn" | "en" {
  if (typeof document === "undefined") return "bn";
  const match = document.cookie.match(/googtrans=\/en\/(\w+)/);
  return match?.[1] === "en" ? "en" : "bn";
}

export function GoogleTranslateInit() {
  useEffect(() => {
    // Set Bangla as default on first visit
    if (!document.cookie.includes("googtrans=")) {
      document.cookie = "googtrans=/en/bn; path=/";
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "bn,en", autoDisplay: false },
        "google_translate_element"
      );
    };

    if (!document.querySelector("#gt-script")) {
      const script = document.createElement("script");
      script.id = "gt-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return <div id="google_translate_element" className="hidden" />;
}

export function LanguageToggle() {
  const [lang, setLang] = useState<"bn" | "en">("bn");

  useEffect(() => {
    setLang(getActiveLang());
  }, []);

  const toggle = () => {
    const next = lang === "bn" ? "en" : "bn";
    document.cookie = `googtrans=/en/${next}; path=/`;
    setLang(next);
    location.reload();
  };

  return (
    <button
      onClick={toggle}
      className="notranslate inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-full hover:border-brand hover:text-brand transition-colors"
      title={lang === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
    >
      <svg
        className="w-3.5 h-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
      {lang === "bn" ? "English" : "বাংলা"}
    </button>
  );
}
