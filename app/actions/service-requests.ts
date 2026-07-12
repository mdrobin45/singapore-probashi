"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

type State = { error?: string; success?: boolean } | null;

const schema = z.object({
  serviceId: z.string().min(1),
  fullName:  z.string().min(2, "Name must be at least 2 characters"),
  phone:     z.string().min(6, "Enter a valid phone number"),
  email:     z.string().email("Enter a valid email"),
});

// Public — no login required
export async function submitServiceRequestAction(_prev: State, formData: FormData): Promise<State> {
  const parse = schema.safeParse({
    serviceId: formData.get("serviceId"),
    fullName:  formData.get("fullName"),
    phone:     formData.get("phone"),
    email:     formData.get("email"),
  });
  if (!parse.success) return { error: parse.error.issues[0].message };

  const { serviceId, fullName, phone, email } = parse.data;

  const service = await prisma.applyService.findUnique({
    where: { id: serviceId, isActive: true },
    select: { id: true },
  });
  if (!service) return { error: "Service not found or unavailable." };

  const passportUrl   = (formData.get("passportUrl")   as string) || null;
  const nidUrl        = (formData.get("nidUrl")        as string) || null;
  const photoUrl      = (formData.get("photoUrl")      as string) || null;
  const workPermitUrl = (formData.get("workPermitUrl") as string) || null;
  const otherUrl      = (formData.get("otherUrl")      as string) || null;

  await prisma.serviceRequest.create({
    data: { serviceId, fullName, phone, email, passportUrl, nidUrl, photoUrl, workPermitUrl, otherUrl },
  });

  revalidatePath("/admin/apply");
  return { success: true };
}

// Admin — update status
export async function updateServiceRequestStatusAction(
  id: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED",
  adminNote?: string
) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(session.role)) redirect("/dashboard");

  await prisma.serviceRequest.update({
    where: { id },
    data: { status, adminNote: adminNote || null },
  });

  revalidatePath("/admin/apply");
}
