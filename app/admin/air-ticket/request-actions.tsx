"use client";

import { useState, useTransition } from "react";
import { assignAirTicketRequestAction, updateAirTicketStatusAction } from "@/app/actions/air-ticket";
import { waLink } from "@/lib/whatsapp";

type Status = "PENDING" | "ASSIGNED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_STYLES: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ASSIGNED: "bg-purple-100 text-purple-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

export function StatusPill({ id, status }: { id: string; status: Status }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function update(s: Status) {
    startTransition(async () => {
      await updateAirTicketStatusAction(id, s, note);
      setOpen(false);
    });
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}
      >
        {status}
      </button>

      {open && (
        <div className="absolute left-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-20 w-52 p-3 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Admin note (optional)"
            rows={2}
            className="w-full text-xs px-2 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand resize-none"
          />
          <div className="grid grid-cols-2 gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={isPending || opt.value === status}
                onClick={() => update(opt.value)}
                className={`text-[10px] font-semibold px-2 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                  opt.value === status
                    ? "border-brand bg-brand text-white"
                    : "border-border hover:border-brand hover:text-brand"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

type Staff = { id: string; fullName: string };

export function AssignActions({
  id,
  staff,
  requesterName,
  requesterPhone,
  origin,
  destination,
  dateLabel,
  currentAssigneeName,
  currentPrice,
}: {
  id: string;
  staff: Staff[];
  requesterName: string;
  requesterPhone: string | null;
  origin: string;
  destination: string;
  dateLabel: string;
  currentAssigneeName: string | null;
  currentPrice: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");
  const [price, setPrice] = useState(currentPrice != null ? String(currentPrice) : "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function save() {
    if (!assigneeId) {
      setError("Select a manager.");
      return;
    }
    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      setError("Enter a valid price.");
      return;
    }
    setError("");
    startTransition(async () => {
      const res = await assignAirTicketRequestAction(id, {
        assignedManagerId: assigneeId,
        price: priceNum,
        adminNote: note,
      });
      if (res.error) setError(res.error);
      else setOpen(false);
    });
  }

  const assigneeName = staff.find((s) => s.id === assigneeId)?.fullName;

  const riderMessage = `Hi ${requesterName}, your air ticket request from ${origin} to ${destination} on ${dateLabel} has been assigned${
    currentAssigneeName ? ` to ${currentAssigneeName}` : ""
  }.${currentPrice != null ? ` Price: ৳${currentPrice.toFixed(2)}.` : ""} We'll be in touch shortly.`;

  const groupMessage = `New air ticket request\nRider: ${requesterName}\nRoute: ${origin} → ${destination}\nDate: ${dateLabel}${
    currentAssigneeName ? `\nAssigned to: ${currentAssigneeName}` : ""
  }${currentPrice != null ? `\nPrice: ৳${currentPrice.toFixed(2)}` : ""}`;

  function copyGroupMessage() {
    navigator.clipboard.writeText(groupMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-border hover:border-brand hover:text-brand transition-colors"
      >
        {currentAssigneeName ? "Reassign" : "Assign"}
      </button>

      {requesterPhone && (
        <a
          href={waLink(requesterPhone, riderMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#25D366]/10 text-[#1ebe5a] hover:bg-[#25D366]/20 transition-colors"
        >
          Message rider
        </a>
      )}

      <button
        type="button"
        onClick={copyGroupMessage}
        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-border hover:border-brand hover:text-brand transition-colors"
      >
        {copied ? "Copied!" : "Copy group alert"}
      </button>

      {open && (
        <div className="w-full mt-2 bg-white border border-border rounded-xl shadow-sm p-3 space-y-2.5">
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full text-xs px-2 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="">Select manager…</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price (৳)"
            className="w-full text-xs px-2 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand"
          />

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Admin note (optional)"
            rows={2}
            className="w-full text-xs px-2 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand resize-none"
          />

          {error && <p className="text-[11px] text-red-600">{error}</p>}
          {assigneeId && (
            <p className="text-[11px] text-muted-foreground">Assigning to: {assigneeName}</p>
          )}

          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={isPending}
              onClick={save}
              className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
