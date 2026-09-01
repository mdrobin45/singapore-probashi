"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { COMMISSION_MODULES, saveCommissionSetting, saveShareAdminCutPercent, type CommissionMode } from "@/lib/commission";
import { saveShareSgdRate } from "@/lib/share-pricing";
import { saveAdminNotificationEmail } from "@/lib/notifications";

type State = { error?: string; success?: boolean } | null;

export async function saveCurrencySettingsAction(_prev: State, formData: FormData): Promise<State> {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return { error: "Unauthorized." };
  }

  const source = formData.get("source") as string;
  const rawRate = formData.get("manualRate") as string;
  const showBar = formData.get("showBar") === "on";

  if (!["internet", "manual"].includes(source)) {
    return { error: "Invalid source." };
  }

  if (source === "manual") {
    const rate = parseFloat(rawRate);
    if (isNaN(rate) || rate <= 0) {
      return { error: "Enter a valid positive rate." };
    }
  }

  const rate = parseFloat(rawRate) || 83.5;

  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: "currency_source" },
      create: { key: "currency_source", value: source },
      update: { value: source },
    }),
    prisma.siteSetting.upsert({
      where: { key: "currency_bdt_rate" },
      create: { key: "currency_bdt_rate", value: String(rate) },
      update: { value: String(rate) },
    }),
    prisma.siteSetting.upsert({
      where: { key: "currency_show_bar" },
      create: { key: "currency_show_bar", value: showBar ? "true" : "false" },
      update: { value: showBar ? "true" : "false" },
    }),
  ]);

  revalidatePath("/", "layout");
  revalidatePath("/currency");
  revalidatePath("/admin/settings");

  return { success: true };
}

// ── Commission rates (per module: taxi / air ticket / service / share) ────────

export async function saveCommissionSettingsAction(_prev: State, formData: FormData): Promise<State> {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return { error: "Unauthorized." };
  }

  const parsed: { module: (typeof COMMISSION_MODULES)[number]["module"]; mode: CommissionMode; value: number }[] = [];

  for (const { module, label } of COMMISSION_MODULES) {
    const key = module.toLowerCase();
    const mode = formData.get(`${key}_mode`) as string;
    const value = parseFloat(formData.get(`${key}_value`) as string);

    if (mode !== "PERCENTAGE" && mode !== "FIXED") {
      return { error: `Invalid commission mode for ${label}.` };
    }
    if (isNaN(value) || value < 0) {
      return { error: `Enter a valid ${label} commission value.` };
    }
    if (mode === "PERCENTAGE" && value > 100) {
      return { error: `${label} percentage can't exceed 100.` };
    }

    parsed.push({ module, mode, value });
  }

  await Promise.all(parsed.map((p) => saveCommissionSetting(p.module, p.mode, p.value)));

  revalidatePath("/admin/settings");
  return { success: true };
}

// ── Share purchase platform cut (informational — never paid out) ─────────────

export async function saveShareAdminCutAction(_prev: State, formData: FormData): Promise<State> {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return { error: "Unauthorized." };
  }

  const value = parseFloat(formData.get("percent") as string);
  if (isNaN(value) || value < 0 || value > 100) {
    return { error: "Enter a valid percentage between 0 and 100." };
  }

  await saveShareAdminCutPercent(value);

  revalidatePath("/admin/settings");
  revalidatePath("/admin/purchases");
  revalidatePath("/admin/shares");
  return { success: true };
}

// ── Admin notification email ──────────────────────────────────────────────────

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function saveAdminNotificationEmailAction(_prev: State, formData: FormData): Promise<State> {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return { error: "Unauthorized." };
  }

  const email = (formData.get("email") as string)?.trim();
  if (!email || !emailRegex.test(email)) {
    return { error: "Enter a valid email address." };
  }

  await saveAdminNotificationEmail(email);

  revalidatePath("/admin/settings");
  return { success: true };
}

// ── Share pricing rate (SGD → BDT, always admin-defined, never live) ──────────

export async function saveShareRateAction(_prev: State, formData: FormData): Promise<State> {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return { error: "Unauthorized." };
  }

  const rate = parseFloat(formData.get("rate") as string);
  if (isNaN(rate) || rate <= 0) {
    return { error: "Enter a valid positive rate." };
  }

  await saveShareSgdRate(rate);

  revalidatePath("/admin/settings");
  revalidatePath("/shares");
  revalidatePath("/");

  return { success: true };
}

// ── Bank rates ────────────────────────────────────────────────────────────────

async function authAdmin() {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    throw new Error("Unauthorized");
  }
}

export async function addBankRateAction(_prev: State, formData: FormData): Promise<State> {
  try { await authAdmin(); } catch { return { error: "Unauthorized." }; }

  const bankName = (formData.get("bankName") as string)?.trim();
  const rate = parseFloat(formData.get("rate") as string);

  if (!bankName) return { error: "Bank name is required." };
  if (isNaN(rate) || rate <= 0) return { error: "Enter a valid rate." };

  const count = await prisma.bankRate.count();
  await prisma.bankRate.create({
    data: { bankName, rate, sortOrder: count },
  });

  revalidatePath("/currency");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateBankRateAction(_prev: State, formData: FormData): Promise<State> {
  try { await authAdmin(); } catch { return { error: "Unauthorized." }; }

  const id = formData.get("id") as string;
  const bankName = (formData.get("bankName") as string)?.trim();
  const rate = parseFloat(formData.get("rate") as string);

  if (!bankName) return { error: "Bank name is required." };
  if (isNaN(rate) || rate <= 0) return { error: "Enter a valid rate." };

  await prisma.bankRate.update({ where: { id }, data: { bankName, rate } });

  revalidatePath("/currency");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function toggleBankRateAction(id: string, isActive: boolean): Promise<void> {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) return;

  await prisma.bankRate.update({ where: { id }, data: { isActive } });

  revalidatePath("/currency");
  revalidatePath("/admin/settings");
}

export async function deleteBankRateAction(id: string): Promise<void> {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) return;

  await prisma.bankRate.delete({ where: { id } });

  revalidatePath("/currency");
  revalidatePath("/admin/settings");
}

// ── Payment accounts (deposit receiving accounts shown to customers) ─────────

const PAYMENT_METHODS = ["BANK_TRANSFER", "BKASH", "NAGAD", "ROCKET", "GCASH", "PAYNOW"] as const;

function revalidatePaymentAccountPaths() {
  revalidatePath("/admin/settings");
  revalidatePath("/dashboard/deposit");
}

export async function addPaymentAccountAction(_prev: State, formData: FormData): Promise<State> {
  try { await authAdmin(); } catch { return { error: "Unauthorized." }; }

  const method = formData.get("method") as string;
  const label = (formData.get("label") as string)?.trim();
  const accountNumber = (formData.get("accountNumber") as string)?.trim();
  const accountName = (formData.get("accountName") as string)?.trim() || null;

  if (!PAYMENT_METHODS.includes(method as (typeof PAYMENT_METHODS)[number])) {
    return { error: "Select a valid payment method." };
  }
  if (!label) return { error: "Label is required." };
  if (!accountNumber) return { error: "Account number is required." };

  const count = await prisma.paymentAccount.count();
  await prisma.paymentAccount.create({
    data: { method: method as (typeof PAYMENT_METHODS)[number], label, accountNumber, accountName, sortOrder: count },
  });

  revalidatePaymentAccountPaths();
  return { success: true };
}

export async function updatePaymentAccountAction(_prev: State, formData: FormData): Promise<State> {
  try { await authAdmin(); } catch { return { error: "Unauthorized." }; }

  const id = formData.get("id") as string;
  const method = formData.get("method") as string;
  const label = (formData.get("label") as string)?.trim();
  const accountNumber = (formData.get("accountNumber") as string)?.trim();
  const accountName = (formData.get("accountName") as string)?.trim() || null;

  if (!PAYMENT_METHODS.includes(method as (typeof PAYMENT_METHODS)[number])) {
    return { error: "Select a valid payment method." };
  }
  if (!label) return { error: "Label is required." };
  if (!accountNumber) return { error: "Account number is required." };

  await prisma.paymentAccount.update({
    where: { id },
    data: { method: method as (typeof PAYMENT_METHODS)[number], label, accountNumber, accountName },
  });

  revalidatePaymentAccountPaths();
  return { success: true };
}

export async function togglePaymentAccountAction(id: string, isActive: boolean): Promise<void> {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) return;

  await prisma.paymentAccount.update({ where: { id }, data: { isActive } });

  revalidatePaymentAccountPaths();
}

export async function deletePaymentAccountAction(id: string): Promise<void> {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) return;

  await prisma.paymentAccount.delete({ where: { id } });

  revalidatePaymentAccountPaths();
}

export async function getAdSenseSettings(): Promise<{ enabled: boolean; clientId: string }> {
  try {
    const [enabledRow, clientRow] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "adsense_enabled" } }),
      prisma.siteSetting.findUnique({ where: { key: "adsense_client_id" } }),
    ]);
    return {
      enabled: enabledRow?.value === "true",
      clientId: clientRow?.value || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "",
    };
  } catch {
    return { enabled: false, clientId: "" };
  }
}

export async function saveAdSenseSettingsAction(_prev: State, formData: FormData): Promise<State> {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return { error: "Unauthorized." };
  }

  const enabled = formData.get("enabled") === "on";
  const clientId = (formData.get("clientId") as string)?.trim() || "";

  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: "adsense_enabled" },
      create: { key: "adsense_enabled", value: enabled ? "true" : "false" },
      update: { value: enabled ? "true" : "false" },
    }),
    prisma.siteSetting.upsert({
      where: { key: "adsense_client_id" },
      create: { key: "adsense_client_id", value: clientId },
      update: { value: clientId },
    }),
  ]);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function getReminderPriceSetting(): Promise<number> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "reminder_slot_price" } });
    const val = row ? parseFloat(row.value) : 100;
    return isNaN(val) || val < 0 ? 100 : val;
  } catch {
    return 100;
  }
}

export async function saveReminderSlotPriceAction(_prev: State, formData: FormData): Promise<State> {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return { error: "Unauthorized." };
  }

  const rawPrice = formData.get("slotPrice") as string;
  const price = parseFloat(rawPrice);
  if (isNaN(price) || price < 0) {
    return { error: "Please enter a valid price." };
  }

  await prisma.siteSetting.upsert({
    where: { key: "reminder_slot_price" },
    create: { key: "reminder_slot_price", value: String(price) },
    update: { value: String(price) },
  });

  revalidatePath("/reminders");
  revalidatePath("/admin/settings");
  return { success: true };
}
