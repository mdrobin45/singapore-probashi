import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { waLink } from "@/lib/whatsapp";

async function getMyRequests(userId: string) {
  return prisma.taxiRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      assignedVendor: { select: { name: true, phone: true } },
      assignedManager: { select: { fullName: true } },
    },
  });
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ASSIGNED: "bg-purple-100 text-purple-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function MyTaxiRequestsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [requests, t] = await Promise.all([
    getMyRequests(session.userId),
    getTranslations("taxi"),
  ]);

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href="/taxi"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("backToTaxi")}
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t("myRequests")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("myRequestsSubtitle")}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🚕</div>
            <p className="text-lg font-semibold text-foreground mb-2">{t("noRequestsYet")}</p>
            <p className="text-muted-foreground text-sm mb-6">{t("noRequestsDesc")}</p>
            <Link
              href="/taxi"
              className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
            >
              {t("submit")}
            </Link>
          </div>
        ) : (
          requests.map((r) => {
            const assigneeName = r.assignedVendor?.name ?? r.assignedManager?.fullName ?? null;
            const assigneePhone = r.assignedVendor?.phone ?? null;
            const price = r.price != null ? Number(r.price) : null;

            return (
              <div key={r.id} className="bg-white rounded-2xl border border-border p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {r.pickupLocation} → {r.destination}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{fmt(r.date)} · {r.passengerCount} pax</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {r.status}
                  </span>
                </div>

                {(assigneeName || price != null) && (
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-3">
                    {assigneeName && (
                      <p className="text-sm text-foreground">
                        {t("assignedTo")}: <span className="font-medium">{assigneeName}</span>
                      </p>
                    )}
                    {price != null && (
                      <p className="text-sm font-semibold text-foreground">
                        {t("priceLabel")}: ৳{price.toFixed(2)}
                      </p>
                    )}
                    {assigneePhone && (
                      <a
                        href={waLink(
                          assigneePhone,
                          `Hi, following up on my taxi request from ${r.pickupLocation} to ${r.destination} on ${fmt(r.date)}.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#25D366] px-3 py-1.5 rounded-lg hover:bg-[#1ebe5a] transition-colors"
                      >
                        {t("messageOnWhatsapp")}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
