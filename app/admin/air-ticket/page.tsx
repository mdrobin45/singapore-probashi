import { prisma } from "@/lib/prisma";
import { getAirTicketStaff } from "@/app/actions/air-ticket";
import { StatusPill, AssignActions } from "./request-actions";

async function getAirTicketRequests() {
  return prisma.airTicketRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
      assignedManager: { select: { fullName: true } },
    },
  });
}

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminAirTicketPage() {
  const [requests, staff] = await Promise.all([
    getAirTicketRequests(),
    getAirTicketStaff(),
  ]);
  const pending = requests.filter((r) => r.status === "PENDING");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Air Ticket Requests</h1>
        <p className="text-sm text-muted-foreground">{pending.length} pending · {requests.length} total</p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Passenger</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Route</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Dates</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Pax</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Assigned To</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Price</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((r) => {
                const assigneeName = r.assignedManager?.fullName ?? null;
                const dateLabel = `${fmt(r.departDate)}${r.returnDate ? ` – ${fmt(r.returnDate)}` : ""}`;
                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors align-top">
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-foreground">{r.user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{r.user.phone}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-foreground">{r.origin}</p>
                      <p className="text-xs text-muted-foreground">→ {r.destination}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{dateLabel}</td>
                    <td className="px-4 py-3.5 font-medium text-foreground">{r.passengers}</td>
                    <td className="px-4 py-3.5 text-xs text-foreground">
                      {r.assignedManager ? r.assignedManager.fullName : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-foreground">
                      {r.price != null ? `৳${Number(r.price).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill id={r.id} status={r.status} />
                      {r.adminNote && <p className="text-[11px] text-muted-foreground mt-0.5">{r.adminNote}</p>}
                    </td>
                    <td className="px-4 py-3.5 min-w-56">
                      <AssignActions
                        id={r.id}
                        staff={staff}
                        requesterName={r.user.fullName}
                        requesterPhone={r.user.phone}
                        origin={r.origin}
                        destination={r.destination}
                        dateLabel={dateLabel}
                        currentAssigneeName={assigneeName}
                        currentPrice={r.price != null ? Number(r.price) : null}
                      />
                    </td>
                  </tr>
                );
              })}
              {requests.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">No air ticket requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
