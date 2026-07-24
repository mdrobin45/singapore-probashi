import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DepositForm } from "./deposit-form";

export default async function DepositPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const t = await getTranslations("deposit");
  const tNav = await getTranslations("nav");

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-brand transition-colors">
            {tNav("dashboard")}
          </Link>
          <span>/</span>
          <span className="text-foreground">{t("title")}</span>
        </div>

        <div className="bg-white rounded-2xl border border-border p-7">
          <h1 className="text-xl font-bold text-foreground mb-1">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mb-6">{t("subtitle")}</p>
          <DepositForm />
        </div>
      </div>
    </div>
  );
}
