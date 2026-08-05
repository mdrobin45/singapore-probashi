"use client";

import { useEffect, useState } from "react";

export function MRTMapButton({
	showDownload = true,
}: {
	showDownload?: boolean;
}) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (open) document.body.style.overflow = "hidden";
		else document.body.style.overflow = "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, []);

	return (
		<>
			{/* Trigger buttons */}
			<button
				onClick={() => setOpen(true)}
				className="inline-flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-white bg-brand rounded-full hover:bg-brand-dark active:scale-95 transition-all shadow-md"
			>
				<svg
					className="w-4 h-4 shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
				</svg>
				View Full Map
			</button>

			{showDownload && (
				<a
					href="/mrt-map.pdf"
					download
					className="inline-flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-muted-foreground bg-white border border-border rounded-full hover:border-brand hover:text-brand active:scale-95 transition-all"
				>
					<svg
						className="w-4 h-4 shrink-0"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
					</svg>
					Download PDF
				</a>
			)}

			{/* Modal */}
			{open && (
				<div className="fixed inset-0 z-60 flex flex-col">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/80 backdrop-blur-sm"
						onClick={() => setOpen(false)}
					/>

					{/* Sheet */}
					<div className="relative flex flex-col w-full h-full max-w-5xl mx-auto my-0 sm:my-6 sm:rounded-2xl bg-white shadow-2xl overflow-hidden">
						{/* Header */}
						<div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
							<div className="flex items-center gap-2.5">
								<span className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-white shrink-0">
									<svg
										className="w-4 h-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth={2.5}
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
									</svg>
								</span>
								<div>
									<p className="text-sm font-semibold text-foreground leading-tight">
										Singapore MRT Map
									</p>
									<p className="text-[11px] text-muted-foreground leading-tight">
										Mass Rapid Transit Network
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<a
									href="/mrt-map.pdf"
									download
									className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-brand px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
								>
									<svg
										className="w-3.5 h-3.5"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
									</svg>
									Download
								</a>
								<button
									onClick={() => setOpen(false)}
									className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
									aria-label="Close"
								>
									<svg
										className="w-4 h-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth={2.5}
										strokeLinecap="round"
									>
										<path d="M18 6L6 18M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>

						{/* PDF embed */}
						<iframe
							src="/mrt-map.pdf#view=FitH&toolbar=0"
							className="flex-1 w-full border-0"
							title="Singapore MRT Map"
						/>

						{/* Mobile fallback footer */}
						<div className="sm:hidden flex items-center justify-center gap-3 px-4 py-3 border-t border-border bg-muted/30 shrink-0">
							<p className="text-xs text-muted-foreground">
								Having trouble viewing?
							</p>
							<a
								href="/mrt-map.pdf"
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs font-semibold text-brand hover:underline"
							>
								Open in browser →
							</a>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
