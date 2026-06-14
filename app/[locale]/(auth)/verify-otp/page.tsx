"use client";

import { useActionState, useRef, Suspense } from "react";
import { verifyOtpAction, resendOtpAction } from "@/app/actions/auth";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

function VerifyOtpForm() {
  const t = useTranslations("auth.verifyOtp");
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const type = params.get("type") ?? "EMAIL_VERIFICATION";
  const isForgot = type === "FORGOT_PASSWORD";

  const [verifyState, verifyAction, verifyPending] = useActionState(verifyOtpAction, null);
  const [resendState, resendAction, resendPending] = useActionState(resendOtpAction, null);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleDigitInput(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    e.target.value = val;
    if (val && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    text.split("").forEach((char, i) => {
      if (inputs.current[i]) inputs.current[i]!.value = char;
    });
    inputs.current[Math.min(text.length, 5)]?.focus();
    e.preventDefault();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
      <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-5">
        <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">
        {isForgot ? t("titleForgot") : t("title")}
      </h1>
      <p className="text-sm text-muted-foreground mb-2">
        {isForgot ? t("subtitleForgot") : t("subtitle")}
      </p>
      <p className="text-sm font-semibold text-brand mb-7 break-all">{email}</p>

      <form
        action={verifyAction}
        className="space-y-6"
        onSubmit={(e) => {
          const otp = inputs.current.map((el) => el?.value ?? "").join("");
          const hidden = (e.currentTarget as HTMLFormElement).querySelector<HTMLInputElement>("input[name='otp']");
          if (hidden) hidden.value = otp;
        }}
      >
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="otp" value="" />
        {isForgot && <input type="hidden" name="type" value="FORGOT_PASSWORD" />}

        <div className="flex justify-center gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              onChange={(e) => handleDigitInput(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="w-11 h-13 text-center text-xl font-bold rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              style={{ height: "3.25rem" }}
            />
          ))}
        </div>

        {verifyState?.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">
            {verifyState.error}
          </div>
        )}

        <button
          type="submit"
          disabled={verifyPending}
          className="w-full bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {verifyPending ? t("submitting") : isForgot ? t("submitForgot") : t("submit")}
        </button>
      </form>

      {/* Resend */}
      <form action={resendAction} className="mt-5 text-center">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="type" value={type} />
        <span className="text-sm text-muted-foreground">{t("noCode")} </span>
        <button
          type="submit"
          disabled={resendPending}
          className="text-sm text-brand font-medium hover:underline disabled:opacity-50"
        >
          {resendPending ? t("resending") : t("resend")}
        </button>
        {resendState?.success && (
          <p className="text-xs text-green-600 mt-1">{t("resendSuccess")}</p>
        )}
        {resendState?.error && (
          <p className="text-xs text-red-600 mt-1">{resendState.error}</p>
        )}
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        <Link href="/login" className="text-brand font-medium hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
