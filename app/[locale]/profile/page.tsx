import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      fullName: true, nidNumber: true, email: true, phone: true,
      role: true, isVerified: true, isActive: true, createdAt: true, profilePhoto: true,
      wallet: { select: { balance: true } },
      _count: { select: { ownedShares: true, lostFoundPosts: true, blogPosts: true } },
    },
  });

  if (!user) redirect("/login");

  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    MODERATOR: "Moderator",
    USER: "Member",
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-brand transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-foreground">My Profile</span>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-5">
          <div className="bg-gradient-to-br from-brand-50 to-brand-100 px-7 py-8 flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center text-white text-3xl font-bold shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user.fullName}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs font-bold text-brand bg-white border border-brand/20 px-3 py-1 rounded-full">
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
                {user.isVerified ? (
                  <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Verified
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="px-7 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Full Name", value: user.fullName },
              { label: "NID Number", value: user.nidNumber, mono: true },
              { label: "Email Address", value: user.email },
              { label: "Phone Number", value: user.phone },
              { label: "Member Since", value: user.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) },
              { label: "Wallet Balance", value: `S$${Number(user.wallet?.balance ?? 0).toFixed(2)}` },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">{f.label}</p>
                <p className={`text-sm text-foreground ${f.mono ? "font-mono" : "font-medium"}`}>{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity stats */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: "Share Projects", value: user._count.ownedShares, href: "/shares" },
            { label: "Lost & Found Posts", value: user._count.lostFoundPosts, href: "/lost-found" },
            { label: "Blog Posts", value: user._count.blogPosts, href: "/blog" },
          ].map((s) => (
            <Link key={s.label} href={s.href}>
              <div className="bg-white rounded-xl border border-border p-4 text-center hover:border-brand/30 transition-colors">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4 text-sm">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/deposit" className="text-xs font-semibold bg-brand-50 text-brand px-4 py-2 rounded-lg hover:bg-brand hover:text-white transition-colors">
              + Deposit Funds
            </Link>
            <Link href="/shares" className="text-xs font-semibold bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-border transition-colors">
              Browse Shares
            </Link>
            <Link href="/wallet" className="text-xs font-semibold bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-border transition-colors">
              View Wallet
            </Link>
            <Link href="/lost-found/new" className="text-xs font-semibold bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-border transition-colors">
              Post Lost & Found
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
