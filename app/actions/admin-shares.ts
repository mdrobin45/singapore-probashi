"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

type ActionState = { error?: string; success?: boolean } | null;

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

  await prisma.project.create({
    data: {
      name,
      description,
      totalShares,
      sharePrice,
      availableShares: totalShares,
      createdById: session.userId,
    },
  });

  revalidatePath("/admin/shares");
  return { success: true };
}

// ── Approve / reject resell listing or trade ──────────────────────────────────

export async function processResellAction({
  listingId,
  tradeId,
  type,
  status,
}: {
  listingId?: string;
  tradeId?: string;
  type: "listing" | "trade";
  status: "APPROVED" | "REJECTED";
}) {
  const session = await requireAdmin();

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
