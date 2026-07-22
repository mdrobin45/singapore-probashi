import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AvatarUpload } from "./avatar-upload";
import { ReferralCard } from "./referral-card";

export default async function ProfilePage() {
	const session = await getSession();
	if (!session) redirect("/login");

	const user = await prisma.user.findUnique({
		where: { id: session.userId },
		select: {
			fullName: true,
			nidNumber: true,
			email: true,
			phone: true,
			role: true,
			isVerified: true,
			isActive: true,
			isAgent: true,
			referralCode: true,
			createdAt: true,
			profilePhoto: true,
			wallet: { select: { balance: true } },
			_count: {
				select: { ownedShares: true, lostFoundPosts: true, blogPosts: true },
			},
		},
	});

	if (!user) redirect("/login");

	const t = await getTranslations("profile");
	const tNav = await getTranslations("nav");

	const ROLE_LABELS: Record<string, string> = {
		SUPER_ADMIN: t("roleSuperAdmin"),
		ADMIN: t("roleAdmin"),
		MODERATOR: t("roleModerator"),
		USER: t("roleMember"),
	};

	return (
		<div className="min-h-screen bg-muted">
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
					<Link
						href="/dashboard"
						className="hover:text-brand transition-colors"
					>
						{tNav("dashboard")}
					</Link>
					<span>/</span>
					<span className="text-foreground">{t("myProfile")}</span>
				</div>

				{/* Profile card */}
				<div className="bg-white rounded-2xl border border-border overflow-hidden mb-5">
					<div className="bg-linear-to-br from-brand-50 to-brand-100 px-7 py-8 flex items-start gap-5">
						<AvatarUpload
							initial={user.fullName.charAt(0).toUpperCase()}
							currentPhoto={user.profilePhoto}
						/>
						<div>
							<h1 className="text-2xl font-bold text-foreground">
								{user.fullName}
							</h1>
							<p className="text-sm text-muted-foreground">{user.email}</p>
							<div className="flex flex-wrap gap-2 mt-3">
								<span className="text-xs font-bold text-brand bg-white border border-brand/20 px-3 py-1 rounded-full">
									{ROLE_LABELS[user.role] ?? user.role}
								</span>
								{user.isVerified ? (
									<span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full flex items-center gap-1">
										<span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />{" "}
										{t("verified")}
									</span>
								) : (
									<span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
										{t("unverified")}
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Details */}
					<div className="px-7 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
						{[
							{ label: t("fullName"), value: user.fullName },
							{ label: t("nidNumber"), value: user.nidNumber, mono: true },
							{ label: t("emailAddress"), value: user.email },
							{ label: t("phoneNumber"), value: user.phone },
							{
								label: t("memberSince"),
								value: user.createdAt.toLocaleDateString("en-GB", {
									day: "2-digit",
									month: "long",
									year: "numeric",
								}),
							},
							{
								label: t("walletBalance"),
								value: `৳${Number(user.wallet?.balance ?? 0).toFixed(2)}`,
							},
						].map((f) => (
							<div key={f.label}>
								<p className="text-xs text-muted-foreground font-medium mb-0.5">
									{f.label}
								</p>
								<p
									className={`text-sm text-foreground ${f.mono ? "font-mono" : "font-medium"}`}
								>
									{f.value}
								</p>
							</div>
						))}
					</div>
				</div>

				{user.isAgent && user.referralCode && (
					<ReferralCard
						code={user.referralCode}
						title={t("agentReferralTitle")}
						hint={t("agentReferralHint")}
						copyLabel={t("copyCode")}
						copiedLabel={t("copied")}
					/>
				)}

				{/* Activity stats */}
				<div className="grid grid-cols-3 gap-4 mb-5">
					{[
						{
							label: t("shareProjects"),
							value: user._count.ownedShares,
							href: "/shares",
						},
						{
							label: t("lostFoundPosts"),
							value: user._count.lostFoundPosts,
							href: "/lost-found",
						},
						{
							label: t("blogPosts"),
							value: user._count.blogPosts,
							href: "/blog",
						},
					].map((s) => (
						<Link key={s.label} href={s.href}>
							<div className="bg-white rounded-xl border border-border p-4 text-center hover:border-brand/30 transition-colors">
								<p className="text-2xl font-bold text-foreground">{s.value}</p>
								<p className="text-xs text-muted-foreground mt-0.5">
									{s.label}
								</p>
							</div>
						</Link>
					))}
				</div>

				{/* Quick actions */}
				<div className="bg-white rounded-xl border border-border p-5">
					<h2 className="font-semibold text-foreground mb-4 text-sm">
						{t("quickActions")}
					</h2>
					<div className="flex flex-wrap gap-2">
						<Link
							href="/dashboard/deposit"
							className="text-xs font-semibold bg-brand-50 text-brand px-4 py-2 rounded-lg hover:bg-brand hover:text-white transition-colors"
						>
							{t("depositFunds")}
						</Link>
						<Link
							href="/shares"
							className="text-xs font-semibold bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-border transition-colors"
						>
							{t("browseShares")}
						</Link>
						<Link
							href="/wallet"
							className="text-xs font-semibold bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-border transition-colors"
						>
							{t("viewWallet")}
						</Link>
						<Link
							href="/lost-found/new"
							className="text-xs font-semibold bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-border transition-colors"
						>
							{t("postLostFound")}
						</Link>
						<Link
							href="/taxi/my"
							className="text-xs font-semibold bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-border transition-colors"
						>
							{t("myTaxiRequests")}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
