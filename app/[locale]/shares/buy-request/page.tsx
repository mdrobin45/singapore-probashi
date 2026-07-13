import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BuyRequestForm } from "./buy-request-form";
import { Link } from "@/i18n/navigation";

export default async function BuyRequestPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const t = await getTranslations("shares");

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-brand transition-colors">{t("breadcrumbDashboard")}</Link>
          <span>/</span>
          <Link href="/shares" className="hover:text-brand transition-colors">{t("breadcrumbShares")}</Link>
          <span>/</span>
          <span className="text-foreground">{t("breadcrumbBuyRequest")}</span>
        </div>

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-7 py-5 border-b border-border">
            <h1 className="font-bold text-foreground text-xl">{t("buyRequestTitle")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("buyRequestPageSubtitle")}
            </p>
          </div>

          <BuyRequestForm defaultName={session.fullName} />
        </div>

        {/* Info */}
        <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800 space-y-1.5">
          <p className="font-semibold">{t("howBuyRequestWorks")}</p>
          <ol className="space-y-1 text-xs text-blue-700 list-decimal list-inside">
            <li>{t("buyRequestStep1")}</li>
            <li>{t("buyRequestStep2")}</li>
            <li>{t("buyRequestStep3")}</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
