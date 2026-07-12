"use client";

import { useActionState, useState } from "react";
import { createLostFoundPostAction } from "@/app/actions/lost-found";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NewLostFoundPage() {
  const [state, action, pending] = useActionState(createLostFoundPostAction, null);
  const [selectedType, setSelectedType] = useState<"LOST" | "FOUND" | null>(null);
  const t = useTranslations("lostFound");

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/lost-found" className="hover:text-brand transition-colors">{t("pageTitle")}</Link>
          <span>/</span>
          <span className="text-foreground">{t("newPost")}</span>
        </div>

        <div className="bg-white rounded-2xl border border-border p-7">
          <h1 className="text-xl font-bold text-foreground mb-1">{t("newPostTitle")}</h1>
          <p className="text-sm text-muted-foreground mb-7">{t("newPostHint")}</p>

          <form action={action} className="space-y-5">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("postType")}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedType("LOST")}
                  className={`border-2 rounded-xl px-4 py-3 text-sm font-semibold text-center transition-all ${
                    selectedType === "LOST"
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-border text-muted-foreground hover:border-red-200 hover:text-red-600"
                  }`}
                >
                  {t("iLostSomething")}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType("FOUND")}
                  className={`border-2 rounded-xl px-4 py-3 text-sm font-semibold text-center transition-all ${
                    selectedType === "FOUND"
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-border text-muted-foreground hover:border-green-200 hover:text-green-600"
                  }`}
                >
                  {t("iFoundSomething")}
                </button>
                <input type="hidden" name="type" value={selectedType ?? ""} />
              </div>
              {!selectedType && state?.error && (
                <p className="text-xs text-red-600 mt-1">Please select a type.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("itemTitle")}</label>
              <input
                name="title"
                type="text"
                required
                placeholder={t("itemTitlePlaceholder")}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("description")}</label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder={t("descriptionPlaceholder")}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("locationOptional")}</label>
              <input
                name="location"
                type="text"
                placeholder={t("locationPlaceholder")}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
              />
            </div>

            {state?.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending || !selectedType}
              className="w-full bg-brand text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              {pending ? t("posting") : t("publishPost")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
