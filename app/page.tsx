import Link from "next/link";

const services = [
	{
		icon: (
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
		title: "Share Marketplace",
		description:
			"Invest in community projects. Buy, sell and trade shares with admin-verified transparent transactions.",
		href: "/marketplace",
		bg: "bg-violet-600",
	},
	{
		icon: (
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
		title: "Wallet System",
		description:
			"Secure internal wallet for deposits, share purchases and all platform service payments.",
		href: "/wallet",
		bg: "bg-blue-600",
	},
	{
		icon: (
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
		title: "Air Tickets",
		description:
			"Book and refer air tickets. Track referrals and earn commissions through your network.",
		href: "/air-ticket",
		bg: "bg-sky-600",
	},
	{
		icon: (
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
		title: "Taxi Rental",
		description:
			"Request a taxi with pickup location, destination, date, time, and vehicle type preferences.",
		href: "/taxi",
		bg: "bg-amber-600",
	},
	{
		icon: (
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
		title: "Currency Converter",
		description:
			"Live exchange rates for BDT, SGD and all major currencies. Always up to date.",
		href: "/currency",
		bg: "bg-emerald-600",
	},
	{
		icon: (
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
		title: "Blog",
		description:
			"Stay updated with community news, important guides and announcements from our team.",
		href: "/blog",
		bg: "bg-orange-600",
	},
	{
		icon: (
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
		title: "Islamic Center",
		description:
			"Surah collection, duas, Islamic articles and a full PDF library with an online reader.",
		href: "/islamic-center",
		bg: "bg-teal-600",
	},
	{
		icon: (
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
		title: "Lost & Found",
		description:
			"Post lost or found items with images. Share on Facebook and WhatsApp to reach the community.",
		href: "/lost-found",
		bg: "bg-rose-600",
	},
	{
		icon: (
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
		title: "Customer Support",
		description:
			"Direct WhatsApp support channel. Get quick help from our team at any time.",
		href: "/contact",
		bg: "bg-green-600",
	},
];

const steps = [
	{
		number: "01",
		title: "Create Your Account",
		description:
			"Register with your NID number and email address. Verify via OTP to activate your account instantly.",
	},
	{
		number: "02",
		title: "Complete Your Profile",
		description:
			"Add your personal information and profile photo to get full access to all platform features.",
	},
	{
		number: "03",
		title: "Start Using Services",
		description:
			"Explore the marketplace, convert currency, book tickets and connect with your community.",
	},
];

export default function HomePage() {
	return (
		<>
			{/* ─── Hero ─── */}
			<section className="relative overflow-hidden bg-white">
				{/* Background blobs */}
				<div className="absolute inset-0 pointer-events-none overflow-hidden">
					<div className="absolute -top-48 -right-48 size-160 rounded-full bg-brand-50 blur-3xl opacity-70" />
					<div className="absolute bottom-0 -left-32 size-120 rounded-full bg-brand-100 blur-3xl opacity-30" />
				</div>

				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
					<div className="grid lg:grid-cols-2 gap-14 items-center">
						{/* Left */}
						<div className="space-y-8">
							<div className="inline-flex items-center gap-2 bg-brand-50 text-brand text-sm font-medium px-4 py-1.5 rounded-full border border-brand/20">
								<span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
								Bangladesh Community in Singapore
							</div>

							<h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-foreground leading-[1.1]">
								Your Complete
								<br />
								<span className="text-brand">Community</span>
								<br />
								Platform
							</h1>

							<p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
								Invest in projects, manage your wallet, book air tickets, access
								Islamic resources — everything you need as a Bangladeshi in
								Singapore, in one place.
							</p>

							<div className="flex flex-wrap gap-4">
								<Link
									href="/register"
									className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-brand rounded-full hover:bg-brand-dark transition-colors shadow-lg"
								>
									Get Started Free
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
								</Link>
								<Link
									href="#services"
									className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-foreground border border-border rounded-full hover:border-brand hover:text-brand transition-colors"
								>
									Explore Services
								</Link>
							</div>

							{/* Social proof */}
							<div className="flex items-center gap-4 pt-2">
								<div className="flex -space-x-2">
									{["R", "M", "K", "S"].map((letter) => (
										<div
											key={letter}
											className="w-9 h-9 rounded-full bg-brand-100 border-2 border-white flex items-center justify-center text-xs font-bold text-brand"
										>
											{letter}
										</div>
									))}
								</div>
								<p className="text-sm text-muted-foreground">
									<span className="font-semibold text-foreground">5,000+</span>{" "}
									members already joined
								</p>
							</div>
						</div>

						{/* Right — platform preview card */}
						<div className="hidden lg:flex justify-end">
							<div className="w-[380px] bg-white rounded-3xl shadow-2xl border border-border p-6 space-y-5">
								<div className="flex items-center justify-between">
									<span className="text-sm font-semibold text-foreground">
										Platform Overview
									</span>
									<span className="text-xs font-medium text-brand bg-brand-50 px-2.5 py-1 rounded-full">
										Live
									</span>
								</div>

								<div className="grid grid-cols-3 gap-3">
									{[
										{ label: "Members", value: "5,200+" },
										{ label: "Projects", value: "24" },
										{ label: "Shares", value: "12K+" },
									].map((stat) => (
										<div
											key={stat.label}
											className="bg-muted rounded-2xl p-3 text-center"
										>
											<p className="text-lg font-bold text-foreground">
												{stat.value}
											</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												{stat.label}
											</p>
										</div>
									))}
								</div>

								<div className="space-y-2">
									{[
										{
											label: "Share Marketplace",
											status: "Active",
											color: "bg-emerald-500",
										},
										{
											label: "Wallet Deposits",
											status: "Open",
											color: "bg-brand",
										},
										{
											label: "Air Tickets",
											status: "Available",
											color: "bg-sky-500",
										},
										{
											label: "Islamic Center",
											status: "Active",
											color: "bg-teal-500",
										},
									].map((item) => (
										<div
											key={item.label}
											className="flex items-center justify-between px-4 py-3 bg-muted rounded-xl"
										>
											<span className="text-sm font-medium text-foreground">
												{item.label}
											</span>
											<span
												className={`flex items-center gap-1.5 text-xs font-semibold text-white ${item.color} px-2.5 py-1 rounded-full`}
											>
												<span className="w-1.5 h-1.5 rounded-full bg-white/70" />
												{item.status}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ─── Stats bar ─── */}
			<section className="bg-brand py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-white text-center">
						{[
							{ value: "5,200+", label: "Registered Members" },
							{ value: "24", label: "Active Projects" },
							{ value: "12,000+", label: "Shares Traded" },
							{ value: "9", label: "Platform Services" },
						].map((stat) => (
							<div key={stat.label}>
								<p className="text-3xl sm:text-4xl font-bold">{stat.value}</p>
								<p className="text-sm text-white/70 mt-1.5">{stat.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── Services grid ─── */}
			<section id="services" className="py-24 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center space-y-4 mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold text-foreground">
							Everything You Need in One Place
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							From financial services to community tools — built specifically
							for Bangladeshi expatriates in Singapore.
						</p>
					</div>

					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
						{services.map((service) => (
							<Link
								key={service.title}
								href={service.href}
								className="group p-6 rounded-2xl border border-border bg-white hover:border-brand hover:shadow-lg transition-all duration-200"
							>
								<div
									className={`w-12 h-12 rounded-xl ${service.bg} flex items-center justify-center text-white mb-4`}
								>
									{service.icon}
								</div>
								<h3 className="font-semibold text-foreground mb-2 group-hover:text-brand transition-colors">
									{service.title}
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{service.description}
								</p>
								<div className="flex items-center gap-1 mt-4 text-sm font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity">
									Learn more
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
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* ─── Marketplace highlight ─── */}
			<section className="py-24 bg-muted">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						{/* Text */}
						<div className="space-y-6">
							<div className="inline-flex items-center gap-2 bg-brand-50 text-brand text-sm font-medium px-4 py-1.5 rounded-full border border-brand/20">
								Featured Module
							</div>
							<h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
								Share Investment Marketplace
							</h2>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Invest in verified community projects. Every transaction is
								manually approved by our admin team — transparent, secure and
								community-driven.
							</p>
							<ul className="space-y-3">
								{[
									"Admin-created and verified investment projects",
									"Manual payment approval — bKash, Nagad, Bank Transfer",
									"Secondary market: list your shares for resale",
									"Dynamic share pricing set by admin",
									"Full purchase and transaction history",
								].map((point) => (
									<li
										key={point}
										className="flex items-start gap-3 text-sm text-foreground"
									>
										<span className="mt-0.5 w-5 h-5 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
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
										</span>
										{point}
									</li>
								))}
							</ul>
							<Link
								href="/marketplace"
								className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand rounded-full hover:bg-brand-dark transition-colors"
							>
								View Marketplace
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
							</Link>
						</div>

						{/* Preview card */}
						<div className="bg-white rounded-3xl border border-border p-6 shadow-xl space-y-4">
							<div className="flex items-center justify-between pb-4 border-b border-border">
								<span className="font-semibold text-foreground">
									Available Projects
								</span>
								<span className="text-xs text-muted-foreground">
									Updated live
								</span>
							</div>
							{[
								{
									name: "Project Alpha",
									available: 124,
									price: "S$12.50",
									change: "+8.2%",
								},
								{
									name: "Project Beta",
									available: 280,
									price: "S$8.00",
									change: "+3.1%",
								},
								{
									name: "Project Gamma",
									available: 50,
									price: "S$15.00",
									change: "+12.5%",
								},
							].map((project) => (
								<div
									key={project.name}
									className="flex items-center justify-between p-4 bg-muted rounded-xl"
								>
									<div>
										<p className="font-semibold text-sm text-foreground">
											{project.name}
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											{project.available} shares available
										</p>
									</div>
									<div className="text-right">
										<p className="font-bold text-sm text-foreground">
											{project.price}
										</p>
										<p className="text-xs text-emerald-600 font-semibold">
											{project.change}
										</p>
									</div>
								</div>
							))}
							<Link
								href="/register"
								className="block text-center py-3 text-sm font-semibold text-brand border border-brand rounded-xl hover:bg-brand-50 transition-colors"
							>
								Register to Invest
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* ─── How it works ─── */}
			<section className="py-24 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center space-y-4 mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold text-foreground">
							How to Get Started
						</h2>
						<p className="text-lg text-muted-foreground max-w-xl mx-auto">
							Join thousands of community members in 3 simple steps.
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
									{step.title}
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
									{step.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── CTA banner ─── */}
			<section className="py-20 bg-brand">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
					<h2 className="text-3xl sm:text-4xl font-bold text-white">
						Ready to Join the Community?
					</h2>
					<p className="text-lg text-white/80 max-w-xl mx-auto">
						Register today and get access to all platform features — completely
						free for community members.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Link
							href="/register"
							className="px-8 py-3.5 text-base font-semibold text-brand bg-white rounded-full hover:bg-brand-50 transition-colors shadow-lg"
						>
							Create Free Account
						</Link>
						<Link
							href="/contact"
							className="px-8 py-3.5 text-base font-semibold text-white border-2 border-white/40 rounded-full hover:border-white/80 hover:bg-white/10 transition-colors"
						>
							Contact Support
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
