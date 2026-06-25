"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

type ActionState = { error?: string; success?: boolean; message?: string } | null;

const purchaseSchema = z.object({
  projectId: z.string().min(1),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  paymentMethod: z.enum(["BANK_TRANSFER", "BKASH", "NAGAD", "ROCKET", "WALLET"]),
  txId: z.string().optional(),
  screenshotUrl: z.string().optional(),
});

export async function requestSharePurchaseAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const parse = purchaseSchema.safeParse({
    projectId: formData.get("projectId"),
    quantity: formData.get("quantity"),
    paymentMethod: formData.get("paymentMethod"),
    txId: formData.get("txId") || undefined,
    screenshotUrl: formData.get("screenshotUrl") || undefined,
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { projectId, quantity, paymentMethod, txId, screenshotUrl } = parse.data;

  if (paymentMethod !== "WALLET" && !txId) {
    return { error: "Transaction ID is required for this payment method." };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId, status: "ACTIVE" },
    select: { id: true, name: true, sharePrice: true, availableShares: true },
  });

  if (!project) return { error: "Project not found or no longer active." };
  if (project.availableShares < quantity) {
    return { error: `Only ${project.availableShares} shares available.` };
  }

  const totalAmount = Number(project.sharePrice) * quantity;

  if (paymentMethod === "WALLET") {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
      select: { id: true, balance: true },
    });
    if (!wallet || Number(wallet.balance) < totalAmount) {
      return { error: `Insufficient wallet balance. Need ৳{totalAmount.toFixed(2)}.` };
    }
  }

  await prisma.sharePurchaseRequest.create({
    data: {
      buyerId: session.userId,
      projectId,
      quantity,
      totalAmount,
      paymentMethod,
      txId: txId ?? null,
      screenshotUrl: screenshotUrl ?? null,
      status: "PENDING",
    },
  });

  return {
    success: true,
    message: `Purchase request for ${quantity} share${quantity > 1 ? "s" : ""} submitted successfully. You will be notified once approved.`,
  };
}

// ── List shares for resale ────────────────────────────────────────────────────
const resellSchema = z.object({
  ownershipId: z.string().min(1),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  askingPrice: z.coerce.number().positive("Enter a valid price"),
});

export async function createShareListingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const parse = resellSchema.safeParse({
    ownershipId: formData.get("ownershipId"),
    quantity: formData.get("quantity"),
    askingPrice: formData.get("askingPrice"),
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { ownershipId, quantity, askingPrice } = parse.data;

  const ownership = await prisma.shareOwnership.findUnique({
    where: { id: ownershipId, ownerId: session.userId },
    select: { id: true, quantity: true, projectId: true },
  });

  if (!ownership) return { error: "Ownership not found." };
  if (quantity > ownership.quantity) {
    return { error: `You only own ${ownership.quantity} shares in this project.` };
  }

  await prisma.shareListing.create({
    data: {
      sellerId: session.userId,
      projectId: ownership.projectId,
      quantity,
      askingPrice,
      status: "PENDING",
    },
  });

  return {
    success: true,
    message: `Resell listing for ${quantity} share${quantity > 1 ? "s" : ""} submitted. Admin will review and publish it.`,
  };
}

// ── Buy from secondary market ─────────────────────────────────────────────────
const tradeSchema = z.object({
  listingId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  paymentMethod: z.enum(["BANK_TRANSFER", "BKASH", "NAGAD", "ROCKET", "WALLET"]),
  txId: z.string().optional(),
});

export async function requestShareTradeAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const parse = tradeSchema.safeParse({
    listingId: formData.get("listingId"),
    quantity: formData.get("quantity"),
    paymentMethod: formData.get("paymentMethod"),
    txId: formData.get("txId") || undefined,
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { listingId, quantity, paymentMethod, txId } = parse.data;

  if (paymentMethod !== "WALLET" && !txId) {
    return { error: "Transaction ID is required for this payment method." };
  }

  const listing = await prisma.shareListing.findUnique({
    where: { id: listingId },
    select: { id: true, quantity: true, askingPrice: true, sellerId: true, status: true },
  });

  if (!listing || listing.status !== "APPROVED") {
    return { error: "This listing is no longer available." };
  }
  if (listing.sellerId === session.userId) {
    return { error: "You cannot buy your own listing." };
  }
  if (quantity > listing.quantity) {
    return { error: `Only ${listing.quantity} shares available in this listing.` };
  }

  const totalAmount = quantity * Number(listing.askingPrice);

  await prisma.shareTrade.create({
    data: {
      listingId,
      buyerId: session.userId,
      quantity,
      totalAmount,
      paymentMethod,
      txId: txId ?? null,
      status: "PENDING",
    },
  });

  return {
    success: true,
    message: `Trade request for ${quantity} share${quantity > 1 ? "s" : ""} submitted. Admin will process it shortly.`,
  };
}
