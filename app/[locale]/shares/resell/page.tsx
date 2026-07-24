import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getShareSgdRate } from "@/lib/share-pricing";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ResellForm } from "./resell-form";
import { Link } from "@/i18n/navigation";

export default async function ResellPage({
  searchParams,
}: {
  searchParams: Promise<{ ownershipId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { ownershipId } = await searchParams;
  const t = await getTranslations("shares");

  const [ownerships, rate] = await Promise.all([
    prisma.shareOwnership.findMany({
      where: { ownerId: session.userId },
      include: { project: { select: { id: true, name: true, sharePriceSgd: true, status: true } } },
      orderBy: { acquiredAt: "desc" },
    }),
    getShareSgdRate(),
  ]);

  const selected = ownershipId
    ? ownerships.find((o) => o.id === ownershipId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-brand transition-colors">{t("breadcrumbDashboard")}</Link>
          <span>/</span>
          <Link href="/shares" className="hover:text-brand transition-colors">{t("breadcrumbShares")}</Link>
          <span>/</span>
          <span className="text-foreground">{t("breadcrumbListForSale")}</span>
        </div>

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-7 py-5 border-b border-border">
            <h1 className="font-bold text-foreground text-xl">{t("resell.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("resellPageSubtitle")}
            </p>
          </div>

          {ownerships.length === 0 ? (
            <div className="px-7 py-12 text-center">
              <p className="text-muted-foreground mb-4">{t("noOwnedShares")}</p>
              <Link href="/shares" className="bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
                {t("browseProjects")}
              </Link>
            </div>
          ) : (
            <ResellForm ownerships={ownerships} selectedId={ownershipId ?? null} rate={rate} />
          )}
        </div>

        {/* Info */}
        <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800 space-y-1.5">
          <p className="font-semibold">{t("howResellWorks")}</p>
          <ol className="space-y-1 text-xs text-blue-700 list-decimal list-inside">
            <li>{t("resellStep1")}</li>
            <li>{t("resellStep2")}</li>
            <li>{t("resellStep3")}</li>
            <li>{t("resellStep4")}</li>
            <li>{t("resellStep5")}</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
