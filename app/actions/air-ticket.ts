"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { resolveReferralCode } from "@/lib/commission";

type ActionState = { error?: string; success?: boolean; message?: string } | null;
type BookingStatus = "PENDING" | "ASSIGNED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(session.role)) redirect("/dashboard");
  return session;
}

const airTicketSchema = z.object({
  origin: z.string().min(2, "Enter origin"),
  destination: z.string().min(2, "Enter destination"),
  departDate: z.string().min(1, "Select a departure date"),
  returnDate: z.string().optional(),
  passengers: z.coerce.number().int().min(1).max(10),
  notes: z.string().optional(),
});

export async function requestAirTicketAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const parse = airTicketSchema.safeParse({
    origin: formData.get("origin"),
    destination: formData.get("destination"),
    departDate: formData.get("departDate"),
    returnDate: formData.get("returnDate") || undefined,
    passengers: formData.get("passengers"),
    notes: formData.get("notes") || undefined,
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { origin, destination, departDate, returnDate, passengers, notes } = parse.data;

  const { referredById, error: referralError } = await resolveReferralCode(
    formData.get("referralCode") as string | null,
    session.userId
  );
  if (referralError) return { error: referralError };

  await prisma.airTicketRequest.create({
    data: {
      userId: session.userId,
      origin,
      destination,
      departDate: new Date(departDate),
      returnDate: returnDate ? new Date(returnDate) : null,
      passengers,
      notes: notes ?? null,
      referredById,
    },
  });

  return { success: true, message: "Air ticket request submitted! We'll contact you within 1 hour to discuss options." };
}

// ─── Admin: staff list for "assign to manager" ────────────────────────────────

export async function getAirTicketStaff() {
  await requireAdmin();
  return prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN", "MODERATOR"] } },
    select: { id: true, fullName: true, role: true },
    orderBy: { fullName: "asc" },
  });
}

// ─── Admin: assign an internal manager + set price ────────────────────────────

export async function assignAirTicketRequestAction(
  requestId: string,
  data: { assignedManagerId: string; price: number; adminNote?: string }
): Promise<{ error?: string }> {
  const session = await requireAdmin();

  const request = await prisma.airTicketRequest.findUnique({ where: { id: requestId } });
  if (!request) return { error: "Request not found." };

  await prisma.airTicketRequest.update({
    where: { id: requestId },
    data: {
      price: data.price,
      assignedManagerId: data.assignedManagerId,
      adminNote: data.adminNote || null,
      processedById: session.userId,
      processedAt: new Date(),
      status: request.status === "PENDING" ? "ASSIGNED" : request.status,
    },
  });

  const manager = await prisma.user.findUnique({ where: { id: data.assignedManagerId } });

  await prisma.notification.create({
    data: {
      userId: request.userId,
      title: "Air ticket request assigned",
      message: `Your air ticket request from ${request.origin} to ${request.destination} has been assigned to ${manager?.fullName ?? "our team"}. Price: ৳${Number(data.price).toFixed(2)}.`,
      type: "SYSTEM",
    },
  });

  revalidatePath("/admin/air-ticket");
  revalidatePath("/air-ticket/my");
  return {};
}

// ─── Admin: update request status ─────────────────────────────────────────────

export async function updateAirTicketStatusAction(
  id: string,
  status: BookingStatus,
  adminNote?: string
) {
  await requireAdmin();

  const request = await prisma.airTicketRequest.update({
    where: { id },
    data: { status, adminNote: adminNote || null },
  });

  const STATUS_MESSAGES: Partial<Record<BookingStatus, string>> = {
    CONFIRMED: "Your air ticket booking has been confirmed.",
    COMPLETED: "Your air ticket trip is marked as completed. Thanks for flying with us!",
    CANCELLED: "Your air ticket request has been cancelled.",
  };

  if (STATUS_MESSAGES[status]) {
    await prisma.notification.create({
      data: {
        userId: request.userId,
        title: "Air ticket request update",
        message: STATUS_MESSAGES[status]!,
        type: "SYSTEM",
      },
    });
  }

  revalidatePath("/admin/air-ticket");
  revalidatePath("/air-ticket/my");
}
