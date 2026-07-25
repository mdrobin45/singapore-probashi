import { prisma } from "@/lib/prisma";
import { CreateBlogPostForm } from "./create-form";

async function getData() {
  const [posts, categories] = await Promise.all([
    prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { fullName: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { posts, categories };
}

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  ARCHIVED: "bg-amber-100 text-amber-700",
};

export default async function AdminBlogPage() {
  const { posts, categories } = await getData();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Blog Management</h1>
        <p className="text-sm text-muted-foreground">{posts.length} posts · {categories.length} categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Title</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Category</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Author</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {posts.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-foreground max-w-56 truncate">{p.title}</p>
                        <p className="text-xs font-mono text-muted-foreground">/blog/{p.slug}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{p.category?.name ?? "—"}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{p.author.fullName}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {p.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">No posts yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div><CreateBlogPostForm categories={categories} /></div>
      </div>
    </div>
  );
}
