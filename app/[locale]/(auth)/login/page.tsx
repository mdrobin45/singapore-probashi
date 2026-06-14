"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslations } from "next-intl";

function LoginForm() {
  const t = useTranslations("auth.login");
  const [state, action, pending] = useActionState(loginAction, null);
  const params = useSearchParams();
  const resetSuccess = params.get("reset") === "1";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
      <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-5">
        <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-7">
        {t("subtitle")}
      </p>

      {resetSuccess && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 mb-5">
          {t("resetSuccess")}
        </div>
      )}

      <form action={action} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("nidNumber")}
          </label>
          <input
            name="nidNumber"
            type="text"
            required
            autoComplete="username"
            placeholder={t("nidPlaceholder")}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-foreground">{t("password")}</label>
            <Link href="/forgot-password" className="text-xs text-brand hover:underline">
              {t("forgot")}
            </Link>
          </div>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm transition-colors"
          />
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
        {t("noAccount")}{" "}
        <Link href="/register" className="text-brand font-medium hover:underline">
          {t("register")}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
