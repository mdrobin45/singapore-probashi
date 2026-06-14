import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const PLACEHOLDER_ARTICLES = [
  {
    id: "p1",
    title: "The Importance of Salah in a Muslim's Life",
    excerpt: "Prayer is the second pillar of Islam and a direct connection between the believer and Allah. This article explores how to maintain regular prayers while working abroad.",
    createdAt: new Date("2025-12-01"),
    author: { fullName: "Admin" },
    status: "PUBLISHED",
  },
  {
    id: "p2",
    title: "Ramadan in Singapore: A Guide for Bangladeshi Muslims",
    excerpt: "Fasting hours, Taraweeh mosques near Little India, halal iftar options in Singapore — everything you need for a spiritual Ramadan while away from home.",
    createdAt: new Date("2025-11-15"),
    author: { fullName: "Admin" },
    status: "PUBLISHED",
  },
  {
    id: "p3",
    title: "Friday Prayer (Jumu'ah) Mosques Near Your Workplace",
    excerpt: "A directory of mosques across Singapore's major business and industrial districts for workers to attend Friday prayers conveniently.",
    createdAt: new Date("2025-10-20"),
    author: { fullName: "Admin" },
    status: "PUBLISHED",
  },
  {
    id: "p4",
    title: "Halal Certification in Singapore: What You Need to Know",
    excerpt: "Understanding Singapore's MUIS halal certification system so you can make informed food choices at supermarkets, hawker centres, and restaurants.",
    createdAt: new Date("2025-09-05"),
    author: { fullName: "Admin" },
    status: "PUBLISHED",
  },
];

export default async function IslamicArticlesPage() {
  const [articles, t] = await Promise.all([
    prisma.islamicArticle.findMany({
      where: { status: "PUBLISHED" },
      include: { author: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getTranslations("islamicCenter"),
  ]);

  const displayList = articles.length > 0 ? articles : PLACEHOLDER_ARTICLES;
  const isPlaceholder = articles.length === 0;

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/islamic-center" className="hover:text-brand transition-colors">{t("badge")}</Link>
            <span>/</span>
            <span className="text-foreground">{t("articles")}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("articlesPageTitle")}</h1>
              <p className="text-muted-foreground mt-1">
                {t("articlesPageSubtitle")}
              </p>
            </div>
            {isPlaceholder && (
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-3 py-1 rounded-full">
                {t("preview")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-5">
          {displayList.map((article) => (
            <div key={article.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="font-bold text-foreground text-lg mb-2 leading-snug">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {article.author?.fullName ?? "Admin"}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(article.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-semibold text-brand bg-brand-50 border border-brand/20 px-3 py-1 rounded-full">
                  {t("articleBadge")}
                </span>
              </div>
            </div>
          ))}
        </div>

        {isPlaceholder && (
          <div className="mt-6 bg-white rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {t("articlesPlaceholderNote")}
          </div>
        )}
      </div>
    </div>
  );
}
