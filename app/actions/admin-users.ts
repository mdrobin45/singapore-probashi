"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionState = { error?: string; success?: string } | null;

const ROLE_RANK: Record<string, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

async function requireAdminSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) redirect("/dashboard");
  return session;
}

// Can the acting session manage the target role?
function canManage(actorRole: string, targetRole: string) {
  return ROLE_RANK[actorRole] > ROLE_RANK[targetRole];
}

// ── Delete user ───────────────────────────────────────────────────────────────

export async function deleteUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdminSession();
  const userId = formData.get("userId") as string;

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target) return { error: "User not found." };
  if (target.id === session.userId) return { error: "You cannot delete your own account." };
  if (!canManage(session.role, target.role))
    return { error: "You don't have permission to delete this user." };

  // Prevent deleting the last SUPER_ADMIN
  if (target.role === "SUPER_ADMIN") {
    const count = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
    if (count <= 1) return { error: "Cannot delete the last Super Admin." };
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  return { success: "User deleted." };
}

// ── Toggle active / ban ───────────────────────────────────────────────────────

export async function toggleUserActiveAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdminSession();
  const userId = formData.get("userId") as string;
  const currentlyActive = formData.get("isActive") === "true";

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target) return { error: "User not found." };
  if (target.id === session.userId) return { error: "You cannot ban your own account." };
  if (!canManage(session.role, target.role))
    return { error: "You don't have permission to manage this user." };

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !currentlyActive },
  });
  revalidatePath("/admin/users");
  return { success: currentlyActive ? "User banned." : "User activated." };
}

// ── Verify user manually ──────────────────────────────────────────────────────

export async function verifyUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdminSession();
  const userId = formData.get("userId") as string;

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isVerified: true },
  });
  if (!target) return { error: "User not found." };
  if (target.isVerified) return { error: "User is already verified." };
  if (!canManage(session.role, target.role))
    return { error: "You don't have permission to verify this user." };

  await prisma.user.update({ where: { id: userId }, data: { isVerified: true } });
  revalidatePath("/admin/users");
  return { success: "User verified." };
}

// ── Change role (SUPER_ADMIN only) ────────────────────────────────────────────

export async function changeUserRoleAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdminSession();

  if (session.role !== "SUPER_ADMIN")
    return { error: "Only Super Admins can change roles." };

  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as string;
  const validRoles = ["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"];
  if (!validRoles.includes(newRole)) return { error: "Invalid role." };

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target) return { error: "User not found." };
  if (target.id === session.userId) return { error: "You cannot change your own role." };

  // Prevent stripping last SUPER_ADMIN
  if (target.role === "SUPER_ADMIN" && newRole !== "SUPER_ADMIN") {
    const count = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
    if (count <= 1) return { error: "Cannot demote the last Super Admin." };
  }

  await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
  revalidatePath("/admin/users");
  return { success: `Role changed to ${newRole.replace("_", " ")}.` };
}
