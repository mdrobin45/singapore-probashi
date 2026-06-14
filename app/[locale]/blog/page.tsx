import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getPosts(category?: string) {
  return prisma.blog.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category: { slug: category } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { fullName: true } },
      category: { select: { name: true, slug: true } },
    },
  });
}

async function getCategories() {
  return prisma.blogCategory.findMany({ orderBy: { name: "asc" } });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [posts, categories] = await Promise.all([getPosts(category), getCategories()]);

  return (
    <div className="min-h-screen bg-muted">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand-50 px-3 py-1 rounded-full mb-3">
            Community Blog
          </span>
          <h1 className="text-3xl font-bold text-foreground">News & Articles</h1>
          <p className="text-muted-foreground mt-2">
            Community news, financial tips, Singapore life guides and more.
          </p>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              <Link
                href="/blog"
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  !category ? "bg-brand text-white border-brand" : "border-border text-muted-foreground hover:border-brand hover:text-brand"
                }`}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/blog?category=${c.slug}`}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    category === c.slug ? "bg-brand text-white border-brand" : "border-border text-muted-foreground hover:border-brand hover:text-brand"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-lg font-semibold text-foreground mb-2">No articles yet</p>
            <p className="text-muted-foreground text-sm">Check back soon — our community contributors are writing!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <article className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow group h-full flex flex-col">
                  {/* Placeholder image */}
                  <div className="h-44 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                    <svg className="w-12 h-12 text-brand/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    {post.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand mb-2">
                        {post.category.name}
                      </span>
                    )}
                    <h2 className="font-bold text-foreground group-hover:text-brand transition-colors leading-snug mb-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                      <span>{post.author.fullName}</span>
                      <span>{post.publishedAt?.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
