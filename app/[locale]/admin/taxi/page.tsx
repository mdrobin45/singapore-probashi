import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { getTaxiStaff } from "@/app/actions/taxi";
import { StatusPill, AssignActions } from "./request-actions";

async function getTaxiRequests() {
  return prisma.taxiRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
      assignedVendor: { select: { name: true, phone: true } },
      assignedManager: { select: { fullName: true } },
    },
  });
}

async function getActiveVendors() {
  return prisma.taxiVendor.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, phone: true },
  });
}

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminTaxiPage() {
  const [requests, vendors, staff] = await Promise.all([
    getTaxiRequests(),
    getActiveVendors(),
    getTaxiStaff(),
  ]);
  const pending = requests.filter((r) => r.status === "PENDING");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Taxi Requests</h1>
          <p className="text-sm text-muted-foreground">{pending.length} pending · {requests.length} total</p>
        </div>
        <Link
          href="/admin/taxi/vendors"
          className="text-xs font-semibold text-brand border border-brand/30 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
        >
          Manage Vendors
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Passenger</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Route</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date & Time</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Pax</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Assigned To</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Price</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((r) => {
                const assigneeName = r.assignedVendor?.name ?? r.assignedManager?.fullName ?? null;
                const dateLabel = fmt(r.date);
                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors align-top">
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-foreground">{r.user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{r.user.phone}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-foreground">{r.pickupLocation}</p>
                      <p className="text-xs text-muted-foreground">→ {r.destination}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{dateLabel}</td>
                    <td className="px-4 py-3.5 font-medium text-foreground">{r.passengerCount}</td>
                    <td className="px-4 py-3.5 text-xs text-foreground">
                      {r.assignedVendor ? (
                        <>
                          <p>{r.assignedVendor.name}</p>
                          <p className="text-muted-foreground">{r.assignedVendor.phone}</p>
                        </>
                      ) : r.assignedManager ? (
                        <>
                          <p>{r.assignedManager.fullName}</p>
                          <p className="text-muted-foreground">Internal</p>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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
                        vendors={vendors}
                        staff={staff}
                        requesterName={r.user.fullName}
                        requesterPhone={r.user.phone}
                        pickupLocation={r.pickupLocation}
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
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">No taxi requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
