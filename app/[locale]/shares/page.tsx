import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SecondaryMarket } from "./secondary-market";

async function getPrimaryData() {
  return prisma.project.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { shares: true, purchaseRequests: true } } },
  });
}

async function getSecondaryListings() {
  return prisma.shareListing.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: {
      seller: { select: { fullName: true } },
      project: { select: { name: true, sharePrice: true } },
    },
  });
}

export default async function SharesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "secondary" ? "secondary" : "primary";

  const [projects, secondaryListings, session, t] = await Promise.all([
    getPrimaryData(),
    getSecondaryListings(),
    getSession(),
    getTranslations("shares"),
  ]);

  const totalValue = projects.reduce(
    (sum, p) => sum + Number(p.sharePrice) * p.totalShares,
    0
  );

  return (
    <div className="min-h-screen bg-muted">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand-50 px-3 py-1 rounded-full mb-3">
                {t("investmentBadge")}
              </span>
              <h1 className="text-3xl font-bold text-foreground">{t("marketplaceTitle")}</h1>
              <p className="text-muted-foreground mt-2 max-w-xl">
                {t("marketplaceSubtitle")}
              </p>
            </div>
            <div className="flex gap-6 text-center shrink-0">
              <div>
                <p className="text-2xl font-bold text-foreground">{projects.length}</p>
                <p className="text-xs text-muted-foreground">{t("activeProjects")}</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-2xl font-bold text-foreground">S${(totalValue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">{t("totalValue")}</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-2xl font-bold text-foreground">{secondaryListings.length}</p>
                <p className="text-xs text-muted-foreground">{t("resellListings")}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-7 bg-muted rounded-xl p-1 w-fit">
            <Link
              href="/shares"
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "primary"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("primaryTab")}
            </Link>
            <Link
              href="/shares?tab=secondary"
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "secondary"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("secondaryTab")}
              {secondaryListings.length > 0 && (
                <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {secondaryListings.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeTab === "primary" ? (
          <>
            {projects.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                {t("noActiveProjects")}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => {
                  const soldPct = Math.round(
                    ((project.totalShares - project.availableShares) / project.totalShares) * 100
                  );
                  const totalProjectValue = Number(project.sharePrice) * project.totalShares;

                  return (
                    <div key={project.id} className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                      <div className="bg-linear-to-br from-brand/10 to-brand-50 px-6 pt-6 pb-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">{t("activeStatus")}</span>
                        </div>
                        <h2 className="font-bold text-foreground text-lg leading-snug">{project.name}</h2>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                      </div>

                      <div className="px-6 py-4 border-b border-border grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-base font-bold text-foreground">S${Number(project.sharePrice).toFixed(0)}</p>
                          <p className="text-[11px] text-muted-foreground">{t("perShare")}</p>
                        </div>
                        <div>
                          <p className="text-base font-bold text-foreground">{project.availableShares.toLocaleString()}</p>
                          <p className="text-[11px] text-muted-foreground">{t("available")}</p>
                        </div>
                        <div>
                          <p className="text-base font-bold text-foreground">S${(totalProjectValue / 1000).toFixed(0)}K</p>
                          <p className="text-[11px] text-muted-foreground">{t("totalFund")}</p>
                        </div>
                      </div>

                      <div className="px-6 py-4 flex-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                          <span>{t("sharesSold")}</span>
                          <span className="font-medium text-foreground">{soldPct}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-brand rounded-full" style={{ width: `${soldPct}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {t("sharesSoldOf", {
                            sold: project.totalShares - project.availableShares,
                            total: project.totalShares,
                          })}
                        </p>
                      </div>

                      <div className="px-6 pb-5">
                        <Link
                          href={session ? `/shares/${project.id}` : "/login"}
                          className="block w-full text-center bg-brand text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors"
                        >
                          {session ? t("viewAndInvest") : t("loginToInvest")}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <SecondaryMarket listings={secondaryListings} session={session} />
        )}
      </div>
    </div>
  );
}
