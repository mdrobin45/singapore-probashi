"use client";

import { useActionState, useRef, useState } from "react";
import { registerAction } from "@/app/actions/auth";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const [state, action, pending] = useActionState(registerAction, null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-7">
        {t("subtitle")}
      </p>

      <form action={action} className="space-y-5">
        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border hover:border-brand transition-colors overflow-hidden group"
          >
            {preview ? (
              <Image src={preview} alt="Profile preview" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <svg className="w-6 h-6 text-muted-foreground group-hover:text-brand transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-muted-foreground">{t("photoLabel")}</span>
              </div>
            )}
          </button>
          <input ref={fileRef} type="file" name="profilePhoto" accept="image/*" className="hidden" onChange={handleFile} />
          <p className="text-xs text-muted-foreground">{t("photoHint")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("fullName")}</label>
            <input
              name="fullName"
              type="text"
              required
              autoComplete="name"
              placeholder={t("fullNamePlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("nidNumber")}</label>
            <input
              name="nidNumber"
              type="text"
              required
              placeholder={t("nidPlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-1">{t("nidHint")}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("email")}</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("phone")}</label>
            <input
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder={t("phonePlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("password")}</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder={t("passwordPlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors"
            />
          </div>
        </div>

        {state?.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {t("hasAccount")}{" "}
        <Link href="/login" className="text-brand font-medium hover:underline">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
