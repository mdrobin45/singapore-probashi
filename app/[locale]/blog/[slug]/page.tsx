import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.blog.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { fullName: true } },
      category: { select: { name: true, slug: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/blog" className="hover:text-brand transition-colors">Blog</Link>
          <span>/</span>
          {post.category && (
            <>
              <Link href={`/blog?category=${post.category.slug}`} className="hover:text-brand transition-colors">
                {post.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground truncate max-w-48">{post.title}</span>
        </div>

        <article className="bg-white rounded-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-border">
            {post.category && (
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand mb-3">
                {post.category.name}
              </span>
            )}
            <h1 className="text-3xl font-bold text-foreground leading-tight mb-4">{post.title}</h1>
            {post.excerpt && (
              <p className="text-muted-foreground text-lg leading-relaxed">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-4 mt-5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center">
                  <span className="text-xs font-bold text-brand">{post.author.fullName.charAt(0)}</span>
                </div>
                <span>{post.author.fullName}</span>
              </div>
              {post.publishedAt && (
                <span>
                  {post.publishedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
              {post.content.split("\n").map((paragraph, i) =>
                paragraph.trim() ? (
                  <p key={i} className="mb-4">{paragraph}</p>
                ) : (
                  <br key={i} />
                )
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
                {post.tags.map(({ tag }) => (
                  <span key={tag.id} className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>

        <div className="mt-6 text-center">
          <Link href="/blog" className="text-sm text-brand font-medium hover:underline">
            ← Back to all articles
          </Link>
        </div>
      </div>
    </div>
  );
}
