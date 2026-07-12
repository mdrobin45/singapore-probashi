import { prisma } from "@/lib/prisma";
import { DuaForm, DuaDeleteButton } from "./dua-form";
import { ArticleForm, ArticleActions } from "./article-form";

async function getData() {
  const [articles, duas, surahCount] = await Promise.all([
    prisma.islamicArticle.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { fullName: true } } },
    }),
    prisma.dua.findMany({ orderBy: { category: "asc" } }),
    prisma.surah.count(),
  ]);
  return { articles, duas, surahCount };
}

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  ARCHIVED: "bg-amber-100 text-amber-700",
};

export default async function AdminIslamicPage() {
  const { articles, duas, surahCount } = await getData();

  const stats = [
    { label: "Quran Surahs", value: surahCount, color: "bg-green-500", note: "Seeded data" },
    { label: "Duas", value: duas.length, color: "bg-blue-500", note: `${new Set(duas.map((d) => d.category)).size} categories` },
    { label: "Articles", value: articles.length, color: "bg-purple-500", note: `${articles.filter((a) => a.status === "PUBLISHED").length} published` },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Islamic Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage duas and articles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center shrink-0`}>
              <span className="text-white text-sm font-bold">{s.value}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Duas */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Duas ({duas.length})</h2>
          <DuaForm />
        </div>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Source</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3" dir="rtl">Arabic</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {duas.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground max-w-52 truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-52 mt-0.5">{d.translation}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand">
                        {d.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{d.source ?? "—"}</td>
                    <td className="px-4 py-3.5 text-xs text-right max-w-40 truncate font-arabic" dir="rtl">
                      {d.arabic}
                    </td>
                    <td className="px-4 py-3.5">
                      <DuaDeleteButton id={d.id} />
                    </td>
                  </tr>
                ))}
                {duas.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No duas yet. Add one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Articles ({articles.length})</h2>
          <ArticleForm />
        </div>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Author</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map((a) => (
                  <tr key={a.id} className={`hover:bg-muted/30 transition-colors ${a.status === "DRAFT" ? "opacity-60" : ""}`}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground max-w-xs truncate">{a.title}</p>
                      {a.excerpt && <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{a.excerpt}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{a.author.fullName}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {a.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <ArticleActions id={a.id} status={a.status} />
                    </td>
                  </tr>
                ))}
                {articles.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No articles yet. Add one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
