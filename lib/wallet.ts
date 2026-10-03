import { prisma } from "@/lib/prisma";
import { DEFAULT_TRANSFER_FEE, type TransferFeeSetting } from "@/lib/wallet-tx";
import type { WalletTxType } from "@/generated/prisma/client";

// Derives the transaction-client type generically from prisma.$transaction's
// own signature, since the generator doesn't export a named TransactionClient type.
type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// Atomically debits a wallet — the balance check and the decrement are one
// UPDATE, so two concurrent debits can never overdraw it. Throws (rolling back
// the surrounding transaction) when the balance is insufficient.
export async function debitWallet(
  tx: TxClient,
  { userId, amount, type, description, referenceId }: { userId: string; amount: number; type: WalletTxType; description: string; referenceId?: string }
): Promise<void> {
  const { count } = await tx.wallet.updateMany({
    where: { userId, balance: { gte: amount } },
    data: { balance: { decrement: amount } },
  });
  if (count === 0) {
    const wallet = await tx.wallet.findUnique({ where: { userId }, select: { balance: true } });
    throw new Error(`Insufficient wallet balance. Available: ৳${Number(wallet?.balance ?? 0).toFixed(2)}.`);
  }

  const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId } });
  await tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type,
      amount,
      description,
      referenceId,
      balanceBefore: Number(wallet.balance) + amount,
      balanceAfter: wallet.balance,
    },
  });
}

// Credits a wallet, creating it first if the user doesn't have one yet.
export async function creditWallet(
  tx: TxClient,
  { userId, amount, type, description, referenceId }: { userId: string; amount: number; type: WalletTxType; description: string; referenceId?: string }
): Promise<void> {
  const wallet = await tx.wallet.upsert({
    where: { userId },
    create: { userId, balance: amount },
    update: { balance: { increment: amount } },
  });
  await tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type,
      amount,
      description,
      referenceId,
      balanceBefore: Number(wallet.balance) - amount,
      balanceAfter: wallet.balance,
    },
  });
}

// ── User-to-user transfer fee (admin setting, default 0) ─────────────────────

const FEE_MODE_KEY = "wallet_transfer_fee_mode";
const FEE_VALUE_KEY = "wallet_transfer_fee_value";

export async function getTransferFeeSetting(): Promise<TransferFeeSetting> {
  try {
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: [FEE_MODE_KEY, FEE_VALUE_KEY] } } });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const mode = map[FEE_MODE_KEY] === "FIXED" ? "FIXED" : "PERCENTAGE";
    const value = parseFloat(map[FEE_VALUE_KEY] ?? "");
    return { mode, value: isNaN(value) || value < 0 ? DEFAULT_TRANSFER_FEE.value : value };
  } catch {
    return DEFAULT_TRANSFER_FEE;
  }
}

export async function saveTransferFeeSetting(setting: TransferFeeSetting): Promise<void> {
  await prisma.$transaction([
    prisma.siteSetting.upsert({ where: { key: FEE_MODE_KEY }, create: { key: FEE_MODE_KEY, value: setting.mode }, update: { value: setting.mode } }),
    prisma.siteSetting.upsert({ where: { key: FEE_VALUE_KEY }, create: { key: FEE_VALUE_KEY, value: String(setting.value) }, update: { value: String(setting.value) } }),
  ]);
}
