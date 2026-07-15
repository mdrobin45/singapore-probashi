"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionState = { error?: string; success?: boolean; message?: string } | null;
type TaxiStatus = "PENDING" | "ASSIGNED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(session.role)) redirect("/dashboard");
  return session;
}

const taxiSchema = z.object({
  pickupLocation: z.string().min(3, "Enter pickup location"),
  destination: z.string().min(3, "Enter destination"),
  date: z.string().min(1, "Select a date"),
  passengerCount: z.coerce.number().int().min(1).max(10),
  notes: z.string().optional(),
});

export async function requestTaxiAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const parse = taxiSchema.safeParse({
    pickupLocation: formData.get("pickupLocation"),
    destination: formData.get("destination"),
    date: formData.get("date"),
    passengerCount: formData.get("passengerCount"),
    notes: formData.get("notes") || undefined,
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { pickupLocation, destination, date, passengerCount, notes } = parse.data;

  await prisma.taxiRequest.create({
    data: {
      userId: session.userId,
      pickupLocation,
      destination,
      date: new Date(date),
      passengerCount,
      notes: notes ?? null,
    },
  });

  return { success: true, message: "Taxi request submitted! We'll contact you within 1 hour to confirm." };
}

// ─── Admin: staff list for "assign to manager" ────────────────────────────────

export async function getTaxiStaff() {
  await requireAdmin();
  return prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN", "MODERATOR"] } },
    select: { id: true, fullName: true, role: true },
    orderBy: { fullName: "asc" },
  });
}

// ─── Admin: assign a vendor or internal manager + set price ──────────────────

export async function assignTaxiRequestAction(
  requestId: string,
  data: {
    assignedVendorId?: string;
    assignedManagerId?: string;
    price: number;
    adminNote?: string;
  }
): Promise<{ error?: string }> {
  const session = await requireAdmin();

  const hasVendor = !!data.assignedVendorId;
  const hasManager = !!data.assignedManagerId;
  if (hasVendor === hasManager) {
    return { error: "Assign to exactly one of vendor or manager." };
  }

  const request = await prisma.taxiRequest.findUnique({ where: { id: requestId } });
  if (!request) return { error: "Request not found." };

  await prisma.taxiRequest.update({
    where: { id: requestId },
    data: {
      price: data.price,
      assignedVendorId: hasVendor ? data.assignedVendorId : null,
      assignedManagerId: hasManager ? data.assignedManagerId : null,
      adminNote: data.adminNote || null,
      processedById: session.userId,
      processedAt: new Date(),
      status: request.status === "PENDING" ? "ASSIGNED" : request.status,
    },
  });

  const assigneeName = hasVendor
    ? (await prisma.taxiVendor.findUnique({ where: { id: data.assignedVendorId } }))?.name
    : (await prisma.user.findUnique({ where: { id: data.assignedManagerId } }))?.fullName;

  await prisma.notification.create({
    data: {
      userId: request.userId,
      title: "Taxi request assigned",
      message: `Your taxi request from ${request.pickupLocation} to ${request.destination} has been assigned to ${assigneeName ?? "our team"}. Price: ৳${Number(data.price).toFixed(2)}.`,
      type: "SYSTEM",
    },
  });

  revalidatePath("/admin/taxi");
  revalidatePath("/taxi/my");
  return {};
}

// ─── Admin: update request status ─────────────────────────────────────────────

export async function updateTaxiStatusAction(
  id: string,
  status: TaxiStatus,
  adminNote?: string
) {
  await requireAdmin();

  const request = await prisma.taxiRequest.update({
    where: { id },
    data: { status, adminNote: adminNote || null },
  });

  const STATUS_MESSAGES: Partial<Record<TaxiStatus, string>> = {
    CONFIRMED: "Your taxi booking has been confirmed.",
    COMPLETED: "Your taxi trip is marked as completed. Thanks for riding with us!",
    CANCELLED: "Your taxi request has been cancelled.",
  };

  if (STATUS_MESSAGES[status]) {
    await prisma.notification.create({
      data: {
        userId: request.userId,
        title: "Taxi request update",
        message: STATUS_MESSAGES[status]!,
        type: "SYSTEM",
      },
    });
  }

  revalidatePath("/admin/taxi");
  revalidatePath("/taxi/my");
}

// ─── Admin: vendor roster ──────────────────────────────────────────────────────

const vendorSchema = z.object({
  name: z.string().min(2, "Enter vendor name"),
  phone: z.string().min(6, "Enter a valid phone number"),
  vehicleType: z.string().optional(),
});

export async function createTaxiVendorAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parse = vendorSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    vehicleType: formData.get("vehicleType") || undefined,
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { name, phone, vehicleType } = parse.data;

  await prisma.taxiVendor.create({
    data: { name, phone, vehicleType: vehicleType ?? null },
  });

  revalidatePath("/admin/taxi/vendors");
  return { success: true };
}

export async function toggleTaxiVendorActiveAction(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.taxiVendor.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/taxi/vendors");
  revalidatePath("/admin/taxi");
}
