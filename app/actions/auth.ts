"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { generateOTP, sendOTPEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

type ActionState = { error?: string; success?: boolean } | null;

// ─── Register ────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  nidNumber: z.string().min(10, "NID must be at least 10 characters").max(20),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parse = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    nidNumber: formData.get("nidNumber"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }

  const { fullName, nidNumber, email, phone, password } = parse.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { nidNumber }] },
    select: { email: true, nidNumber: true },
  });

  if (existing?.email === email) return { error: "Email is already registered." };
  if (existing?.nidNumber === nidNumber) return { error: "NID number is already registered." };

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { fullName, nidNumber, email, phone, passwordHash },
  });

  await prisma.wallet.create({ data: { userId: user.id } });

  const otp = generateOTP();
  await prisma.otpToken.create({
    data: {
      userId: user.id,
      email,
      token: otp,
      type: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  try {
    await sendOTPEmail(email, otp, "verification");
  } catch (err) {
    console.error("[OTP] Failed to send verification email:", err);
    return { error: "Account created but failed to send OTP email. Please use Resend OTP on the next page." };
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
    // For password reset — validate the OTP then redirect to reset page
    const record = await prisma.otpToken.findFirst({
      where: { email, token: otp, type: "FORGOT_PASSWORD", usedAt: null },
    });
    if (!record) return { error: "Invalid OTP. Please check and try again." };
    if (record.expiresAt < new Date()) return { error: "OTP expired. Request a new one." };
    // Don't mark as used here — resetPasswordAction does that
    redirect(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
  }

  // Email verification flow
  const record = await prisma.otpToken.findFirst({
    where: { email, token: otp, type: "EMAIL_VERIFICATION", usedAt: null },
    include: { user: true },
  });

  if (!record) return { error: "Invalid OTP. Please check and try again." };
  if (record.expiresAt < new Date()) return { error: "OTP expired. Request a new one." };

  await prisma.$transaction([
    prisma.otpToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: record.userId }, data: { isVerified: true } }),
  ]);

  await createSession({
    userId: record.userId,
    role: record.user.role,
    email: record.user.email,
    fullName: record.user.fullName,
  });

  redirect("/dashboard");
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export async function resendOtpAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const type = (formData.get("type") as string) === "FORGOT_PASSWORD"
    ? "FORGOT_PASSWORD" as const
    : "EMAIL_VERIFICATION" as const;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "No account found with this email." };

  const otp = generateOTP();
  await prisma.otpToken.create({
    data: {
      userId: user.id,
      email,
      token: otp,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  try {
    await sendOTPEmail(email, otp, type === "FORGOT_PASSWORD" ? "reset" : "verification");
  } catch (err) {
    console.error("[OTP] Failed to resend email:", err);
    return { error: "Failed to send OTP email. Please try again." };
  }

  return { success: true };
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nidNumber = (formData.get("nidNumber") as string)?.trim();
  const password = formData.get("password") as string;

  if (!nidNumber || !password) return { error: "Please fill all fields." };

  const user = await prisma.user.findUnique({
    where: { nidNumber },
    select: {
      id: true, email: true, role: true, fullName: true,
      passwordHash: true, isVerified: true, isActive: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Invalid NID number or password." };
  }

  if (!user.isActive) return { error: "Your account has been deactivated. Contact support." };

  if (!user.isVerified) {
    const otp = generateOTP();
    await prisma.otpToken.create({
      data: {
        userId: user.id,
        email: user.email,
        token: otp,
        type: "EMAIL_VERIFICATION",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    try {
      await sendOTPEmail(user.email, otp, "verification");
    } catch (err) {
      console.error("[OTP] Failed to send verification email on login:", err);
    }
    redirect(`/verify-otp?email=${encodeURIComponent(user.email)}`);
  }

  await createSession({ userId: user.id, role: user.role, email: user.email, fullName: user.fullName });

  redirect("/dashboard");
}

// ─── Forgot Password ─────────────────────────────────────────────────────────

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = (formData.get("email") as string)?.trim();
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

  // Always redirect to avoid email enumeration
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
