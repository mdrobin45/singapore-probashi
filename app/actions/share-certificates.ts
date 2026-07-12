"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionState = { error?: string; success?: boolean; created?: number } | null;

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) redirect("/dashboard");
  return session;
}

// Admin saves a batch of individually-entered share numbers for a project
export async function createShareNumbersAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const projectId = formData.get("projectId") as string;
  const numbersRaw = formData.get("numbers") as string;

  if (!projectId || !numbersRaw) return { error: "No share numbers provided." };

  let numbers: number[];
  try {
    numbers = JSON.parse(numbersRaw);
    if (!Array.isArray(numbers) || numbers.length === 0) throw new Error();
  } catch {
    return { error: "Invalid data." };
  }

  // Dedup within submitted list
  const unique = [...new Set(numbers)];

  // Check conflicts with already-existing numbers
  const existing = await prisma.shareCertificate.findMany({
    where: { projectId, shareNumber: { in: unique } },
    select: { shareNumber: true },
  });

  if (existing.length > 0) {
    const conflicts = existing.map((c) => `#${String(c.shareNumber).padStart(4, "0")}`).join(", ");
    return { error: `Already exist: ${conflicts}` };
  }

  await prisma.shareCertificate.createMany({
    data: unique.map((n) => ({ projectId, shareNumber: n })),
  });

  revalidatePath(`/admin/shares/${projectId}`);
  return { success: true, created: unique.length };
}

// Admin deletes one unassigned share number
export async function deleteShareNumberAction(certificateId: string, projectId: string) {
  await requireAdmin();

  const cert = await prisma.shareCertificate.findUnique({
    where: { id: certificateId },
    select: { ownerId: true },
  });

  if (!cert) return { error: "Not found." };
  if (cert.ownerId) return { error: "Cannot delete an assigned share number." };

  await prisma.shareCertificate.delete({ where: { id: certificateId } });
  revalidatePath(`/admin/shares/${projectId}`);
  return { success: true };
}

// Admin deletes ALL unassigned share numbers for a project
export async function deleteAllUnassignedAction(projectId: string) {
  await requireAdmin();

  await prisma.shareCertificate.deleteMany({
    where: { projectId, ownerId: null },
  });

  revalidatePath(`/admin/shares/${projectId}`);
  return { success: true };
}
