import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [surahCount, duaCount, articleCount, pdfCount] = await Promise.all([
    prisma.surah.count(),
    prisma.dua.count(),
    prisma.islamicArticle.count({ where: { status: "PUBLISHED" } }),
    prisma.pdfDocument.count({ where: { status: "PUBLISHED" } }),
  ]);
  const recentDuas = await prisma.dua.findMany({ orderBy: { createdAt: "desc" }, take: 3 });
  const recentArticles = await prisma.islamicArticle.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { author: { select: { fullName: true } } },
  });
  const recentPdfs = await prisma.pdfDocument.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { author: { select: { fullName: true } } },
  });
  return { surahCount, duaCount, articleCount, pdfCount, recentDuas, recentArticles, recentPdfs };
}

const SECTIONS = [
  {
    key: "quran",
    title: "Holy Quran",
    desc: "Read all 114 Surahs with Arabic text, transliteration and Bengali/English translation.",
    icon: "📖",
    color: "from-green-50 to-green-100",
    iconBg: "bg-green-500",
    href: "/islamic-center/quran",
  },
  {
    key: "duas",
    title: "Daily Duas",
    desc: "Collection of authentic duas for morning, evening, meals, travel and daily situations.",
    icon: "🤲",
    color: "from-blue-50 to-blue-100",
    iconBg: "bg-blue-500",
    href: "/islamic-center/duas",
  },
  {
    key: "articles",
    title: "Islamic Articles",
    desc: "Scholarly articles, Islamic guidance, halal tips and community resources.",
    icon: "📝",
    color: "from-purple-50 to-purple-100",
    iconBg: "bg-brand",
    href: "/islamic-center/articles",
  },
  {
    key: "pdfs",
    title: "PDF Library",
    desc: "Downloadable Islamic books, prayer schedules, halal food guides and more.",
    icon: "📄",
    color: "from-amber-50 to-amber-100",
    iconBg: "bg-amber-500",
    href: "/islamic-center/pdfs",
  },
];

export default async function IslamicCenterPage() {
  const stats = await getStats();

  const counts: Record<string, number> = {
    quran: stats.surahCount,
    duas: stats.duaCount,
    articles: stats.articleCount,
    pdfs: stats.pdfCount,
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand-50 px-3 py-1 rounded-full mb-3">
            Islamic Center
          </span>
          <h1 className="text-3xl font-bold text-foreground">Islamic Knowledge Center</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Your spiritual companion in Singapore. Access the Quran, daily duas, Islamic articles, and downloadable resources — all in one place.
          </p>

          {/* Prayer time note */}
          <div className="mt-5 inline-flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
            <span className="text-lg">🕌</span>
            <div>
              <p className="text-xs font-semibold text-green-800">Prayer Times — Singapore (UTC+8)</p>
              <p className="text-xs text-green-700">Visit <strong>muis.gov.sg</strong> for official daily prayer times</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Section cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SECTIONS.map((s) => (
            <Link key={s.key} href={s.href}>
              <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow group h-full flex flex-col">
                <div className={`bg-gradient-to-br ${s.color} px-5 pt-6 pb-5`}>
                  <div className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
                    <span className="text-xl">{s.icon}</span>
                  </div>
                  <h3 className="font-bold text-foreground group-hover:text-brand transition-colors">{s.title}</h3>
                </div>
                <div className="px-5 py-4 flex-1">
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  <p className="text-xs font-semibold text-brand mt-3">
                    {counts[s.key] > 0 ? `${counts[s.key]} available →` : "Coming soon →"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Duas */}
        {stats.recentDuas.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Featured Duas</h2>
              <Link href="/islamic-center/duas" className="text-xs text-brand font-medium hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-border">
              {stats.recentDuas.map((dua) => (
                <div key={dua.id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{dua.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand-50 px-2 py-0.5 rounded-full shrink-0">
                      {dua.category}
                    </span>
                  </div>
                  <p className="text-lg text-right font-arabic text-foreground leading-loose mb-2">{dua.arabic}</p>
                  {dua.transliteration && (
                    <p className="text-sm text-muted-foreground italic mb-1">{dua.transliteration}</p>
                  )}
                  <p className="text-sm text-foreground">{dua.translation}</p>
                  {dua.source && (
                    <p className="text-xs text-muted-foreground mt-1">Source: {dua.source}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Articles */}
        {stats.recentArticles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Recent Articles</h2>
              <Link href="/islamic-center/articles" className="text-xs text-brand font-medium hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.recentArticles.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-border p-5">
                  <h3 className="font-semibold text-foreground mb-2 leading-snug">{a.title}</h3>
                  {a.excerpt && <p className="text-xs text-muted-foreground line-clamp-3">{a.excerpt}</p>}
                  <p className="text-xs text-muted-foreground mt-3">by {a.author.fullName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Library */}
        {stats.recentPdfs.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">PDF Library</h2>
              <Link href="/islamic-center/pdfs" className="text-xs text-brand font-medium hover:underline">Browse all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {stats.recentPdfs.map((pdf) => (
                <div key={pdf.id} className="px-6 py-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{pdf.title}</p>
                    <p className="text-xs text-muted-foreground">{pdf.category}</p>
                    <a href={pdf.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-brand hover:underline mt-1 inline-block">
                      Download PDF →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state if nothing seeded */}
        {stats.surahCount === 0 && stats.duaCount === 0 && stats.articleCount === 0 && stats.pdfCount === 0 && (
          <div className="bg-white rounded-2xl border border-border px-8 py-12 text-center">
            <div className="text-5xl mb-4">🕌</div>
            <p className="font-semibold text-foreground mb-2">Content coming soon</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Our admins are uploading Quran surahs, duas, articles and PDFs.
              Check back soon — this section will be fully populated shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
