import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function getData() {
  const [articles, pdfs, duas, surahCount] = await Promise.all([
    prisma.islamicArticle.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { fullName: true } } },
    }),
    prisma.pdfDocument.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { fullName: true } } },
    }),
    prisma.dua.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.surah.count(),
  ]);
  return { articles, pdfs, duas, surahCount };
}

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  ARCHIVED: "bg-amber-100 text-amber-700",
};

export default async function AdminIslamicPage() {
  const { articles, pdfs, duas, surahCount } = await getData();

  const stats = [
    { label: "Quran Surahs", value: surahCount, color: "bg-green-500", note: "Seeded data" },
    { label: "Duas", value: duas.length, color: "bg-blue-500", note: `${duas.length} entries` },
    { label: "Articles", value: articles.length, color: "bg-purple-500", note: `${articles.filter((a) => a.status === "PUBLISHED").length} published` },
    { label: "PDFs", value: pdfs.length, color: "bg-amber-500", note: `${pdfs.filter((p) => p.status === "PUBLISHED").length} published` },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Islamic Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage articles, PDFs, and duas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Articles */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Islamic Articles</h2>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Author</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground max-w-xs truncate">{a.title}</p>
                      {a.excerpt && <p className="text-xs text-muted-foreground truncate max-w-xs">{a.excerpt}</p>}
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
                  </tr>
                ))}
                {articles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-muted-foreground text-sm">No articles yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PDFs */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">PDF Documents</h2>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Author</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pdfs.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground max-w-xs truncate">{p.title}</p>
                      {p.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{p.category}</td>
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
                {pdfs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No PDFs yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Duas */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Duas</h2>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Source</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Arabic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {duas.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground max-w-xs">
                      <p className="truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{d.translation}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{d.category}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{d.source ?? "—"}</td>
                    <td className="px-4 py-3.5 text-xs text-right font-arabic leading-relaxed max-w-48 truncate" dir="rtl">
                      {d.arabic}
                    </td>
                  </tr>
                ))}
                {duas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-muted-foreground text-sm">No duas yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
