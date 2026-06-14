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

const LANGUAGES = [
  { value: "bn", label: "বাংলা" },
  { value: "en", label: "English" },
];

export function LanguageToggle() {
  const [lang, setLang] = useState<"bn" | "en">("bn");

  useEffect(() => {
    setLang(getActiveLang());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as "bn" | "en";
    document.cookie = `googtrans=/en/${next}; path=/`;
    setLang(next);
    location.reload();
  };

  return (
    <div className="notranslate relative inline-flex items-center">
      <select
        value={lang}
        onChange={handleChange}
        className="appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold border border-border rounded-full bg-white text-foreground hover:border-brand hover:text-brand focus:outline-none focus:border-brand cursor-pointer transition-colors"
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
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
