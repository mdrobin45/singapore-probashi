"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { generateOTP, sendOTPEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

type ActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
} | null;

// ─── Register ────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Sign-up only collects email/phone/password — the account gets a placeholder
// name derived from the email until the user sets their real name in profile.
function placeholderName(email: string) {
  const local = email.split("@")[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parse = registerSchema.safeParse({
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parse.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parse.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { fieldErrors };
  }

  const { email, phone, password } = parse.data;
  const fullName = placeholderName(email);

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { error: "Email is already registered." };

  const passwordHash = await bcrypt.hash(password, 12);
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.pendingRegistration.upsert({
    where: { email },
    update: { fullName, phone, passwordHash, otp, expiresAt },
    create: { fullName, email, phone, passwordHash, otp, expiresAt },
  });

  try {
    await sendOTPEmail(email, otp, "verification");
  } catch (err) {
    console.error("[OTP] Failed to send verification email:", err);
    return { error: "Failed to send OTP email. Please try again." };
  }

  redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
}

// ─── Verify OTP ──────────────────────────────────────────────────────────────

export async function verifyOtpAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;
  const isForgot = formData.get("type") === "FORGOT_PASSWORD";

  if (!email || !otp) return { error: "Invalid request." };

  if (isForgot) {
    const record = await prisma.otpToken.findFirst({
      where: { email, token: otp, type: "FORGOT_PASSWORD", usedAt: null },
    });
    if (!record) return { error: "Invalid OTP. Please check and try again." };
    if (record.expiresAt < new Date()) return { error: "OTP expired. Request a new one." };
    redirect(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
  }

  // Email verification — create the real user only now
  const pending = await prisma.pendingRegistration.findUnique({ where: { email } });

  if (!pending || pending.otp !== otp) return { error: "Invalid OTP. Please check and try again." };
  if (pending.expiresAt < new Date()) return { error: "OTP expired. Request a new one." };

  const conflict = await prisma.user.findUnique({ where: { email } });
  if (conflict) {
    await prisma.pendingRegistration.delete({ where: { email } });
    return { error: "This email is already registered. Please log in." };
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        fullName: pending.fullName,
        email: pending.email,
        phone: pending.phone,
        passwordHash: pending.passwordHash,
        isVerified: true,
      },
    });
    await tx.wallet.create({ data: { userId: created.id } });
    await tx.pendingRegistration.delete({ where: { email } });
    return created;
  });

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    fullName: user.fullName,
  });

  redirect("/dashboard");
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export async function resendOtpAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const isForgot = (formData.get("type") as string) === "FORGOT_PASSWORD";

  if (isForgot) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "No account found with this email." };

    const otp = generateOTP();
    await prisma.otpToken.create({
      data: {
        userId: user.id,
        email,
        token: otp,
        type: "FORGOT_PASSWORD",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    try {
      await sendOTPEmail(email, otp, "reset");
    } catch (err) {
      console.error("[OTP] Failed to resend reset email:", err);
      return { error: "Failed to send OTP email. Please try again." };
    }
    return { success: true };
  }

  // Email verification resend
  const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
  if (!pending) return { error: "No pending registration found. Please register again." };

  const otp = generateOTP();
  await prisma.pendingRegistration.update({
    where: { email },
    data: { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  });

  try {
    await sendOTPEmail(email, otp, "verification");
  } catch (err) {
    console.error("[OTP] Failed to resend verification email:", err);
    return { error: "Failed to send OTP email. Please try again." };
  }

  return { success: true };
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const rememberMe = formData.get("rememberMe") === "on";

  if (!email || !password) return { error: "Please fill all fields." };

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true, email: true, role: true, fullName: true,
      passwordHash: true, isActive: true,
    },
  });

  if (!user) return { error: "Invalid email or password." };

  // Google-only account has no password
  if (!user.passwordHash) {
    return { error: "This account uses Google sign-in. Please use the Google button." };
  }

  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  if (!user.isActive) return { error: "Your account has been deactivated. Contact support." };

  await createSession(
    { userId: user.id, role: user.role, email: user.email, fullName: user.fullName },
    rememberMe
  );

  redirect("/dashboard");
}

// ─── Forgot Password ─────────────────────────────────────────────────────────

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Please enter your email." };

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (user) {
    const otp = generateOTP();
    await prisma.otpToken.create({
      data: {
        userId: user.id,
        email,
        token: otp,
        type: "FORGOT_PASSWORD",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    try {
      await sendOTPEmail(email, otp, "reset");
    } catch (err) {
      console.error("[OTP] Failed to send password reset email:", err);
    }
  }

  redirect(`/verify-otp?email=${encodeURIComponent(email)}&type=FORGOT_PASSWORD`);
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;
  const password = formData.get("password") as string;
  const confirm = formData.get("confirmPassword") as string;

  if (password !== confirm) return { error: "Passwords do not match." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const record = await prisma.otpToken.findFirst({
    where: { email, token: otp, type: "FORGOT_PASSWORD", usedAt: null },
  });

  if (!record) return { error: "Invalid or expired OTP." };
  if (record.expiresAt < new Date()) return { error: "OTP expired. Request a new one." };

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.otpToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
  ]);

  redirect("/login?reset=1");
}
