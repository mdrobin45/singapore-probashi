import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { PostOwnerActions } from "./post-actions";

async function getPosts(type?: string) {
  return prisma.lostFoundPost.findMany({
    where: {
      status: "OPEN",
      ...(type === "LOST" || type === "FOUND" ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, type: true, title: true, description: true,
      location: true, createdAt: true, userId: true,
      user: { select: { fullName: true, phone: true } },
    },
  });
}

const TYPE_STYLES = {
  LOST: "bg-red-100 text-red-700",
  FOUND: "bg-green-100 text-green-700",
};

export default async function LostFoundPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const [posts, session, t] = await Promise.all([
    getPosts(type),
    getSession(),
    getTranslations("lostFound"),
  ]);

  const filters = [
    { labelKey: "filterAll", value: undefined },
    { labelKey: "filterLost", value: "LOST" },
    { labelKey: "filterFound", value: "FOUND" },
  ] as const;

  return (
    <div className="min-h-screen bg-muted">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand-50 px-3 py-1 rounded-full mb-3">
                {t("badge")}
              </span>
              <h1 className="text-3xl font-bold text-foreground">{t("pageTitle")}</h1>
              <p className="text-muted-foreground mt-2">
                {t("pageSubtitle")}
              </p>
            </div>
            {session ? (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/lost-found/my"
                  className="bg-muted text-foreground text-sm font-semibold px-4 py-2.5 rounded-xl border border-border hover:bg-muted/80 transition-colors"
                >
                  My Posts
                </Link>
                <Link
                  href="/lost-found/new"
                  className="bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors"
                >
                  {t("postItem")}
                </Link>
              </div>
            ) : (
              <Link href="/login" className="shrink-0 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
                {t("loginToPost")}
              </Link>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mt-5">
            {filters.map((f) => (
              <Link
                key={f.labelKey}
                href={f.value ? `/lost-found?type=${f.value}` : "/lost-found"}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors ${
                  type === f.value || (!type && !f.value)
                    ? "bg-brand text-white border-brand"
                    : "border-border text-muted-foreground hover:border-brand hover:text-brand"
                }`}
              >
                {t(f.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold text-foreground mb-2">{t("noPosts")}</p>
            <p className="text-muted-foreground text-sm mb-5">{t("noPostsHint")}</p>
            {session && (
              <Link href="/lost-found/new" className="inline-block bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
                {t("postNow")}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${TYPE_STYLES[post.type]}`}>
                    {post.type === "LOST" ? t("lost") : t("found")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {post.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{post.description}</p>

                {post.location && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {post.location}
                  </div>
                )}

                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">{post.user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{post.user.phone}</p>
                  </div>
                  {post.userId !== session?.userId && (
                    <a
                      href={`tel:${post.user.phone}`}
                      className="text-xs bg-brand-50 text-brand font-semibold px-3 py-1.5 rounded-lg hover:bg-brand hover:text-white transition-colors"
                    >
                      {t("contact")}
                    </a>
                  )}
                </div>
                {post.userId === session?.userId && (
                  <PostOwnerActions id={post.id} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
