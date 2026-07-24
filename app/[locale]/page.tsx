import { MRTMapButton } from "@/components/mrt-map-button";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getShareSgdRate, sgdToBdt } from "@/lib/share-pricing";
import { getTranslations } from "next-intl/server";

function getFeaturedProjects() {
	return prisma.project.findMany({
		where: { status: "ACTIVE" },
		orderBy: { createdAt: "desc" },
		take: 3,
	});
}

// SVG icons — purely visual, not translated
const ICONS = {
	shares: (
		<svg
			className="w-6 h-6"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
			<polyline points="16 7 22 7 22 13" />
		</svg>
	),
	wallet: (
		<svg
			className="w-6 h-6"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="1" y="4" width="22" height="16" rx="2" />
			<line x1="1" y1="10" x2="23" y2="10" />
		</svg>
	),
	plane: (
		<svg
			className="w-6 h-6"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<line x1="22" y1="2" x2="11" y2="13" />
			<polygon points="22 2 15 22 11 13 2 9 22 2" />
		</svg>
	),
	taxi: (
		<svg
			className="w-6 h-6"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="1" y="3" width="15" height="13" rx="1" />
			<polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
			<circle cx="5.5" cy="18.5" r="2.5" />
			<circle cx="18.5" cy="18.5" r="2.5" />
		</svg>
	),
	currency: (
		<svg
			className="w-6 h-6"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polyline points="17 1 21 5 17 9" />
			<path d="M3 11V9a4 4 0 014-4h14" />
			<polyline points="7 23 3 19 7 15" />
			<path d="M21 13v2a4 4 0 01-4 4H3" />
		</svg>
	),
	blog: (
		<svg
			className="w-6 h-6"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
			<path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
		</svg>
	),
	islamic: (
		<svg
			className="w-6 h-6"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
		</svg>
	),
	lost: (
		<svg
			className="w-6 h-6"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
	),
	support: (
		<svg
			className="w-6 h-6"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
		</svg>
	),
	arrow: (
		<svg
			className="w-4 h-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
		>
			<path d="M5 12h14M12 5l7 7-7 7" />
		</svg>
	),
	arrowSm: (
		<svg
			className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
		>
			<path d="M5 12h14M12 5l7 7-7 7" />
		</svg>
	),
	check: (
		<svg
			className="w-3 h-3 text-white"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="3"
			strokeLinecap="round"
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	),
};

export default async function HomePage() {
	const [t, featuredProjects, shareRate] = await Promise.all([
		getTranslations("home"),
		getFeaturedProjects(),
		getShareSgdRate(),
	]);

	const services = [
		{ key: "svc1", icon: ICONS.shares, href: "/shares", bg: "bg-violet-600" },
		{ key: "svc2", icon: ICONS.wallet, href: "/wallet", bg: "bg-blue-600" },
		{ key: "svc3", icon: ICONS.plane, href: "/air-ticket", bg: "bg-sky-600" },
		{ key: "svc4", icon: ICONS.taxi, href: "/taxi", bg: "bg-amber-600" },
		{
			key: "svc5",
			icon: ICONS.currency,
			href: "/currency",
			bg: "bg-emerald-600",
		},
		{ key: "svc6", icon: ICONS.blog, href: "/blog", bg: "bg-orange-600" },
		{
			key: "svc7",
			icon: ICONS.islamic,
			href: "/islamic-center",
			bg: "bg-teal-600",
		},
		{ key: "svc8", icon: ICONS.lost, href: "/lost-found", bg: "bg-rose-600" },
		{ key: "svc9", icon: ICONS.support, href: "/contact", bg: "bg-green-600" },
	] as const;

	const steps = [
		{ number: "01", titleKey: "step1Title", descKey: "step1Desc" },
		{ number: "02", titleKey: "step2Title", descKey: "step2Desc" },
		{ number: "03", titleKey: "step3Title", descKey: "step3Desc" },
	] as const;

	const mktPoints = [
		"mktPoint1",
		"mktPoint2",
		"mktPoint3",
		"mktPoint4",
		"mktPoint5",
	] as const;

	const platformItems = [
		{
			labelKey: "platformShareMarket",
			statusKey: "platformActive",
			color: "bg-emerald-500",
		},
		{
			labelKey: "platformWallet",
			statusKey: "platformOpen",
			color: "bg-brand",
		},
		{
			labelKey: "platformAirTicket",
			statusKey: "platformAvailable",
			color: "bg-sky-500",
		},
		{
			labelKey: "platformIslamicCenter",
			statusKey: "platformActive",
			color: "bg-teal-500",
		},
	] as const;

	return (
		<>
			{/* ─── Hero ─── */}
			<section className="relative overflow-hidden bg-white">
				<div className="absolute inset-0 pointer-events-none overflow-hidden">
					<div className="absolute -top-48 -right-48 size-160 rounded-full bg-brand-50 blur-3xl opacity-70" />
					<div className="absolute bottom-0 -left-32 size-120 rounded-full bg-brand-100 blur-3xl opacity-30" />
				</div>

				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-36">
					<div className="max-w-xl mx-auto">
						<div className="bg-white rounded-3xl shadow-2xl border border-border overflow-hidden">
							{/* Card header */}
							<div className="flex items-center justify-between px-3 md:px-5 py-3 md:py-4 border-b border-border">
								<div className="flex items-center gap-2.5">
									<div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white shrink-0">
										<svg
											className="w-4.5 h-4.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth={2}
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<rect x="5" y="2" width="14" height="20" rx="2" />
											<line x1="5" y1="9" x2="19" y2="9" />
											<line x1="5" y1="15" x2="19" y2="15" />
											<circle cx="8.5" cy="18" r="1" />
											<circle cx="15.5" cy="18" r="1" />
										</svg>
									</div>
									<div>
										<p className="text-sm font-semibold text-foreground leading-tight">
											Singapore MRT Map
										</p>
										<p className="text-[11px] text-muted-foreground leading-tight">
											Mass Rapid Transit Network
										</p>
									</div>
								</div>
								<span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
									Live
								</span>
							</div>

							{/* Full map, always visible — square aspect matches the PDF page so it never needs internal scrolling */}
							<div className="aspect-square bg-muted">
								<iframe
									src="/mrt-map.pdf#toolbar=0&navpanes=0&scrollbar=0&view=Fit"
									className="w-full h-full border-0"
									title="Singapore MRT Map"
								/>
							</div>

							{/* Actions */}
							<div className="flex justify-center items-center gap-2.5 px-3 md:px-5 py-2 md:py-4 border-t border-border">
								<MRTMapButton />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ─── Services grid ─── */}
			<section id="services" className="py-12 lg:py-12 md:py-24 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center space-y-3 mb-8 lg:mb-16">
						<h2 className="text-xl sm:text-4xl font-bold text-foreground">
							{t("servicesTitle")}
						</h2>
						<p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
							{t("servicesSubtitle")}
						</p>
					</div>
					{/* Mobile: icon grid (3 cols). Desktop: card grid (3 cols) */}
					<div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-5">
						{services.map((svc) => (
							<Link
								key={svc.key}
								href={svc.href}
								className="group flex flex-col items-center text-center p-3 sm:p-6 rounded-2xl border border-border bg-white hover:border-brand hover:shadow-lg transition-all duration-200 active:scale-95"
							>
								<div
									className={`size-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${svc.bg} flex items-center justify-center text-white mb-3`}
								>
									{svc.icon}
								</div>
								<h3 className="text-[10px] sm:text-base font-semibold text-foreground sm:mb-2 group-hover:text-brand transition-colors leading-tight">
									{t(`${svc.key}Title`)}
								</h3>
								<p className="hidden sm:block text-sm text-muted-foreground leading-relaxed">
									{t(`${svc.key}Desc`)}
								</p>
								<div className="hidden sm:flex items-center gap-1 mt-4 text-sm font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity">
									{t("learnMore")}
									{ICONS.arrowSm}
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* ─── Marketplace highlight ─── */}
			<section className="py-12 md:py-24 bg-muted">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						<div className="space-y-6">
							<div className="inline-flex items-center gap-2 bg-brand-50 text-brand text-sm font-medium px-4 py-1.5 rounded-full border border-brand/20">
								{t("mktBadge")}
							</div>
							<h2 className="text-xl sm:text-4xl font-bold text-foreground leading-tight">
								{t("mktTitle")}
							</h2>
							<p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">
								{t("mktSubtitle")}
							</p>
							<ul className="space-y-3">
								{mktPoints.map((key) => (
									<li
										key={key}
										className="flex items-center gap-3 text-xs sm:text-sm text-foreground"
									>
										<span className="mt-0.5 size-4 sm:size-5 rounded-full bg-brand flex items-center justify-center shrink-0">
											{ICONS.check}
										</span>
										{t(key)}
									</li>
								))}
							</ul>
							<Link
								href="/shares"
								className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand rounded-full hover:bg-brand-dark transition-colors"
							>
								{t("mktCta")}
								{ICONS.arrow}
							</Link>
						</div>

						{/* Preview card */}
						<div className="bg-white rounded-3xl border border-border p-6 shadow-xl space-y-4">
							<div className="flex items-center justify-between pb-4 border-b border-border">
								<span className="font-semibold text-foreground">
									{t("mktAvailable")}
								</span>
								<span className="text-xs text-muted-foreground">
									{t("mktUpdated")}
								</span>
							</div>
							{featuredProjects.length > 0 ? (
								featuredProjects.map((project) => (
									<div
										key={project.id}
										className="flex items-center justify-between p-4 bg-muted rounded-xl"
									>
										<div>
											<p className="font-semibold text-sm text-foreground">
												{project.name}
											</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												{project.availableShares} {t("mktSharesAvailable")}
											</p>
										</div>
										<div className="text-right">
											<p className="font-bold text-sm text-foreground">
												${Number(project.sharePriceSgd).toFixed(2)}
											</p>
											<p className="text-[11px] text-muted-foreground">
												≈ ৳{sgdToBdt(Number(project.sharePriceSgd), shareRate).toFixed(0)}
											</p>
										</div>
									</div>
								))
							) : (
								<p className="text-sm text-muted-foreground text-center py-6">
									{t("mktNoProjects")}
								</p>
							)}
							<Link
								href="/register"
								className="block text-center py-3 text-sm font-semibold text-brand border border-brand rounded-xl hover:bg-brand-50 transition-colors"
							>
								{t("mktRegister")}
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* ─── How it works ─── */}
			<section className="py-12 md:py-24 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center space-y-4 mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold text-foreground">
							{t("howTitle")}
						</h2>
						<p className="text-lg text-muted-foreground max-w-xl mx-auto">
							{t("howSubtitle")}
						</p>
					</div>
					<div className="grid md:grid-cols-3 gap-10">
						{steps.map((step, index) => (
							<div key={step.number} className="relative text-center space-y-4">
								{index < steps.length - 1 && (
									<div className="hidden md:block absolute top-8 left-[calc(50%+3.5rem)] right-0 h-px bg-brand/20" />
								)}
								<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 border-2 border-brand/20 mx-auto">
									<span className="text-2xl font-bold text-brand">
										{step.number}
									</span>
								</div>
								<h3 className="text-lg font-semibold text-foreground">
									{t(step.titleKey)}
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
									{t(step.descKey)}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
