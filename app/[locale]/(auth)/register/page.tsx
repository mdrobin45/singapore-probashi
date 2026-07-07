"use client";

import { useActionState, useRef, useState } from "react";
import { registerAction } from "@/app/actions/auth";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
    </svg>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 mt-1">{message}</p>;
}

function inputClass(error?: string) {
  return `w-full px-3.5 py-2.5 rounded-lg border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 text-sm transition-colors bg-white ${
    error
      ? "border-red-400 focus:ring-red-200 focus:border-red-500"
      : "border-border focus:ring-brand/30 focus:border-brand"
  }`;
}

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const [state, action, pending] = useActionState(registerAction, null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Controlled field values — preserved on validation error
  const [fields, setFields] = useState({
    fullName: "",
    nidNumber: "",
    email: "",
    phone: "",
    password: "",
  });

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  const fe = state?.fieldErrors ?? {};

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
      <p className="text-sm text-muted-foreground mb-7">{t("subtitle")}</p>

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
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("fullName")}</label>
            <input
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder={t("fullNamePlaceholder")}
              value={fields.fullName}
              onChange={set("fullName")}
              className={inputClass(fe.fullName)}
            />
            <FieldError message={fe.fullName} />
          </div>

          {/* NID */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("nidNumber")}</label>
            <input
              name="nidNumber"
              type="text"
              placeholder={t("nidPlaceholder")}
              value={fields.nidNumber}
              onChange={set("nidNumber")}
              className={inputClass(fe.nidNumber)}
            />
            {fe.nidNumber ? (
              <FieldError message={fe.nidNumber} />
            ) : (
              <p className="text-xs text-muted-foreground mt-1">{t("nidHint")}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("email")}</label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              value={fields.email}
              onChange={set("email")}
              className={inputClass(fe.email)}
            />
            <FieldError message={fe.email} />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("phone")}</label>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={t("phonePlaceholder")}
              value={fields.phone}
              onChange={set("phone")}
              className={inputClass(fe.phone)}
            />
            <FieldError message={fe.phone} />
          </div>

          {/* Password */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("password")}</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t("passwordPlaceholder")}
                value={fields.password}
                onChange={set("password")}
                className={inputClass(fe.password) + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            <FieldError message={fe.password} />
          </div>
        </div>

        {/* General server error (e.g. email already registered) */}
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
