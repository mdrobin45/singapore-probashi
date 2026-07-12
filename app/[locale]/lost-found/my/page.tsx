import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import { PostOwnerActions } from "../post-actions";

async function getMyPosts(userId: string) {
  return prisma.lostFoundPost.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true, type: true, title: true, description: true,
      location: true, createdAt: true, status: true,
    },
  });
}

const TYPE_STYLES = {
  LOST: "bg-red-100 text-red-700",
  FOUND: "bg-green-100 text-green-700",
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  REMOVED: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  RESOLVED: "Resolved",
  REMOVED: "Removed",
};

export default async function MyLostFoundPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const posts = await getMyPosts(session.userId);

  const open = posts.filter((p) => p.status === "OPEN");
  const resolved = posts.filter((p) => p.status === "RESOLVED");
  const removed = posts.filter((p) => p.status === "REMOVED");

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <Link
                href="/lost-found"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Posts
              </Link>
              <h1 className="text-2xl font-bold text-foreground">My Lost & Found Posts</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {open.length} open · {resolved.length} resolved · {removed.length} removed
              </p>
            </div>
            <Link
              href="/lost-found/new"
              className="shrink-0 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
            >
              + Post New Item
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-semibold text-foreground mb-2">No posts yet</p>
            <p className="text-muted-foreground text-sm mb-6">
              Post a lost or found item to get help from the community.
            </p>
            <Link
              href="/lost-found/new"
              className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
            >
              Post an Item
            </Link>
          </div>
        ) : (
          <>
            {[
              { label: "Open Posts", items: open, dimmed: false },
              { label: "Resolved Posts", items: resolved, dimmed: true },
              { label: "Removed Posts", items: removed, dimmed: true },
            ].map(({ label, items, dimmed }) =>
              items.length === 0 ? null : (
                <section key={label}>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {label} ({items.length})
                  </h2>
                  <div className="space-y-3">
                    {items.map((post) => (
                      <div
                        key={post.id}
                        className={`bg-white rounded-2xl border border-border p-5 transition-shadow hover:shadow-sm ${dimmed ? "opacity-70" : ""}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${TYPE_STYLES[post.type]}`}>
                              {post.type}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{post.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{post.description}</p>
                              {post.location && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {post.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[post.status]}`}>
                              {STATUS_LABELS[post.status]}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {post.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                        {post.status === "OPEN" && (
                          <PostOwnerActions id={post.id} />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
