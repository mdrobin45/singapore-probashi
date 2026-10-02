"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function deductCvFeeAction(): Promise<{
  error?: string;
  success?: boolean;
  fee?: number;
  newBalance?: number;
  needDeposit?: boolean;
}> {
  const session = await getSession();
  if (!session) {
    return { error: "Please log in to your account to generate and download your CV." };
  }

  // Get CV service price from database if available, otherwise fallback to 30 BDT
  const cvService = await prisma.applyService.findFirst({
    where: {
      OR: [
        { name: { contains: "Resume", mode: "insensitive" } },
        { name: { contains: "CV", mode: "insensitive" } },
      ],
    },
    select: { price: true },
  });

  const fee = cvService?.price ? Number(cvService.price) : 30;

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.userId },
  });

  if (!wallet || Number(wallet.balance) < fee) {
    const currentBal = wallet ? Number(wallet.balance) : 0;
    return {
      error: `Insufficient wallet balance (৳${currentBal.toFixed(2)}). The CV generation fee is ৳${fee.toFixed(2)}. Please deposit funds to your platform wallet.`,
      needDeposit: true,
      fee,
    };
  }

  const newBalance = Number(wallet.balance) - fee;

  await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    }),
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "CHECKOUT_PAYMENT",
        amount: fee,
        description: "Worker CV / Resume Builder - Instant PDF Generation",
        balanceBefore: wallet.balance,
        balanceAfter: newBalance,
      },
    }),
    prisma.notification.create({
      data: {
        userId: session.userId,
        title: "CV Builder Download Fee",
        message: `৳${fee.toFixed(2)} has been deducted from your platform wallet for Worker CV generation.`,
        type: "WALLET",
      },
    }),
  ]);

  revalidatePath("/wallet");
  revalidatePath("/dashboard");
  revalidatePath("/services/cv-builder");

  return { success: true, fee, newBalance };
}
