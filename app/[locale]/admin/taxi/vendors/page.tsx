import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { AddVendorForm, VendorActiveToggle } from "./vendor-actions";

async function getVendors() {
  return prisma.taxiVendor.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { taxiRequests: true } } },
  });
}

export default async function AdminTaxiVendorsPage() {
  const vendors = await getVendors();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/taxi"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Taxi Requests
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Taxi Vendors</h1>
        <p className="text-sm text-muted-foreground">
          Maintain the roster of external drivers/companies you can assign taxi requests to.
        </p>
      </div>

      <div className="mb-6">
        <AddVendorForm />
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Phone</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Vehicle Type</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Assigned Rides</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-foreground">{v.name}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{v.phone}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{v.vehicleType ?? "—"}</td>
                  <td className="px-4 py-3.5 text-foreground">{v._count.taxiRequests}</td>
                  <td className="px-4 py-3.5">
                    <VendorActiveToggle id={v.id} isActive={v.isActive} />
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">No vendors added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
