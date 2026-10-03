import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { todayDate } from "@/lib/pick-put";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TripForm } from "./trip-form";

export default async function NewPickPutTripPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Upcoming admin rates, so the form can preview the rate for the chosen date.
  const rates = await prisma.pickPutRate.findMany({
    where: { endDate: { gte: todayDate() } },
    orderBy: { createdAt: "desc" },
    select: { direction: true, startDate: true, endDate: true, ratePerKg: true },
  });

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/pick-put" className="hover:text-brand transition-colors">Pick & Put</Link>
          <span>/</span>
          <span className="text-foreground">Offer Space</span>
        </div>

        <div className="bg-white rounded-2xl border border-border p-7">
          <h1 className="text-xl font-bold text-foreground mb-1">I&apos;m Travelling — Offer Spare Space</h1>
          <p className="text-sm text-muted-foreground mb-7">
            After packing your own luggage, how many kg can you carry for others? You&apos;ll earn the per-kg rate for every
            kg delivered.
          </p>
          <TripForm
            rates={rates.map((r) => ({
              direction: r.direction,
              startDate: r.startDate.toISOString().slice(0, 10),
              endDate: r.endDate.toISOString().slice(0, 10),
              ratePerKg: Number(r.ratePerKg),
            }))}
            minDate={todayDate().toISOString().slice(0, 10)}
          />
        </div>
      </div>
    </div>
  );
}
