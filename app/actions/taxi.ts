"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

type ActionState = { error?: string; success?: boolean; message?: string } | null;

const taxiSchema = z.object({
  pickupLocation: z.string().min(3, "Enter pickup location"),
  destination: z.string().min(3, "Enter destination"),
  date: z.string().min(1, "Select a date"),
  passengerCount: z.coerce.number().int().min(1).max(10),
  vehicleType: z.string().min(1, "Select vehicle type"),
  notes: z.string().optional(),
});

export async function requestTaxiAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const parse = taxiSchema.safeParse({
    pickupLocation: formData.get("pickupLocation"),
    destination: formData.get("destination"),
    date: formData.get("date"),
    passengerCount: formData.get("passengerCount"),
    vehicleType: formData.get("vehicleType"),
    notes: formData.get("notes") || undefined,
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { pickupLocation, destination, date, passengerCount, vehicleType, notes } = parse.data;

  await prisma.taxiRequest.create({
    data: {
      userId: session.userId,
      pickupLocation,
      destination,
      date: new Date(date),
      passengerCount,
      vehicleType,
      notes: notes ?? null,
    },
  });

  return { success: true, message: "Taxi request submitted! We'll contact you within 1 hour to confirm." };
}
