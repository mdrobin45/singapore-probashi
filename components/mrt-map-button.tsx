"use client";

import { useEffect, useState } from "react";
import { MRTMapViewer } from "./mrt-map-viewer";

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
				type="button"
				onClick={() => setOpen(true)}
				className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-white bg-brand rounded-full hover:bg-brand-dark active:scale-95 transition-all shadow-md cursor-pointer"
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
					<path d="M15 15l6 6m-11-4a7 7 0 110-14 7 7 0 010 14zM10 7v6m3-3H7" />
				</svg>
				Interactive HD Map (Zoom & Pan)
			</button>

			{showDownload && (
				<a
					href="/mrt-map.pdf"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-muted-foreground bg-white border border-border rounded-full hover:border-brand hover:text-brand active:scale-95 transition-all shadow-xs"
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
						<path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
					</svg>
					Official PDF
				</a>
			)}

			{/* Fullscreen HD Modal */}
			{open && (
				<div className="fixed inset-0 z-60 flex flex-col">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/80 backdrop-blur-sm"
						onClick={() => setOpen(false)}
					/>

					{/* Sheet Container */}
					<div className="relative flex flex-col w-full h-full max-w-6xl mx-auto my-0 sm:my-4 sm:rounded-2xl bg-slate-900 shadow-2xl overflow-hidden border border-slate-800">
						<MRTMapViewer onClose={() => setOpen(false)} />
					</div>
				</div>
			)}
		</>
	);
}

export function MRTMapCard() {
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
			<div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border bg-slate-50/50">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-white shrink-0 shadow-xs">
							<svg
								className="w-4 h-4"
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
							<p className="text-sm font-bold text-foreground leading-tight">
								Singapore MRT Map
							</p>
							<p className="text-[11px] text-muted-foreground leading-tight">
								Mass Rapid Transit & LRT Network
							</p>
						</div>
					</div>
					<span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
						Ultra HD
					</span>
				</div>

				{/* Clickable Image Preview with Hover Overlay */}
				<div
					onClick={() => setOpen(true)}
					className="relative aspect-square bg-slate-100 flex items-center justify-center p-3 sm:p-5 overflow-hidden group cursor-pointer"
					title="Click to open interactive HD Zoom & Pan viewer"
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="/mrt-map.png"
						alt="Singapore MRT & LRT Map High Resolution"
						className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.03]"
						loading="eager"
					/>

					{/* Hover Prompt Overlay */}
					<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
						<span className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transform translate-y-1 group-hover:translate-y-0 transition-transform">
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
							</svg>
							Click to Zoom & Pan
						</span>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-wrap justify-center items-center gap-2.5 px-3 md:px-5 py-3 border-t border-border bg-slate-50/50">
					<button
						type="button"
						onClick={() => setOpen(true)}
						className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand rounded-full hover:bg-brand-dark active:scale-95 transition-all shadow-xs cursor-pointer"
					>
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M15 15l6 6m-11-4a7 7 0 110-14 7 7 0 010 14zM10 7v6m3-3H7" />
						</svg>
						Interactive HD Map
					</button>

					<a
						href="/mrt-map.pdf"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-muted-foreground bg-white border border-border rounded-full hover:border-brand hover:text-brand active:scale-95 transition-all shadow-2xs"
					>
						<svg
							className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
						</svg>
						Official PDF
					</a>
				</div>
			</div>

			{/* Fullscreen HD Modal */}
			{open && (
				<div className="fixed inset-0 z-60 flex flex-col">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/80 backdrop-blur-sm"
						onClick={() => setOpen(false)}
					/>

					{/* Sheet Container */}
					<div className="relative flex flex-col w-full h-full max-w-6xl mx-auto my-0 sm:my-4 sm:rounded-2xl bg-slate-900 shadow-2xl overflow-hidden border border-slate-800">
						<MRTMapViewer onClose={() => setOpen(false)} />
					</div>
				</div>
			)}
		</>
	);
}
