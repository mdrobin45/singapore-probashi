import { prisma } from "@/lib/prisma";
import { COMMISSION_MODULES, type CommissionModule, type CommissionMode, type CommissionSetting } from "@/lib/commission-types";

export type { CommissionModule, CommissionMode, CommissionSetting } from "@/lib/commission-types";
export { COMMISSION_MODULES } from "@/lib/commission-types";

// Derives the transaction-client type generically from prisma.$transaction's
// own signature, since the generator doesn't export a named TransactionClient type.
type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const MODULE_DEFAULTS: Record<CommissionModule, CommissionSetting> = {
  TAXI: { mode: "PERCENTAGE", value: 5 },
  AIR_TICKET: { mode: "PERCENTAGE", value: 5 },
  SERVICE: { mode: "PERCENTAGE", value: 5 },
  SHARE: { mode: "PERCENTAGE", value: 5 },
};

function settingKeys(module: CommissionModule) {
  const key = module.toLowerCase();
  return { modeKey: `commission_${key}_mode`, valueKey: `commission_${key}_value` };
}

export async function getCommissionSetting(module: CommissionModule): Promise<CommissionSetting> {
  try {
    const { modeKey, valueKey } = settingKeys(module);
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: [modeKey, valueKey] } } });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const mode = map[modeKey] === "FIXED" ? "FIXED" : map[modeKey] === "PERCENTAGE" ? "PERCENTAGE" : MODULE_DEFAULTS[module].mode;
    const value = map[valueKey] !== undefined ? parseFloat(map[valueKey]) : MODULE_DEFAULTS[module].value;
    return { mode, value: isNaN(value) ? MODULE_DEFAULTS[module].value : value };
  } catch {
    return MODULE_DEFAULTS[module];
  }
}

export async function getAllCommissionSettings(): Promise<Record<CommissionModule, CommissionSetting>> {
  const entries = await Promise.all(
    COMMISSION_MODULES.map(async ({ module }) => [module, await getCommissionSetting(module)] as const)
  );
  return Object.fromEntries(entries) as Record<CommissionModule, CommissionSetting>;
}

export async function saveCommissionSetting(module: CommissionModule, mode: CommissionMode, value: number): Promise<void> {
  const { modeKey, valueKey } = settingKeys(module);
  await prisma.$transaction([
    prisma.siteSetting.upsert({ where: { key: modeKey }, create: { key: modeKey, value: mode }, update: { value: mode } }),
    prisma.siteSetting.upsert({ where: { key: valueKey }, create: { key: valueKey, value: String(value) }, update: { value: String(value) } }),
  ]);
}

export async function creditCommission(
  tx: TxClient,
  { referredById, amount, description, module }: { referredById: string | null; amount: number; description: string; module: CommissionModule }
): Promise<void> {
  if (!referredById) return;

  const setting = await getCommissionSetting(module);
  const commissionAmount =
    setting.mode === "FIXED" ? Math.round(setting.value * 100) / 100 : Math.round(amount * (setting.value / 100) * 100) / 100;
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

// Reads the buyer's own persistent referrer, set once at signup/login via
// attachReferralIfNeeded() below — purchases no longer take a manual referral
// code, they just inherit whoever referred the buyer's account.
export async function getReferredByAgentId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { referredByAgentId: true } });
  return user?.referredByAgentId ?? null;
}

// Called right after a successful signup or login. If this user doesn't
// already have a referrer (first-referrer-wins, permanent), and a valid
// referral code is present (from the `sp_ref` cookie set by an agent's
// referral link — see middleware.ts), permanently links them to that agent.
// A user can never refer themselves, and a stale/invalid code is silently
// ignored rather than blocking sign-in.
export async function attachReferralIfNeeded(userId: string, refCode: string | undefined | null): Promise<void> {
  const trimmed = refCode?.trim();
  if (!trimmed) return;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { referredByAgentId: true } });
  if (!user || user.referredByAgentId) return;

  const agent = await prisma.user.findUnique({
    where: { referralCode: trimmed.toUpperCase() },
    select: { id: true, isAgent: true },
  });
  if (!agent || !agent.isAgent || agent.id === userId) return;

  await prisma.user.update({ where: { id: userId }, data: { referredByAgentId: agent.id } });
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
