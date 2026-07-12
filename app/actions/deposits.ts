"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type ActionState = { error?: string; success?: boolean } | null;

const depositSchema = z.object({
  amount: z.coerce.number().min(10, "Minimum deposit is ৳10"),
  paymentMethod: z.enum(["BANK_TRANSFER", "BKASH", "NAGAD", "ROCKET"]),
  txId: z.string().optional(),
  screenshotUrl: z.string().optional(),
});

export async function requestDepositAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const parse = depositSchema.safeParse({
    amount: formData.get("amount"),
    paymentMethod: formData.get("paymentMethod"),
    txId: formData.get("txId") || undefined,
    screenshotUrl: formData.get("screenshotUrl") || undefined,
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { amount, paymentMethod, txId, screenshotUrl } = parse.data;

  if (!txId && !screenshotUrl) {
    return { error: "Please provide a transaction ID or upload a payment screenshot." };
  }

  if (txId) {
    const existing = await prisma.depositRequest.findFirst({
      where: { userId: session.userId, txId, status: "PENDING" },
    });
    if (existing) return { error: "A deposit with this transaction ID is already pending." };
  }

  await prisma.depositRequest.create({
    data: {
      userId: session.userId,
      amount,
      paymentMethod,
      txId: txId ?? "",
      screenshotUrl: screenshotUrl ?? null,
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
