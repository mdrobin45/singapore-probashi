"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type ActionState = { error?: string; success?: boolean } | null;

const withdrawalSchema = z.object({
  amount: z.coerce.number().min(10, "Minimum withdrawal is ৳10"),
  paymentMethod: z.enum(["BANK_TRANSFER", "BKASH", "NAGAD", "ROCKET"]),
  accountNumber: z.string().min(4, "Enter a valid account/mobile number"),
  accountName: z.string().min(2, "Enter the account holder's name"),
});

export async function requestWithdrawalAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const parse = withdrawalSchema.safeParse({
    amount: formData.get("amount"),
    paymentMethod: formData.get("paymentMethod"),
    accountNumber: formData.get("accountNumber"),
    accountName: formData.get("accountName"),
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { amount, paymentMethod, accountNumber, accountName } = parse.data;

  const wallet = await prisma.wallet.findUnique({ where: { userId: session.userId } });
  if (!wallet || Number(wallet.balance) < amount) {
    return { error: `Insufficient balance. Available: ৳${wallet ? Number(wallet.balance).toFixed(2) : "0.00"}.` };
  }

  await prisma.withdrawalRequest.create({
    data: {
      userId: session.userId,
      amount,
      paymentMethod,
      accountNumber,
      accountName,
      status: "PENDING",
    },
  });

  revalidatePath("/wallet");
  return { success: true };
}
