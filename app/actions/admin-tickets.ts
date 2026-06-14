"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionState = { error?: string; success?: boolean } | null;

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) redirect("/dashboard");
  return session;
}

const listingSchema = z.object({
  airline: z.string().min(2),
  origin: z.string().min(2),
  destination: z.string().min(2),
  departDate: z.string().min(1),
  returnDate: z.string().optional(),
  price: z.coerce.number().min(1),
  seats: z.coerce.number().int().min(1),
});

export async function createTicketListingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parse = listingSchema.safeParse({
    airline: formData.get("airline"),
    origin: formData.get("origin"),
    destination: formData.get("destination"),
    departDate: formData.get("departDate"),
    returnDate: formData.get("returnDate") || undefined,
    price: formData.get("price"),
    seats: formData.get("seats"),
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { airline, origin, destination, departDate, returnDate, price, seats } = parse.data;

  await prisma.airTicketListing.create({
    data: {
      airline,
      origin,
      destination,
      departDate: new Date(departDate),
      returnDate: returnDate ? new Date(returnDate) : null,
      price,
      seats,
      status: "PUBLISHED",
    },
  });

  revalidatePath("/admin/tickets");
  return { success: true };
}
