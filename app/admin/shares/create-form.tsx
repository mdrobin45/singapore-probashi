"use client";

import { useActionState, useRef, useState } from "react";
import { createProjectAction } from "@/app/actions/admin-shares";

const INPUT = "w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

export function CreateProjectForm() {
  const [state, action, pending] = useActionState(createProjectAction, null);

  // Image
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Base per-share price, tracked so the Share Numbers section can show it as a live default
  const [basePriceInput, setBasePriceInput] = useState("");
  const basePrice = parseFloat(basePriceInput) || 0;

  // Share numbers — one-by-one entry, each with its own optional price and optional Word / Plot code
  const [shareNums, setShareNums] = useState<{ number: number; priceSgd: number | null; code?: string | null }[]>([]);
  const [numInput, setNumInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [numError, setNumError] = useState("");
  const numInputRef = useRef<HTMLInputElement>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4.5 * 1024 * 1024) { alert("Image too large. Max 4MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function addShareNum() {
    const raw = numInput.trim();
    if (!raw) return;
    const n = parseInt(raw, 10);
    if (isNaN(n) || n < 1) { setNumError("Must be a positive integer."); return; }
    if (shareNums.some((x) => x.number === n)) { setNumError(`#${String(n).padStart(6, "0")} already added.`); return; }
    const priceRaw = priceInput.trim();
    const priceSgd = priceRaw ? parseFloat(priceRaw) : null;
    if (priceSgd !== null && (isNaN(priceSgd) || priceSgd <= 0)) { setNumError("Enter a valid price or leave it blank."); return; }
    const code = codeInput.trim() || null;
    const next = [...shareNums, { number: n, priceSgd, code }].sort((a, b) => a.number - b.number);
    setShareNums(next);
    setNumInput("");
    setCodeInput("");
    setPriceInput("");
    setNumError("");
    numInputRef.current?.focus();
  }

  function removeShareNum(n: number) {
    setShareNums((prev) => prev.filter((x) => x.number !== n));
  }

  function handleNumKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); addShareNum(); }
  }

  // Reading imageUrl/shareNumbers from a ref-mutated hidden <input> was unreliable —
  // React doesn't guarantee that DOM mutation survives to submit time. Inject the
  // current React state into FormData directly instead, same pattern as the Share
  // Numbers manager's save handler.
  function handleSubmit(formData: FormData) {
    if (preview) formData.set("imageUrl", preview);
    formData.set("shareNumbers", JSON.stringify(shareNums));
    action(formData);
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden sticky top-24">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Create New Project</h3>
      </div>
      <form action={handleSubmit} className="p-5 space-y-4">
        {/* Image upload */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Project Image</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="relative w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-brand cursor-pointer overflow-hidden transition-colors group"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-1 text-muted-foreground group-hover:text-brand transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">Click to upload project image</p>
                <p className="text-[11px] text-muted-foreground">JPG, PNG · max 4MB</p>
              </div>
            )}
          </div>
          {preview && (
            <button type="button" onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="mt-1 text-xs text-red-500 hover:text-red-600">
              Remove image
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Project Name</label>
          <input name="name" type="text" required placeholder="e.g. Singapore Tech Fund 2026" className={INPUT} />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Description</label>
          <textarea name="description" required rows={3} placeholder="Brief description of the project…"
            className={`${INPUT} resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Total Shares</label>
            <input name="totalShares" type="number" required min={1} placeholder="1000" className={INPUT} />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Price per Share (SGD)</label>
            <input
              name="sharePriceSgd"
              type="number"
              required
              min={0.01}
              step={0.01}
              placeholder="5.99"
              value={basePriceInput}
              onChange={(e) => setBasePriceInput(e.target.value)}
              className={INPUT}
            />
          </div>
        </div>

        {/* Share numbers — one by one, each with its own optional price */}
        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold text-foreground mb-0.5">Share Numbers</p>
          <p className="text-[11px] text-muted-foreground mb-3">
            Each number is the unique identity of one individual share. Give it its own price, or leave it blank to use the price above{basePrice ? ` ($${basePrice.toFixed(2)})` : ""}. Type and press Enter or +.
          </p>
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <input
              ref={numInputRef}
              type="number"
              min={1}
              value={numInput}
              onChange={(e) => { setNumInput(e.target.value); setNumError(""); }}
              onKeyDown={handleNumKeyDown}
              placeholder="Share # (e.g. 101)"
              className="w-full sm:w-32 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
            <input
              type="text"
              value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value); setNumError(""); }}
              onKeyDown={handleNumKeyDown}
              placeholder="Word / Plot Code (e.g. PLOT-01, LAND-05)"
              className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand uppercase font-mono"
            />
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={priceInput}
              onChange={(e) => { setPriceInput(e.target.value); setNumError(""); }}
              onKeyDown={handleNumKeyDown}
              placeholder={basePrice ? `$${basePrice.toFixed(2)} (default)` : "price (optional)"}
              className="w-full sm:w-36 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
            <button
              type="button"
              onClick={addShareNum}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors text-xl font-bold shrink-0 cursor-pointer"
              title="Add share"
            >
              +
            </button>
          </div>

          {numError && <p className="text-xs text-red-500 mt-1">{numError}</p>}

          {shareNums.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] text-muted-foreground mb-2">{shareNums.length} share{shareNums.length !== 1 ? "s" : ""} added:</p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {shareNums.map((n) => (
                  <span key={n.number} className="inline-flex items-center gap-1 text-xs font-mono bg-brand-50 border border-brand/30 text-brand px-2 py-1 rounded-lg">
                    {n.code ? (
                      <span><strong>{n.code}</strong> <span className="text-brand/70">(#{String(n.number).padStart(6, "0")})</span></span>
                    ) : (
                      <span>#{String(n.number).padStart(6, "0")}</span>
                    )}
                    <span className="text-brand/80 font-bold ml-1">${(n.priceSgd ?? basePrice).toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => removeShareNum(n.number)}
                      className="text-brand/60 hover:text-red-500 ml-1 leading-none transition-colors cursor-pointer"
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {state?.error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Project created!{state.shareNumbersCreated ? ` ${state.shareNumbersCreated} share numbers generated.` : ""}
          </p>
        )}

        <button type="submit" disabled={pending}
          className="w-full bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60">
          {pending ? "Creating…" : "Create Project"}
        </button>
      </form>
    </div>
  );
}
