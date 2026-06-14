"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type ActionState = { error?: string; success?: boolean } | null;

const postSchema = z.object({
  type: z.enum(["LOST", "FOUND"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Please add more details"),
  location: z.string().optional(),
});

export async function createLostFoundPostAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const parse = postSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location") || undefined,
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { type, title, description, location } = parse.data;

  await prisma.lostFoundPost.create({
    data: {
      userId: session.userId,
      type,
      title,
      description,
      location: location ?? null,
      images: [],
    },
  });

  revalidatePath("/lost-found");
  redirect("/lost-found");
}
