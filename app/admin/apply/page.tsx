import { prisma } from "@/lib/prisma";
import { CreateServiceModal, ServiceActions } from "./service-form";
import { ApplicationActions, FileViewer } from "./application-actions";
import { RequestActions, DocLink } from "./request-actions";

async function getData() {
  const [services, applications, serviceRequests] = await Promise.all([
    prisma.applyService.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.applyApplication.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        service: { select: { name: true } },
      },
    }),
    prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { service: { select: { name: true } } },
    }),
  ]);
  return { services, applications, serviceRequests };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:     "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED:   "bg-green-100 text-green-700",
  REJECTED:    "bg-red-100 text-red-700",
};

export default async function AdminApplyPage() {
  const { services, applications, serviceRequests } = await getData();

  const pending = applications.filter((a) => a.status === "PENDING").length;
  const pendingRequests = serviceRequests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Apply / Services</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {services.length} services · {pending} pending member applications · {pendingRequests} pending public requests
        </p>
      </div>

      {/* Services */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Services ({services.length})</h2>
          <CreateServiceModal />
        </div>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Price (৳)</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Applications</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((s) => {
                const count = applications.filter((a) => a.serviceId === s.id).length;
                return (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">{s.name}</p>
                      {s.description && <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{s.description}</p>}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">৳{Number(s.price).toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-muted-foreground text-sm">{count}</td>
                    <td className="px-4 py-3.5">
                      <ServiceActions id={s.id} isActive={s.isActive} />
                    </td>
                  </tr>
                );
              })}
              {services.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-muted-foreground text-sm">No services yet. Add one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Public Service Requests */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-base font-semibold text-foreground">Public Service Requests ({serviceRequests.length})</h2>
          {pendingRequests > 0 && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pendingRequests} pending</span>
          )}
        </div>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Applicant</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Service</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Documents</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {serviceRequests.map((r) => (
                  <tr key={r.id} className={`hover:bg-muted/30 ${r.status === "REJECTED" ? "opacity-60" : ""}`}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">{r.fullName}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                      <p className="text-xs text-muted-foreground">{r.phone}</p>
                      {r.adminNote && (
                        <p className="text-xs text-amber-700 mt-1 max-w-xs">Note: {r.adminNote}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-foreground">{r.service.name}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <DocLink label="Passport" url={r.passportUrl} />
                        <DocLink label="NID"      url={r.nidUrl} />
                        <DocLink label="Photo"    url={r.photoUrl} />
                        <DocLink label="Work Permit" url={r.workPermitUrl} />
                        <DocLink label="Other"    url={r.otherUrl} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {r.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <RequestActions id={r.id} status={r.status} />
                    </td>
                  </tr>
                ))}
                {serviceRequests.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No public requests yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Member Applications */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Member Applications ({applications.length})</h2>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Applicant</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Service</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Documents</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications.map((app) => (
                  <tr key={app.id} className={`hover:bg-muted/30 ${app.status === "REJECTED" ? "opacity-60" : ""}`}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">{app.user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{app.user.email}</p>
                      {app.user.phone && <p className="text-xs text-muted-foreground">{app.user.phone}</p>}
                      {app.adminNote && (
                        <p className="text-xs text-amber-700 mt-1 max-w-xs">Note: {app.adminNote}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-foreground">{app.service.name}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <FileViewer label="Resume" url={app.resumeUrl} />
                        <FileViewer label="ePassport" url={app.ePassportUrl} />
                        <FileViewer label="Work Permit" url={app.permitUrl} />
                        <FileViewer label="Old Passport" url={app.oldPassportUrl} />
                        <FileViewer label="Other File" url={app.otherFileUrl} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {app.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <ApplicationActions id={app.id} status={app.status} />
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No applications yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
