"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";

const SLOT_PRICE_BDT = 50;

async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function getRemindersDataAction() {
  const session = await requireUser();

  const [reminders, wallet, user] = await Promise.all([
    prisma.reminder.findMany({
      where: { userId: session.userId },
      orderBy: { slotIndex: "asc" },
    }),
    prisma.wallet.findUnique({
      where: { userId: session.userId },
      select: { balance: true },
    }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, phone: true, fullName: true },
    }),
  ]);

  return {
    reminders,
    walletBalance: wallet ? Number(wallet.balance) : 0,
    slotPrice: SLOT_PRICE_BDT,
    user,
  };
}

export async function unlockSlotAction(slotIndex: number) {
  const session = await requireUser();

  if (slotIndex < 2 || slotIndex > 10) {
    return { error: "Invalid slot number." };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId: session.userId } });
      if (!wallet) throw new Error("Wallet not found.");
      if (Number(wallet.balance) < SLOT_PRICE_BDT) {
        throw new Error(`Insufficient wallet balance. You need at least ৳${SLOT_PRICE_BDT} to unlock Slot #${slotIndex}.`);
      }

      // Deduct from wallet
      const newBalance = Number(wallet.balance) - SLOT_PRICE_BDT;
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "REFUND", // Or custom type
          amount: SLOT_PRICE_BDT,
          description: `Unlocked Reminder Alarm Slot #${slotIndex}`,
          balanceBefore: wallet.balance,
          balanceAfter: newBalance,
        },
      });

      // Upsert slot as unlocked
      await tx.reminder.upsert({
        where: {
          userId_slotIndex: { userId: session.userId, slotIndex },
        },
        create: {
          userId: session.userId,
          slotIndex,
          isUnlocked: true,
        },
        update: {
          isUnlocked: true,
        },
      });

      revalidatePath("/reminders");
      revalidatePath("/alarm");
      revalidatePath("/dashboard");
      return { success: true, message: `Slot #${slotIndex} unlocked successfully!` };
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to unlock slot.";
    return { error: msg };
  }
}

export async function saveReminderAction(formData: FormData) {
  const session = await requireUser();

  const slotIndex = Number(formData.get("slotIndex"));
  const note = (formData.get("note") as string)?.trim();
  const dateStr = formData.get("remindAt") as string;
  const channel = (formData.get("channel") as string) || "WHATSAPP";

  if (!slotIndex || slotIndex < 1 || slotIndex > 10) {
    return { error: "Invalid slot." };
  }

  // Ensure slot is unlocked (Slot 1 is always unlocked)
  if (slotIndex > 1) {
    const existing = await prisma.reminder.findUnique({
      where: { userId_slotIndex: { userId: session.userId, slotIndex } },
    });
    if (!existing || !existing.isUnlocked) {
      return { error: `Slot #${slotIndex} is locked. Please unlock it first.` };
    }
  }

  const remindAt = dateStr ? new Date(dateStr) : null;

  await prisma.reminder.upsert({
    where: {
      userId_slotIndex: { userId: session.userId, slotIndex },
    },
    create: {
      userId: session.userId,
      slotIndex,
      isUnlocked: true,
      note: note || null,
      remindAt,
      channel,
      isActive: Boolean(note && remindAt),
    },
    update: {
      note: note || null,
      remindAt,
      channel,
      isActive: Boolean(note && remindAt),
    },
  });

  revalidatePath("/reminders");
  revalidatePath("/alarm");
  return { success: true, message: `Reminder for Slot #${slotIndex} saved!` };
}

export async function triggerTestReminderAction(slotIndex: number) {
  const session = await requireUser();

  const reminder = await prisma.reminder.findUnique({
    where: { userId_slotIndex: { userId: session.userId, slotIndex } },
    include: { user: true },
  });

  if (!reminder || !reminder.note) {
    return { error: "No note found in this reminder slot." };
  }

  // Send Email if channel is GMAIL or BOTH
  if (reminder.channel === "GMAIL" || reminder.channel === "BOTH") {
    if (reminder.user.email) {
      await sendEmail(
        reminder.user.email,
        `🔔 Singapore Probashi Reminder: Slot #${slotIndex}`,
        `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #047857;">🔔 Singapore Probashi Alarm Reminder</h2>
            <p>Hello <strong>${reminder.user.fullName}</strong>,</p>
            <p>This is your scheduled alarm reminder:</p>
            <div style="background: #f8fafc; padding: 16px; border-left: 4px solid #047857; margin: 16px 0; border-radius: 4px;">
              <p style="font-size: 16px; margin: 0; color: #1e293b;"><strong>${reminder.note}</strong></p>
              ${reminder.remindAt ? `<p style="font-size: 12px; color: #64748b; margin-top: 8px;">Target Date: ${reminder.remindAt.toLocaleDateString("en-GB")}</p>` : ""}
            </div>
            <p style="font-size: 12px; color: #94a3b8;">Singapore Probashi Community Services</p>
          </div>
        `
      );
    }
  }

  // In-app notification
  await prisma.notification.create({
    data: {
      userId: session.userId,
      title: `Alarm Reminder (Slot #${slotIndex})`,
      message: reminder.note,
      type: "SYSTEM",
    },
  });

  // Update last sent timestamp
  await prisma.reminder.update({
    where: { id: reminder.id },
    data: { lastSentAt: new Date() },
  });

  revalidatePath("/reminders");
  revalidatePath("/alarm");
  return { success: true, message: `Test reminder alert sent for Slot #${slotIndex}!` };
}
