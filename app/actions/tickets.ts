"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

type ActionState = { error?: string; success?: boolean; message?: string } | null;

const bookingSchema = z.object({
  listingId: z.string().min(1),
  passengers: z.coerce.number().int().min(1).max(10),
  referralCode: z.string().optional(),
  notes: z.string().optional(),
});

export async function bookTicketAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const parse = bookingSchema.safeParse({
    listingId: formData.get("listingId"),
    passengers: formData.get("passengers"),
    referralCode: formData.get("referralCode") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { listingId, passengers, referralCode, notes } = parse.data;

  const listing = await prisma.airTicketListing.findUnique({
    where: { id: listingId, status: "PUBLISHED" },
    select: { id: true, price: true, seats: true, airline: true, destination: true },
  });

  if (!listing) return { error: "This listing is no longer available." };
  if (listing.seats < passengers) return { error: `Only ${listing.seats} seats available.` };

  const totalPrice = Number(listing.price) * passengers;

  await prisma.ticketBookingRequest.create({
    data: {
      userId: session.userId,
      listingId,
      passengers,
      totalPrice,
      referralCode: referralCode ?? null,
      notes: notes ?? null,
      status: "PENDING",
    },
  });

  return {
    success: true,
    message: `Booking request for ${passengers} passenger${passengers > 1 ? "s" : ""} submitted. We'll contact you to confirm.`,
  };
}
