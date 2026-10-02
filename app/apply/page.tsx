import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { ApplyForm } from "./apply-form";

async function getServices() {
  return prisma.applyService.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, description: true },
  });
}

export default async function ApplyPage() {
  const [session, services] = await Promise.all([getSession(), getServices()]);

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
            {session && (
              <Link
                href="/apply/my"
                className="shrink-0 bg-muted text-foreground text-sm font-semibold px-4 py-2.5 rounded-xl border border-border hover:bg-muted/80 transition-colors"
              >
                My Applications
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {session ? (
          <ApplyForm services={services} />
        ) : (
          <div className="bg-white rounded-2xl border border-border p-10 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="font-bold text-foreground text-xl mb-2">Login to Apply</h2>
            <p className="text-muted-foreground text-sm mb-6">You need to be logged in to submit a service application.</p>
            <div className="flex justify-center gap-3">
              <Link href="/login" className="bg-brand text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-dark transition-colors text-sm">
                Login
              </Link>
              <Link href="/register" className="border border-border text-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm">
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
