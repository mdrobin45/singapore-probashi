"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

type ActionState = { error?: string; success?: boolean; shareNumbersCreated?: number } | null;

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) redirect("/dashboard");
  return session;
}

// ── Approve / reject purchase request ────────────────────────────────────────

export async function processPurchaseAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin();

  const requestId = formData.get("requestId") as string;
  const decision = formData.get("decision") as "APPROVED" | "REJECTED";
  const adminNote = formData.get("adminNote") as string | null;

  const request = await prisma.sharePurchaseRequest.findUnique({
    where: { id: requestId, status: "PENDING" },
    include: { project: true },
  });

  if (!request) return { error: "Request not found or already processed." };

  if (decision === "APPROVED") {
    if (request.project.availableShares < request.quantity) {
      return { error: `Only ${request.project.availableShares} shares left.` };
    }

    try {
    await prisma.$transaction(async (tx) => {
      // Update request status
      await tx.sharePurchaseRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED", adminNote, processedById: session.userId, processedAt: new Date() },
      });

      // Decrement available shares
      await tx.project.update({
        where: { id: request.projectId },
        data: { availableShares: { decrement: request.quantity } },
      });

      // Upsert ownership
      const existing = await tx.shareOwnership.findUnique({
        where: { projectId_ownerId: { projectId: request.projectId, ownerId: request.buyerId } },
      });

      if (existing) {
        await tx.shareOwnership.update({
          where: { projectId_ownerId: { projectId: request.projectId, ownerId: request.buyerId } },
          data: { quantity: { increment: request.quantity } },
        });
      } else {
        await tx.shareOwnership.create({
          data: {
            projectId: request.projectId,
            ownerId: request.buyerId,
            quantity: request.quantity,
            purchasePrice: request.totalAmount,
          },
        });
      }

      // Assign available share numbers from the admin-defined pool
      const availableCerts = await tx.shareCertificate.findMany({
        where: { projectId: request.projectId, ownerId: null },
        orderBy: { shareNumber: "asc" },
        take: request.quantity,
        select: { id: true },
      });
      if (availableCerts.length < request.quantity) {
        throw new Error(`Not enough unassigned share numbers. Available: ${availableCerts.length}, needed: ${request.quantity}. Please create share numbers for this project first.`);
      }
      await tx.shareCertificate.updateMany({
        where: { id: { in: availableCerts.map((c) => c.id) } },
        data: { ownerId: request.buyerId, issuedAt: new Date() },
      });

      // Notify buyer
      await tx.notification.create({
        data: {
          userId: request.buyerId,
          title: "Share purchase approved",
          message: `Your purchase of ${request.quantity} shares in ${request.project.name} has been approved.`,
          type: "PURCHASE",
        },
      });
    });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed.";
      return { error: msg };
    }
  } else {
    await prisma.sharePurchaseRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED", adminNote, processedById: session.userId, processedAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId: request.buyerId,
        title: "Share purchase rejected",
        message: `Your purchase request for ${request.project.name} was rejected.${adminNote ? ` Reason: ${adminNote}` : ""}`,
        type: "PURCHASE",
      },
    });
  }

  revalidatePath("/admin/purchases");
  return { success: true };
}

// ── Create project ────────────────────────────────────────────────────────────

const projectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  totalShares: z.coerce.number().int().min(1),
  sharePrice: z.coerce.number().min(0.01),
});

export async function createProjectAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin();

  const parse = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    totalShares: formData.get("totalShares"),
    sharePrice: formData.get("sharePrice"),
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { name, description, totalShares, sharePrice } = parse.data;
  const imageUrl = (formData.get("imageUrl") as string) || null;

  const numbersRaw = formData.get("shareNumbers") as string;
  let shareNumbers: number[] = [];
  try {
    const parsed = JSON.parse(numbersRaw || "[]");
    if (Array.isArray(parsed)) shareNumbers = [...new Set(parsed.filter((n: unknown) => typeof n === "number" && n > 0))];
  } catch { /* ignore — no numbers provided */ }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      imageUrl: imageUrl || undefined,
      totalShares,
      sharePrice,
      availableShares: totalShares,
      createdById: session.userId,
    },
  });

  if (shareNumbers.length > 0) {
    await prisma.shareCertificate.createMany({
      data: shareNumbers.map((n) => ({ projectId: project.id, shareNumber: n })),
    });
  }

  revalidatePath("/admin/shares");
  return { success: true, shareNumbersCreated: shareNumbers.length };
}

// ── Approve / reject resell listing or trade ──────────────────────────────────

export async function processResellAction({
  listingId,
  tradeId,
  buyRequestId,
  type,
  status,
}: {
  listingId?: string;
  tradeId?: string;
  buyRequestId?: string;
  type: "listing" | "trade" | "buyRequest";
  status: "APPROVED" | "REJECTED";
}) {
  const session = await requireAdmin();

  if (type === "buyRequest" && buyRequestId) {
    const buyRequest = await prisma.shareBuyRequest.update({
      where: { id: buyRequestId },
      data: { status, processedById: session.userId, processedAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId: buyRequest.buyerId,
        title: status === "APPROVED" ? "Buy request approved" : "Buy request rejected",
        message:
          status === "APPROVED"
            ? `Your request to buy share #${buyRequest.shareNumber} has been approved. Admin will follow up with you.`
            : `Your request to buy share #${buyRequest.shareNumber} was not approved.`,
        type: "PURCHASE",
      },
    });

    revalidatePath("/admin/shares");
    return;
  }

  if (type === "listing" && listingId) {
    await prisma.shareListing.update({
      where: { id: listingId },
      data: { status },
    });

    const listing = await prisma.shareListing.findUnique({
      where: { id: listingId },
      include: { project: { select: { name: true } } },
    });

    if (listing) {
      await prisma.notification.create({
        data: {
          userId: listing.sellerId,
          title: status === "APPROVED" ? "Resell listing approved" : "Resell listing rejected",
          message:
            status === "APPROVED"
              ? `Your listing for ${listing.quantity} shares in ${listing.project.name} is now live on the secondary market.`
              : `Your resell listing for ${listing.project.name} was not approved.`,
          type: "TRADE",
        },
      });
    }
  }

  if (type === "trade" && tradeId) {
    const trade = await prisma.shareTrade.findUnique({
      where: { id: tradeId },
      include: {
        listing: {
          include: {
            project: { select: { name: true } },
          },
        },
      },
    });

    if (!trade) return;

    if (status === "APPROVED") {
      await prisma.$transaction(async (tx) => {
        await tx.shareTrade.update({
          where: { id: tradeId },
          data: { status: "APPROVED", processedById: session.userId, processedAt: new Date() },
        });

        // Transfer ownership: decrement seller, upsert buyer
        await tx.shareOwnership.updateMany({
          where: { projectId: trade.listing.projectId, ownerId: trade.listing.sellerId },
          data: { quantity: { decrement: trade.quantity } },
        });

        const buyerOwnership = await tx.shareOwnership.findUnique({
          where: { projectId_ownerId: { projectId: trade.listing.projectId, ownerId: trade.buyerId } },
        });

        if (buyerOwnership) {
          await tx.shareOwnership.update({
            where: { projectId_ownerId: { projectId: trade.listing.projectId, ownerId: trade.buyerId } },
            data: { quantity: { increment: trade.quantity } },
          });
        } else {
          await tx.shareOwnership.create({
            data: {
              projectId: trade.listing.projectId,
              ownerId: trade.buyerId,
              quantity: trade.quantity,
              purchasePrice: trade.totalAmount,
            },
          });
        }

        // Transfer share certificates from seller to buyer
        const certsToTransfer = await tx.shareCertificate.findMany({
          where: { projectId: trade.listing.projectId, ownerId: trade.listing.sellerId },
          orderBy: { shareNumber: "asc" },
          take: trade.quantity,
          select: { id: true },
        });
        await tx.shareCertificate.updateMany({
          where: { id: { in: certsToTransfer.map((c) => c.id) } },
          data: { ownerId: trade.buyerId },
        });

        // Notify both parties
        await tx.notification.createMany({
          data: [
            {
              userId: trade.buyerId,
              title: "Share trade approved",
              message: `You successfully bought ${trade.quantity} shares in ${trade.listing.project.name} from the secondary market.`,
              type: "TRADE",
            },
            {
              userId: trade.listing.sellerId,
              title: "Your shares have been sold",
              message: `${trade.quantity} shares in ${trade.listing.project.name} were sold. Your wallet will be credited shortly.`,
              type: "TRADE",
            },
          ],
        });
      });
    } else {
      await prisma.shareTrade.update({
        where: { id: tradeId },
        data: { status: "REJECTED", processedById: session.userId, processedAt: new Date() },
      });

      await prisma.notification.create({
        data: {
          userId: trade.buyerId,
          title: "Trade request rejected",
          message: `Your request to buy shares in ${trade.listing.project.name} was not approved.`,
          type: "TRADE",
        },
      });
    }
  }

  revalidatePath("/admin/shares");
}
