"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "../../generated/prisma/enums";
import { generateReferralCode } from "@/lib/commission";
import bcrypt from "bcryptjs";
import { z } from "zod";

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

// ── Create user (admin-initiated, skips OTP — admin vouches for the account) ──

const createUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string(),
});

export async function createUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdminSession();

  const parse = createUserSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parse.success) return { error: parse.error.issues[0].message };

  const { fullName, email, phone, password, role } = parse.data;
  const validRoles = Object.values(Role);
  if (!validRoles.includes(role as Role)) return { error: "Invalid role." };

  // Only allow creating accounts with a role strictly below the actor's own —
  // same rule as editing an existing user — so this form can't be used to
  // instantly create a peer or superior account.
  if (!canManage(session.role, role)) {
    return { error: "You don't have permission to create a user with that role." };
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { error: "A user with this email already exists." };

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        role: role as Role,
        isVerified: true,
        isActive: true,
      },
    });
    await tx.wallet.create({ data: { userId: user.id } });
  });

  revalidatePath("/", "layout");
  return { success: `Account created for ${fullName}. Share the password with them directly.` };
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
  revalidatePath("/", "layout");
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
  revalidatePath("/", "layout");
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
  revalidatePath("/", "layout");
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
  const validRoles = Object.values(Role);
  if (!validRoles.includes(newRole as Role)) return { error: "Invalid role." };

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

  await prisma.user.update({ where: { id: userId }, data: { role: newRole as Role } });
  revalidatePath("/", "layout");
  return { success: `Role changed to ${newRole.replace("_", " ")}.` };
}

// ── Toggle agent status (referral commission) ────────────────────────────────

export async function toggleAgentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdminSession();
  const userId = formData.get("userId") as string;
  const currentlyAgent = formData.get("isAgent") === "true";

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, fullName: true, referralCode: true },
  });
  if (!target) return { error: "User not found." };
  if (!canManage(session.role, target.role))
    return { error: "You don't have permission to manage this user." };

  if (!currentlyAgent) {
    const referralCode = target.referralCode ?? (await generateReferralCode(target.fullName));
    await prisma.user.update({ where: { id: userId }, data: { isAgent: true, referralCode } });
    revalidatePath("/", "layout");
    return { success: `${target.fullName} is now an agent — code ${referralCode}.` };
  }

  await prisma.user.update({ where: { id: userId }, data: { isAgent: false } });
  revalidatePath("/", "layout");
  return { success: "Agent status removed." };
}
