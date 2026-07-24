"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { COMMISSION_MODULES, saveCommissionSetting, type CommissionMode } from "@/lib/commission";
import { saveShareSgdRate } from "@/lib/share-pricing";

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
