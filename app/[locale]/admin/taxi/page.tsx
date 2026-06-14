import { prisma } from "@/lib/prisma";

async function getTaxiRequests() {
  return prisma.taxiRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { user: { select: { fullName: true, email: true, phone: true } } },
  });
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminTaxiPage() {
  const requests = await getTaxiRequests();
  const pending = requests.filter((r) => r.status === "PENDING");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Taxi Requests</h1>
        <p className="text-sm text-muted-foreground">{pending.length} pending · {requests.length} total</p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Passenger</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Route</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date & Time</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Vehicle</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Pax</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3.5">
                    <p className="font-medium text-foreground">{r.user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{r.user.phone}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-foreground">{r.pickupLocation}</p>
                    <p className="text-xs text-muted-foreground">→ {r.destination}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{fmt(r.date)}</td>
                  <td className="px-4 py-3.5 text-sm text-foreground">{r.vehicleType}</td>
                  <td className="px-4 py-3.5 font-medium text-foreground">{r.passengerCount}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {r.status}
                    </span>
                    {r.adminNote && <p className="text-[11px] text-muted-foreground mt-0.5">{r.adminNote}</p>}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No taxi requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
