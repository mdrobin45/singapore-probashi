import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import { ApplyForm } from "./apply-form";

async function getServices() {
  return prisma.applyService.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, description: true },
  });
}

export default async function ApplyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const services = await getServices();

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand-50 px-3 py-1 rounded-full mb-3">
                Services
              </span>
              <h1 className="text-2xl font-bold text-foreground">Apply for a Service</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your documents and our team will process your application.
              </p>
            </div>
            <Link
              href="/apply/my"
              className="shrink-0 bg-muted text-foreground text-sm font-semibold px-4 py-2.5 rounded-xl border border-border hover:bg-muted/80 transition-colors"
            >
              My Applications
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <ApplyForm services={services} />
      </div>
    </div>
  );
}
