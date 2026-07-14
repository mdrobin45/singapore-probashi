"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionState = { error?: string; success?: boolean } | null;

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) redirect("/dashboard");
  return session;
}

export async function processWithdrawalAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin();

  const requestId = formData.get("requestId") as string;
  const decision = formData.get("decision") as "APPROVED" | "REJECTED";
  const adminNote = (formData.get("adminNote") as string) || null;

  const request = await prisma.withdrawalRequest.findUnique({
    where: { id: requestId, status: "PENDING" },
  });

  if (!request) return { error: "Request not found or already processed." };

  if (decision === "APPROVED") {
    try {
      await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({ where: { userId: request.userId } });
        if (!wallet) throw new Error("Wallet not found");
        if (Number(wallet.balance) < Number(request.amount)) {
          throw new Error(`User's wallet balance (৳${Number(wallet.balance).toFixed(2)}) is insufficient for this withdrawal.`);
        }

        await tx.withdrawalRequest.update({
          where: { id: requestId },
          data: { status: "APPROVED", adminNote, processedById: session.userId, processedAt: new Date() },
        });

        const newBalance = Number(wallet.balance) - Number(request.amount);
        await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "WITHDRAWAL",
            amount: request.amount,
            description: `Withdrawal via ${request.paymentMethod} to ${request.accountNumber}`,
            balanceBefore: wallet.balance,
            balanceAfter: newBalance,
          },
        });

        await tx.notification.create({
          data: {
            userId: request.userId,
            title: "Withdrawal approved",
            message: `৳${Number(request.amount).toFixed(2)} has been withdrawn from your wallet and will be sent to your ${request.paymentMethod} account.`,
            type: "WALLET",
          },
        });
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed.";
      return { error: msg };
    }
  } else {
    await prisma.withdrawalRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED", adminNote, processedById: session.userId, processedAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId: request.userId,
        title: "Withdrawal rejected",
        message: `Your withdrawal request of ৳${Number(request.amount).toFixed(2)} was rejected.${adminNote ? ` Reason: ${adminNote}` : ""}`,
        type: "WALLET",
      },
    });
  }

  revalidatePath("/admin/withdrawals");
  return { success: true };
}
