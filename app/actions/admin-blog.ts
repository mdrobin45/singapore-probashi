"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionState = { error?: string; success?: boolean } | null;

const postSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  categoryId: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(10),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export async function createBlogPostAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(session.role)) redirect("/dashboard");

  const parse = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content"),
    status: formData.get("status"),
  });

  if (!parse.success) return { error: parse.error.issues[0].message };

  const { title, slug, categoryId, excerpt, content, status } = parse.data;

  const existing = await prisma.blog.findUnique({ where: { slug } });
  if (existing) return { error: "A post with this slug already exists." };

  await prisma.blog.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt ?? null,
      categoryId: categoryId ?? null,
      authorId: session.userId,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}
