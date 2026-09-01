"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

type State = { error?: string; success?: boolean } | null;

export async function updateProfilePhotoAction(_prev: State, formData: FormData): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const photo = formData.get("photo") as string;
  if (!photo) return { error: "No photo provided." };

  // Basic validation — must be a data URL image
  if (!photo.startsWith("data:image/")) {
    return { error: "Invalid image format." };
  }

  // Rough size check: base64 string length * 0.75 ≈ bytes
  const approxBytes = photo.length * 0.75;
  if (approxBytes > 2 * 1024 * 1024) {
    return { error: "Image must be under 2 MB." };
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { profilePhoto: photo },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function updateProfileDetailsAction(_prev: State, formData: FormData): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const fullName = (formData.get("fullName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const nidNumber = (formData.get("nidNumber") as string)?.trim() || null;

  if (!fullName || fullName.length < 2) {
    return { error: "Full Name must be at least 2 characters." };
  }

  // Check if phone number is already taken by another user
  if (phone) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: session.userId },
      },
    });
    if (existingPhone) {
      return { error: "This phone number is already registered to another account." };
    }
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      fullName,
      phone,
      nidNumber,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/reminders");
  return { success: true };
}
