import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import Link from "next/link";

async function getStats() {
  const [
    totalUsers,
    verifiedUsers,
    pendingPurchases,
    pendingDeposits,
    activeProjects,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isVerified: true } }),
    prisma.sharePurchaseRequest.count({ where: { status: "PENDING" } }),
    prisma.depositRequest.count({ where: { status: "PENDING" } }),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true, fullName: true, email: true,
        role: true, isVerified: true, createdAt: true,
      },
    }),
  ]);

  return { totalUsers, verifiedUsers, pendingPurchases, pendingDeposits, activeProjects, recentUsers };
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  ADMIN: "bg-blue-100 text-blue-700",
  MODERATOR: "bg-amber-100 text-amber-700",
  USER: "bg-gray-100 text-gray-600",
};

export default async function AdminDashboard() {
  const [session, stats] = await Promise.all([getSession(), getStats()]);

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      sub: `${stats.verifiedUsers} verified`,
      href: "/admin/users",
      color: "bg-blue-500",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: "Active Projects",
      value: stats.activeProjects,
      sub: "Share marketplace",
      href: "/admin/shares",
      color: "bg-brand",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: "Pending Purchases",
      value: stats.pendingPurchases,
      sub: "Needs review",
      href: "/admin/purchases",
      color: stats.pendingPurchases > 0 ? "bg-amber-500" : "bg-green-500",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: "Pending Deposits",
      value: stats.pendingDeposits,
      sub: "Awaiting approval",
      href: "/admin/deposits",
      color: stats.pendingDeposits > 0 ? "bg-orange-500" : "bg-green-500",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back, <span className="font-medium text-foreground">{session?.email}</span>
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="bg-white rounded-xl border border-border p-5 hover:shadow-sm transition-shadow flex items-start gap-4">
              <div className={`${card.color} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm font-medium text-foreground leading-tight">{card.label}</p>
                <p className="text-xs text-muted-foreground">{card.sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending alerts */}
      {(stats.pendingPurchases > 0 || stats.pendingDeposits > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {stats.pendingPurchases > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {stats.pendingPurchases} purchase {stats.pendingPurchases === 1 ? "request" : "requests"} pending
                </p>
                <p className="text-xs text-amber-700 mt-0.5">Review and approve or reject</p>
              </div>
              <Link
                href="/admin/purchases"
                className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Review →
              </Link>
            </div>
          )}
          {stats.pendingDeposits > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-800">
                  {stats.pendingDeposits} deposit {stats.pendingDeposits === 1 ? "request" : "requests"} pending
                </p>
                <p className="text-xs text-orange-700 mt-0.5">Verify payment proof</p>
              </div>
              <Link
                href="/admin/deposits"
                className="text-xs font-semibold text-orange-700 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Review →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Recent Users */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Recent Registrations</h2>
          <Link href="/admin/users" className="text-xs text-brand hover:underline font-medium">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-brand">{u.fullName.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-foreground">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {u.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">
                    {u.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
