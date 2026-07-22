import { prisma } from "@/lib/prisma";

// Derives the transaction-client type generically from prisma.$transaction's
// own signature, since the generator doesn't export a named TransactionClient type.
type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function getCommissionRate(): Promise<number> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "commission_rate" } });
    return row ? parseFloat(row.value) : 5;
  } catch {
    return 5;
  }
}

export async function creditCommission(
  tx: TxClient,
  { referredById, amount, description }: { referredById: string | null; amount: number; description: string }
): Promise<void> {
  if (!referredById) return;

  const rate = await getCommissionRate();
  const commissionAmount = Math.round(amount * (rate / 100) * 100) / 100;
  if (commissionAmount <= 0) return;

  const wallet = await tx.wallet.findUnique({ where: { userId: referredById } });
  if (!wallet) return;

  const newBalance = Number(wallet.balance) + commissionAmount;
  await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });

  await tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: "COMMISSION",
      amount: commissionAmount,
      description,
      balanceBefore: wallet.balance,
      balanceAfter: newBalance,
    },
  });

  await tx.notification.create({
    data: {
      userId: referredById,
      title: "Referral commission earned",
      message: `You earned ৳${commissionAmount.toFixed(2)} commission — ${description}.`,
      type: "WALLET",
    },
  });
}

// Resolves an optional referral code entered on a public form to the referring
// agent's user id. Returns an error message (rather than silently ignoring) so a
// mistyped code doesn't go unnoticed by the customer.
export async function resolveReferralCode(
  code: string | undefined | null
): Promise<{ referredById?: string; error?: string }> {
  const trimmed = code?.trim();
  if (!trimmed) return {};

  const agent = await prisma.user.findUnique({
    where: { referralCode: trimmed.toUpperCase() },
    select: { id: true, isAgent: true },
  });

  if (!agent || !agent.isAgent) {
    return { error: "Referral code not found — check with your agent or leave this blank." };
  }

  return { referredById: agent.id };
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

export async function generateReferralCode(fullName: string): Promise<string> {
  const prefix = (fullName.trim().split(/\s+/)[0] || "AGENT")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 10) || "AGENT";

  for (let attempt = 0; attempt < 10; attempt++) {
    let suffix = "";
    for (let i = 0; i < 4; i++) {
      suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    const code = `${prefix}-${suffix}`;
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }

  throw new Error("Could not generate a unique referral code, please try again.");
}
