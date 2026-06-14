import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";

async function getDashboardData(userId: string) {
  const [user, wallet, ownerships, pendingPurchases, recentNotifications, pendingDeposits] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, role: true, createdAt: true, isVerified: true },
      }),
      prisma.wallet.findUnique({
        where: { userId },
        include: {
          transactions: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      }),
      prisma.shareOwnership.findMany({
        where: { ownerId: userId },
        include: { project: { select: { name: true, sharePrice: true, status: true } } },
      }),
      prisma.sharePurchaseRequest.findMany({
        where: { buyerId: userId, status: "PENDING" },
        include: { project: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.depositRequest.findMany({
        where: { userId, status: "PENDING" },
        take: 3,
      }),
    ]);

  return { user, wallet, ownerships, pendingPurchases, recentNotifications, pendingDeposits };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const t = await getTranslations("dashboard");

  const { user, wallet, ownerships, pendingPurchases, recentNotifications, pendingDeposits } =
    await getDashboardData(session.userId);

  const portfolioValue = ownerships.reduce(
    (sum, o) => sum + o.quantity * Number(o.project.sharePrice),
    0
  );
  const totalShares = ownerships.reduce((sum, o) => sum + o.quantity, 0);

  const MODULE_LINKS = [
    { href: "/shares", label: t("moduleShares"), desc: t("moduleSharesDesc"), icon: "📈" },
    { href: "/air-ticket", label: t("moduleAirTicket"), desc: t("moduleAirTicketDesc"), icon: "✈️" },
    { href: "/currency", label: t("moduleCurrency"), desc: t("moduleCurrencyDesc"), icon: "💱" },
    { href: "/lost-found", label: t("moduleLostFound"), desc: t("moduleLostFoundDesc"), icon: "🔍" },
    { href: "/islamic-center", label: t("moduleIslamicCenter"), desc: t("moduleIslamicCenterDesc"), icon: "🕌" },
    { href: "/blog", label: t("moduleBlog"), desc: t("moduleBlogDesc"), icon: "📝" },
  ];

  const TX_LABELS: Record<string, string> = {
    DEPOSIT: t("txDeposit"),
    WITHDRAWAL: t("txWithdrawal"),
    SHARE_PURCHASE: t("txSharePurchase"),
    SHARE_SALE: t("txShareSale"),
    REFUND: t("txRefund"),
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-foreground">
            {t("welcomeBack", { name: user?.fullName ?? session.email.split("@")[0] })}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("memberSince")}{" "}
            {user?.createdAt.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
          {/* Wallet */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("walletBalance")}</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  S${wallet ? Number(wallet.balance).toFixed(2) : "0.00"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            {pendingDeposits.length > 0 && (
              <p className="text-xs text-amber-600 mb-2">
                {t("pendingDepositApproval", { count: pendingDeposits.length })}
              </p>
            )}
            <Link href="/dashboard/deposit" className="text-xs text-brand font-semibold hover:underline">
              {t("depositFundsLink")}
            </Link>
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("sharePortfolio")}</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  S${portfolioValue.toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {t("sharesAcrossProjects", { shares: totalShares, count: ownerships.length })}
            </p>
            <Link href="/shares" className="text-xs text-brand font-semibold hover:underline">
              {t("browseProjects")}
            </Link>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("pendingRequests")}</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{pendingPurchases.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t("awaitingApproval")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-7">
          {/* Share Portfolio */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{t("mySharePortfolio")}</h2>
              <Link href="/shares" className="text-xs text-brand hover:underline font-medium">
                {t("browseMore")}
              </Link>
            </div>
            {ownerships.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-muted-foreground text-sm mb-3">{t("noShares")}</p>
                <Link href="/shares" className="inline-block bg-brand text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors">
                  {t("exploreProjects")}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {ownerships.map((o) => (
                  <div key={o.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{o.project.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {o.quantity} {t("shares")} · S${Number(o.project.sharePrice).toFixed(0)}/{t("share")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="font-semibold text-foreground text-sm">
                          S${(o.quantity * Number(o.project.sharePrice)).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{t("currentValue")}</p>
                      </div>
                      <Link
                        href={`/shares/resell?ownershipId=${o.id}`}
                        className="text-[11px] font-semibold text-brand border border-brand/30 px-2.5 py-1 rounded-lg hover:bg-brand hover:text-white transition-colors whitespace-nowrap"
                      >
                        {t("listForSale")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">{t("notifications")}</h2>
            </div>
            {recentNotifications.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                {t("noNotifications")}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentNotifications.map((n) => (
                  <div key={n.id} className={`px-5 py-3.5 ${!n.isRead ? "bg-brand-50/40" : ""}`}>
                    <p className="text-sm font-medium text-foreground leading-snug">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {n.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent wallet transactions */}
        {wallet && wallet.transactions.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden mb-7">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{t("recentTransactions")}</h2>
            </div>
            <div className="divide-y divide-border">
              {wallet.transactions.map((tx) => (
                <div key={tx.id} className="px-6 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{TX_LABELS[tx.type] ?? tx.type}</p>
                    <p className="text-xs text-muted-foreground">{tx.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${["DEPOSIT", "SHARE_SALE", "REFUND"].includes(tx.type) ? "text-green-600" : "text-red-600"}`}>
                      {["DEPOSIT", "SHARE_SALE", "REFUND"].includes(tx.type) ? "+" : "-"}S${Number(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {tx.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module shortcuts */}
        <h2 className="text-base font-semibold text-foreground mb-3">{t("platformServices")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULE_LINKS.map((m) => (
            <Link key={m.href} href={m.href}>
              <div className="bg-white rounded-xl border border-border p-5 hover:shadow-sm hover:border-brand/30 transition-all group">
                <div className="text-2xl mb-2">{m.icon}</div>
                <p className="font-semibold text-foreground group-hover:text-brand transition-colors">{m.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
