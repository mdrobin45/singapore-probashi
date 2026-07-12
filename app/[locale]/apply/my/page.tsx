import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";

async function getMyApplications(userId: string) {
  return prisma.applyApplication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { service: { select: { name: true, description: true } } },
  });
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:     "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED:   "bg-green-100 text-green-700",
  REJECTED:    "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:     "Pending Review",
  IN_PROGRESS: "In Progress",
  COMPLETED:   "Completed",
  REJECTED:    "Rejected",
};

const DOC_FIELDS = [
  { key: "resumeUrl",      label: "Resume / CV" },
  { key: "ePassportUrl",   label: "ePassport" },
  { key: "permitUrl",      label: "Work Permit" },
  { key: "oldPassportUrl", label: "Old Passport" },
  { key: "otherFileUrl",   label: "Other File" },
] as const;

export default async function MyApplicationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const applications = await getMyApplications(session.userId);

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <Link href="/apply" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Services
              </Link>
              <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {applications.length} total · {applications.filter((a) => a.status === "PENDING").length} pending
              </p>
            </div>
            <Link href="/apply"
              className="shrink-0 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
              Apply for Service
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {applications.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg font-semibold text-foreground mb-2">No applications yet</p>
            <p className="text-muted-foreground text-sm mb-6">Apply for a service and upload your documents to get started.</p>
            <Link href="/apply" className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const uploadedDocs = DOC_FIELDS.filter((f) => app[f.key]);
              return (
                <div key={app.id} className={`bg-white rounded-2xl border border-border p-5 ${app.status === "REJECTED" ? "opacity-70" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{app.service.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Applied {app.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${STATUS_STYLES[app.status]}`}>
                      {STATUS_LABELS[app.status]}
                    </span>
                  </div>

                  {/* Documents uploaded */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {uploadedDocs.map((f) => (
                      <span key={f.key} className="flex items-center gap-1 text-xs bg-muted text-foreground px-2.5 py-1 rounded-full">
                        <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {f.label}
                      </span>
                    ))}
                  </div>

                  {/* Status messages */}
                  {app.status === "COMPLETED" && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
                      Your application has been completed. Please check your notifications or contact admin for next steps.
                    </div>
                  )}
                  {app.status === "REJECTED" && app.adminNote && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                      <span className="font-semibold">Reason: </span>{app.adminNote}
                    </div>
                  )}
                  {app.status === "IN_PROGRESS" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
                      Your application is being processed. We will notify you when it is complete.
                    </div>
                  )}
                  {app.status === "PENDING" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                      Your application is under review. We will update you soon.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
