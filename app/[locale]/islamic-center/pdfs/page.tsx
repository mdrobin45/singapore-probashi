import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const PLACEHOLDER_PDFS = [
  {
    id: "p1",
    title: "Complete Salah Guide with Bengali Translation",
    description: "Step-by-step guide to performing all 5 daily prayers with Arabic text, transliteration, and Bengali translation.",
    category: "Prayer",
    fileUrl: "#",
    createdAt: new Date("2025-11-01"),
  },
  {
    id: "p2",
    title: "Ramadan Dua Booklet",
    description: "Essential duas for Ramadan including Taraweeh, Sehri, Iftar, and Laylatul Qadr supplications.",
    category: "Ramadan",
    fileUrl: "#",
    createdAt: new Date("2025-10-15"),
  },
  {
    id: "p3",
    title: "Surah Yaseen with Bengali Tafsir",
    description: "Complete Surah Yaseen with word-for-word Bengali meaning and brief tafsir notes.",
    category: "Quran",
    fileUrl: "#",
    createdAt: new Date("2025-09-20"),
  },
  {
    id: "p4",
    title: "Singapore Halal Mosque Directory 2025",
    description: "List of all MUIS-registered mosques in Singapore with addresses, prayer times, and contact information.",
    category: "Directory",
    fileUrl: "#",
    createdAt: new Date("2025-08-01"),
  },
  {
    id: "p5",
    title: "Hajj & Umrah Guide for Bangladeshis in Singapore",
    description: "Complete guide to applying for Hajj/Umrah from Singapore, including visa requirements and package information.",
    category: "Hajj & Umrah",
    fileUrl: "#",
    createdAt: new Date("2025-07-10"),
  },
  {
    id: "p6",
    title: "40 Hadith Nawawi — Bengali Translation",
    description: "The famous collection of 40 hadiths compiled by Imam Nawawi with accurate Bengali translations.",
    category: "Hadith",
    fileUrl: "#",
    createdAt: new Date("2025-06-05"),
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Prayer: "bg-blue-50 text-blue-700",
  Ramadan: "bg-amber-50 text-amber-700",
  Quran: "bg-green-50 text-green-700",
  Directory: "bg-purple-50 text-purple-700",
  "Hajj & Umrah": "bg-rose-50 text-rose-700",
  Hadith: "bg-teal-50 text-teal-700",
};

export default async function PdfsPage() {
  const [pdfs, t] = await Promise.all([
    prisma.pdfDocument.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
    }),
    getTranslations("islamicCenter"),
  ]);

  const displayList = pdfs.length > 0 ? pdfs : PLACEHOLDER_PDFS;
  const isPlaceholder = pdfs.length === 0;
  const categories = [...new Set(displayList.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/islamic-center" className="hover:text-brand transition-colors">{t("badge")}</Link>
            <span>/</span>
            <span className="text-foreground">{t("pdfLibrary")}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("pdfLibrary")}</h1>
              <p className="text-muted-foreground mt-1">
                {t("pdfsPageSubtitle")}
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {categories.map((cat) => (
          <div key={cat}>
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-brand inline-block" />
              {cat}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayList.filter((p) => p.category === cat).map((pdf) => (
                <div key={pdf.id} className="bg-white rounded-xl border border-border p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
                  {/* PDF icon */}
                  <div className="w-12 h-14 rounded-lg bg-red-50 border border-red-100 flex flex-col items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-red-500 mb-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM9 13H7v-1h2v1zm4 0h-3v-1h3v1zm2-3H7V9h8v1zm0-3H7V6h8v1z" />
                    </svg>
                    <span className="text-[9px] font-bold text-red-500">PDF</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm leading-snug">{pdf.title}</h3>
                    </div>
                    {pdf.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{pdf.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[pdf.category] ?? "bg-muted text-muted-foreground"}`}>
                        {pdf.category}
                      </span>
                      {pdf.fileUrl !== "#" ? (
                        <a
                          href={pdf.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {t("download")}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t("comingSoon")}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {isPlaceholder && (
          <div className="bg-white rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {t("pdfsPlaceholderNote")}
          </div>
        )}
      </div>
    </div>
  );
}
