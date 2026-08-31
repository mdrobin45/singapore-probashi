"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

const topicSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(150),
  category: z.string().min(2, "Select a category"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

export async function createTopicAction(
  _prev: { error?: string; success?: boolean; topicId?: string } | null,
  formData: FormData
) {
  const session = await requireUser();

  const parse = topicSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    content: formData.get("content"),
  });

  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }

  const topic = await prisma.forumTopic.create({
    data: {
      userId: session.userId,
      title: parse.data.title,
      category: parse.data.category,
      content: parse.data.content,
    },
  });

  revalidatePath("/forum");
  redirect(`/forum/${topic.id}`);
}

const replySchema = z.object({
  topicId: z.string().min(1),
  content: z.string().min(2, "Reply cannot be empty"),
});

export async function createReplyAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const session = await requireUser();

  const parse = replySchema.safeParse({
    topicId: formData.get("topicId"),
    content: formData.get("content"),
  });

  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }

  await prisma.forumReply.create({
    data: {
      userId: session.userId,
      topicId: parse.data.topicId,
      content: parse.data.content,
    },
  });

  revalidatePath(`/forum/${parse.data.topicId}`);
  revalidatePath("/forum");
  return { success: true };
}
