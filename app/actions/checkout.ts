"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { z } from "zod";
import { creditCommission } from "@/lib/commission";

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(session.role)) redirect("/dashboard");
  return session;
}

// ─── Admin: find a customer to bill ────────────────────────────────────────────

export async function searchUsers(query: string) {
  await requireAdmin();
  if (!query || query.trim().length < 2) return [];
  return prisma.user.findMany({
    where: {
      OR: [
        { fullName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, fullName: true, email: true, phone: true },
    take: 10,
  });
}

// ─── Admin: requests belonging to a customer that can be added to a checkout ──

export async function getCheckoutableRequests(userId: string) {
  await requireAdmin();

  const [taxiRequests, airTicketRequests, serviceRequests] = await Promise.all([
    prisma.taxiRequest.findMany({
      where: { userId, checkoutItem: null, status: { in: ["ASSIGNED", "CONFIRMED"] } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.airTicketRequest.findMany({
      where: { userId, checkoutItem: null, status: { in: ["ASSIGNED", "CONFIRMED"] } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceRequest.findMany({
      where: { userId, checkoutItem: null, status: { not: "REJECTED" } },
      orderBy: { createdAt: "desc" },
      include: { service: { select: { name: true, price: true } } },
    }),
  ]);

  return { taxiRequests, airTicketRequests, serviceRequests };
}

// ─── Admin: assemble a new checkout ────────────────────────────────────────────

const customItemSchema = z.object({
  itemType: z.literal("CUSTOM"),
  description: z.string().min(2, "Enter a description"),
  quantity: z.coerce.number().int().min(1).default(1),
  unitPrice: z.coerce.number().min(0.01, "Enter a price"),
});

const serviceItemSchema = z.object({
  itemType: z.literal("SERVICE"),
  serviceRequestId: z.string(),
  quantity: z.coerce.number().int().min(1).default(1),
  unitPrice: z.coerce.number().min(0.01, "Enter a price"),
});

const linkedItemSchema = z.object({
  itemType: z.enum(["TAXI", "AIR_TICKET"]),
  requestId: z.string(),
});

export type CheckoutItemInput =
  | z.infer<typeof customItemSchema>
  | z.infer<typeof serviceItemSchema>
  | z.infer<typeof linkedItemSchema>;

export async function createCheckoutAction(
  userId: string,
  items: CheckoutItemInput[],
  discountAmount: number
): Promise<{ error?: string; checkoutId?: string }> {
  const session = await requireAdmin();

  if (items.length === 0) return { error: "Add at least one item to the checkout." };

  type BuiltItem = {
    itemType: "TAXI" | "AIR_TICKET" | "SERVICE" | "CUSTOM";
    taxiRequestId?: string;
    airTicketRequestId?: string;
    serviceRequestId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  };

  const built: BuiltItem[] = [];

  for (const rawItem of items) {
    const validated =
      rawItem.itemType === "CUSTOM"
        ? customItemSchema.safeParse(rawItem)
        : rawItem.itemType === "SERVICE"
          ? serviceItemSchema.safeParse(rawItem)
          : linkedItemSchema.safeParse(rawItem);
    if (!validated.success) return { error: validated.error.issues[0].message };
    const item = validated.data;

    switch (item.itemType) {
      case "TAXI": {
        const req = await prisma.taxiRequest.findUnique({
          where: { id: item.requestId },
          include: { checkoutItem: true },
        });
        if (!req) return { error: "Taxi request not found." };
        if (req.checkoutItem) return { error: "That taxi request is already in a checkout." };
        if (req.price == null) return { error: "Set a price on the taxi request before adding it to a checkout." };
        built.push({
          itemType: "TAXI",
          taxiRequestId: req.id,
          description: `Taxi: ${req.pickupLocation} → ${req.destination}`,
          quantity: 1,
          unitPrice: Number(req.price),
          lineTotal: Number(req.price),
        });
        break;
      }
      case "AIR_TICKET": {
        const req = await prisma.airTicketRequest.findUnique({
          where: { id: item.requestId },
          include: { checkoutItem: true },
        });
        if (!req) return { error: "Air ticket request not found." };
        if (req.checkoutItem) return { error: "That air ticket request is already in a checkout." };
        if (req.price == null) return { error: "Set a price on the air ticket request before adding it to a checkout." };
        built.push({
          itemType: "AIR_TICKET",
          airTicketRequestId: req.id,
          description: `Flight: ${req.origin} → ${req.destination}`,
          quantity: 1,
          unitPrice: Number(req.price),
          lineTotal: Number(req.price),
        });
        break;
      }
      case "SERVICE": {
        const req = await prisma.serviceRequest.findUnique({
          where: { id: item.serviceRequestId },
          include: { service: { select: { name: true } }, checkoutItem: true },
        });
        if (!req) return { error: "Service request not found." };
        if (req.checkoutItem) return { error: "That service request is already in a checkout." };
        const quantity = item.quantity || 1;
        built.push({
          itemType: "SERVICE",
          serviceRequestId: req.id,
          description: `${req.service.name} — ${req.fullName}`,
          quantity,
          unitPrice: item.unitPrice,
          lineTotal: quantity * item.unitPrice,
        });
        break;
      }
      case "CUSTOM": {
        const quantity = item.quantity || 1;
        built.push({
          itemType: "CUSTOM",
          description: item.description,
          quantity,
          unitPrice: item.unitPrice,
          lineTotal: quantity * item.unitPrice,
        });
        break;
      }
    }
  }

  const subtotal = built.reduce((sum, i) => sum + i.lineTotal, 0);
  const clampedDiscount = Math.min(Math.max(discountAmount || 0, 0), subtotal);
  const totalAmount = subtotal - clampedDiscount;

  const checkout = await prisma.checkout.create({
    data: {
      token: randomBytes(24).toString("base64url"),
      userId,
      createdById: session.userId,
      subtotal,
      discountAmount: clampedDiscount,
      totalAmount,
      status: "DRAFT",
      items: { create: built },
    },
  });

  revalidatePath("/admin/checkouts");
  return { checkoutId: checkout.id };
}

// ─── Admin: generate the public payment link ──────────────────────────────────

export async function generatePaymentLinkAction(checkoutId: string): Promise<{ error?: string; token?: string }> {
  await requireAdmin();

  const checkout = await prisma.checkout.findUnique({ where: { id: checkoutId } });
  if (!checkout) return { error: "Checkout not found." };
  if (checkout.status !== "DRAFT") return { error: "Only draft checkouts can generate a new link." };

  const updated = await prisma.checkout.update({
    where: { id: checkoutId },
    data: {
      status: "AWAITING_PAYMENT",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  revalidatePath("/admin/checkouts");
  revalidatePath(`/admin/checkouts/${checkoutId}`);
  return { token: updated.token };
}

// ─── Public: customer submits payment proof ────────────────────────────────────

const proofSchema = z.object({
  paymentMethod: z.enum(["BANK_TRANSFER", "BKASH", "NAGAD", "ROCKET"]),
  txId: z.string().optional(),
  screenshotUrl: z.string().optional(),
});

type ProofState = { error?: string; success?: boolean } | null;

export async function submitCheckoutPaymentAction(
  token: string,
  _prev: ProofState,
  formData: FormData
): Promise<ProofState> {
  const parse = proofSchema.safeParse({
    paymentMethod: formData.get("paymentMethod"),
    txId: formData.get("txId") || undefined,
    screenshotUrl: formData.get("screenshotUrl") || undefined,
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { paymentMethod, txId, screenshotUrl } = parse.data;
  if (!txId && !screenshotUrl) {
    return { error: "Please provide a transaction ID or upload a payment screenshot." };
  }

  const checkout = await prisma.checkout.findUnique({ where: { token } });
  if (!checkout) return { error: "Checkout not found." };
  if (checkout.status !== "AWAITING_PAYMENT" && checkout.status !== "REJECTED") {
    return { error: "This checkout is not awaiting payment." };
  }
  if (checkout.expiresAt && checkout.expiresAt < new Date()) {
    return { error: "This payment link has expired. Please contact us for a new one." };
  }

  await prisma.checkout.update({
    where: { token },
    data: {
      paymentMethod,
      txId: txId ?? null,
      screenshotUrl: screenshotUrl ?? null,
      status: "PROOF_SUBMITTED",
      adminNote: null,
    },
  });

  return { success: true };
}

// ─── Admin: approve / reject submitted proof ───────────────────────────────────

export async function approveCheckoutAction(id: string) {
  const session = await requireAdmin();

  await prisma.$transaction(async (tx) => {
    const checkout = await tx.checkout.update({
      where: { id },
      data: { status: "PAID", processedById: session.userId, processedAt: new Date() },
      include: {
        items: {
          include: {
            taxiRequest: { select: { referredById: true } },
            airTicketRequest: { select: { referredById: true } },
            serviceRequest: { select: { referredById: true } },
          },
        },
      },
    });

    for (const item of checkout.items) {
      if (item.taxiRequestId) {
        await tx.taxiRequest.update({ where: { id: item.taxiRequestId }, data: { status: "CONFIRMED" } });
      }
      if (item.airTicketRequestId) {
        await tx.airTicketRequest.update({ where: { id: item.airTicketRequestId }, data: { status: "CONFIRMED" } });
      }
      if (item.serviceRequestId) {
        await tx.serviceRequest.update({ where: { id: item.serviceRequestId }, data: { status: "IN_PROGRESS" } });
      }

      const referredById =
        item.taxiRequest?.referredById ??
        item.airTicketRequest?.referredById ??
        item.serviceRequest?.referredById ??
        null;
      await creditCommission(tx, {
        referredById,
        amount: Number(item.lineTotal),
        description: item.description,
      });
    }

    await tx.notification.create({
      data: {
        userId: checkout.userId,
        title: "Payment received",
        message: `Your payment of ৳${Number(checkout.totalAmount).toFixed(2)} has been confirmed. Your booking(s) are now confirmed.`,
        type: "SYSTEM",
      },
    });
  });

  revalidatePath("/admin/checkouts");
  revalidatePath(`/admin/checkouts/${id}`);
}

export async function rejectCheckoutAction(id: string, note: string) {
  await requireAdmin();

  const checkout = await prisma.checkout.update({
    where: { id },
    data: { status: "REJECTED", adminNote: note || null },
  });

  await prisma.notification.create({
    data: {
      userId: checkout.userId,
      title: "Payment proof rejected",
      message: `We couldn't verify your payment.${note ? ` Reason: ${note}.` : ""} Please resubmit using the same link.`,
      type: "SYSTEM",
    },
  });

  revalidatePath("/admin/checkouts");
  revalidatePath(`/admin/checkouts/${id}`);
}
