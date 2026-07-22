"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  searchUsers,
  getCheckoutableRequests,
  createCheckoutAction,
  type CheckoutItemInput,
} from "@/app/actions/checkout";

type Customer = { id: string; fullName: string; email: string; phone: string | null };

type Checkoutable = Awaited<ReturnType<typeof getCheckoutableRequests>>;

type CustomLine = { description: string; quantity: number; unitPrice: number };

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function CheckoutBuilder() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [data, setData] = useState<Checkoutable | null>(null);

  const [selectedTaxi, setSelectedTaxi] = useState<Set<string>>(new Set());
  const [selectedAirTicket, setSelectedAirTicket] = useState<Set<string>>(new Set());
  const [selectedServices, setSelectedServices] = useState<Map<string, { quantity: number; unitPrice: number }>>(new Map());
  const [customLines, setCustomLines] = useState<CustomLine[]>([]);
  const [discountAmount, setDiscountAmount] = useState("0");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function runSearch() {
    startTransition(async () => {
      const res = await searchUsers(query);
      setResults(res);
    });
  }

  function selectCustomer(c: Customer) {
    setCustomer(c);
    setResults([]);
    setQuery("");
    setSelectedTaxi(new Set());
    setSelectedAirTicket(new Set());
    setSelectedServices(new Map());
    setCustomLines([]);
    startTransition(async () => {
      const res = await getCheckoutableRequests(c.id);
      setData(res);
    });
  }

  function toggleTaxi(id: string) {
    setSelectedTaxi((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAirTicket(id: string) {
    setSelectedAirTicket((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleService(id: string, suggestedPrice: number) {
    setSelectedServices((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, { quantity: 1, unitPrice: suggestedPrice });
      return next;
    });
  }

  function updateServicePrice(id: string, unitPrice: number) {
    setSelectedServices((prev) => {
      const next = new Map(prev);
      const current = next.get(id);
      if (current) next.set(id, { ...current, unitPrice });
      return next;
    });
  }

  function addCustomLine() {
    setCustomLines((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function updateCustomLine(index: number, patch: Partial<CustomLine>) {
    setCustomLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function removeCustomLine(index: number) {
    setCustomLines((prev) => prev.filter((_, i) => i !== index));
  }

  // Live subtotal — mirrors the server's authoritative calculation
  const taxiTotal = (data?.taxiRequests ?? [])
    .filter((r) => selectedTaxi.has(r.id))
    .reduce((sum, r) => sum + Number(r.price ?? 0), 0);
  const airTicketTotal = (data?.airTicketRequests ?? [])
    .filter((r) => selectedAirTicket.has(r.id))
    .reduce((sum, r) => sum + Number(r.price ?? 0), 0);
  const serviceTotal = Array.from(selectedServices.values()).reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
  const customTotal = customLines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const subtotal = taxiTotal + airTicketTotal + serviceTotal + customTotal;
  const discount = Math.min(Math.max(Number(discountAmount) || 0, 0), subtotal);
  const total = subtotal - discount;

  const itemCount = selectedTaxi.size + selectedAirTicket.size + selectedServices.size + customLines.length;

  function submit() {
    if (!customer) return;
    if (itemCount === 0) {
      setError("Add at least one item.");
      return;
    }
    if (customLines.some((l) => !l.description.trim() || l.unitPrice <= 0)) {
      setError("Every custom line needs a description and a price.");
      return;
    }
    setError("");

    const items: CheckoutItemInput[] = [
      ...Array.from(selectedTaxi).map((requestId) => ({ itemType: "TAXI" as const, requestId })),
      ...Array.from(selectedAirTicket).map((requestId) => ({ itemType: "AIR_TICKET" as const, requestId })),
      ...Array.from(selectedServices.entries()).map(([serviceRequestId, s]) => ({
        itemType: "SERVICE" as const,
        serviceRequestId,
        quantity: s.quantity,
        unitPrice: s.unitPrice,
      })),
      ...customLines.map((l) => ({
        itemType: "CUSTOM" as const,
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      })),
    ];

    startTransition(async () => {
      const res = await createCheckoutAction(customer.id, items, discount);
      if (res.error) setError(res.error);
      else if (res.checkoutId) router.push(`/admin/checkouts/${res.checkoutId}`);
    });
  }

  return (
    <div className="space-y-5">
      {/* Customer picker */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-3 text-sm">Customer</h2>
        {customer ? (
          <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
            <div>
              <p className="font-medium text-foreground text-sm">{customer.fullName}</p>
              <p className="text-xs text-muted-foreground">{customer.email} · {customer.phone}</p>
            </div>
            <button
              type="button"
              onClick={() => { setCustomer(null); setData(null); }}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Search by name, email, or phone…"
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-border focus:outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={runSearch}
                className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition-colors"
              >
                Search
              </button>
            </div>
            {results.length > 0 && (
              <div className="mt-2 border border-border rounded-lg divide-y divide-border overflow-hidden">
                {results.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => selectCustomer(u)}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground">{u.fullName}</p>
                    <p className="text-xs text-muted-foreground">{u.email} · {u.phone}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {customer && data && (
        <>
          {/* Taxi requests */}
          {data.taxiRequests.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-3 text-sm">Taxi Requests</h2>
              <div className="space-y-2">
                {data.taxiRequests.map((r) => (
                  <label key={r.id} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30">
                    <input type="checkbox" checked={selectedTaxi.has(r.id)} onChange={() => toggleTaxi(r.id)} />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{r.pickupLocation} → {r.destination}</p>
                      <p className="text-xs text-muted-foreground">{fmt(r.date)}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">৳{Number(r.price).toFixed(2)}</p>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Air ticket requests */}
          {data.airTicketRequests.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-3 text-sm">Air Ticket Requests</h2>
              <div className="space-y-2">
                {data.airTicketRequests.map((r) => (
                  <label key={r.id} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30">
                    <input type="checkbox" checked={selectedAirTicket.has(r.id)} onChange={() => toggleAirTicket(r.id)} />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{r.origin} → {r.destination}</p>
                      <p className="text-xs text-muted-foreground">{fmt(r.departDate)}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">৳{Number(r.price).toFixed(2)}</p>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Service requests */}
          {data.serviceRequests.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-3 text-sm">Service Requests</h2>
              <div className="space-y-2">
                {data.serviceRequests.map((r) => {
                  const selected = selectedServices.get(r.id);
                  return (
                    <div key={r.id} className="p-3 border border-border rounded-lg">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!selected}
                          onChange={() => toggleService(r.id, Number(r.service.price))}
                        />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{r.service.name}</p>
                          <p className="text-xs text-muted-foreground">{r.fullName}</p>
                        </div>
                      </label>
                      {selected && (
                        <div className="mt-2 pl-7 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Price ৳</span>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={selected.unitPrice}
                            onChange={(e) => updateServicePrice(r.id, Number(e.target.value))}
                            className="w-28 text-xs px-2 py-1 border border-border rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom lines */}
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground text-sm">Custom Line Items</h2>
              <button
                type="button"
                onClick={addCustomLine}
                className="text-xs font-semibold text-brand hover:underline"
              >
                + Add line
              </button>
            </div>
            {customLines.length === 0 ? (
              <p className="text-xs text-muted-foreground">No custom items added.</p>
            ) : (
              <div className="space-y-2">
                {customLines.map((line, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={line.description}
                      onChange={(e) => updateCustomLine(i, { description: e.target.value })}
                      placeholder="Description"
                      className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg border border-border focus:outline-none focus:border-brand"
                    />
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => updateCustomLine(i, { quantity: Number(e.target.value) })}
                      className="w-full sm:w-20 text-sm px-3 py-2 rounded-lg border border-border focus:outline-none focus:border-brand"
                      placeholder="Qty"
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => updateCustomLine(i, { unitPrice: Number(e.target.value) })}
                      className="w-full sm:w-28 text-sm px-3 py-2 rounded-lg border border-border focus:outline-none focus:border-brand"
                      placeholder="Price"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomLine(i)}
                      className="text-xs font-semibold text-red-600 px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border border-border p-5 space-y-3">
            <h2 className="font-semibold text-foreground text-sm">Summary</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-28 text-sm px-2 py-1 border border-border rounded-lg text-right"
              />
            </div>
            <div className="flex items-center justify-between text-base font-bold border-t border-border pt-3">
              <span className="text-foreground">Total</span>
              <span className="text-brand">৳{total.toFixed(2)}</span>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="button"
              disabled={isPending}
              onClick={submit}
              className="w-full bg-brand text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              {isPending ? "Creating…" : "Create Checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
