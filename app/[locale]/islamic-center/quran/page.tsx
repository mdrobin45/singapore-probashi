import { prisma } from "@/lib/prisma";
import Link from "next/link";

const SURAH_PLACEHOLDER = [
  { number: 1, arabicName: "الفاتحة", englishName: "Al-Fatihah", meaningName: "The Opening", totalVerses: 7, revelationType: "Meccan" },
  { number: 2, arabicName: "البقرة", englishName: "Al-Baqarah", meaningName: "The Cow", totalVerses: 286, revelationType: "Medinan" },
  { number: 3, arabicName: "آل عمران", englishName: "Ali 'Imran", meaningName: "Family of Imran", totalVerses: 200, revelationType: "Medinan" },
  { number: 36, arabicName: "يس", englishName: "Ya-Sin", meaningName: "Ya Sin", totalVerses: 83, revelationType: "Meccan" },
  { number: 55, arabicName: "الرحمن", englishName: "Ar-Rahman", meaningName: "The Beneficent", totalVerses: 78, revelationType: "Medinan" },
  { number: 56, arabicName: "الواقعة", englishName: "Al-Waqi'ah", meaningName: "The Event", totalVerses: 96, revelationType: "Meccan" },
  { number: 67, arabicName: "الملك", englishName: "Al-Mulk", meaningName: "The Sovereignty", totalVerses: 30, revelationType: "Meccan" },
  { number: 112, arabicName: "الإخلاص", englishName: "Al-Ikhlas", meaningName: "The Sincerity", totalVerses: 4, revelationType: "Meccan" },
  { number: 113, arabicName: "الفلق", englishName: "Al-Falaq", meaningName: "The Daybreak", totalVerses: 5, revelationType: "Meccan" },
  { number: 114, arabicName: "الناس", englishName: "An-Nas", meaningName: "Mankind", totalVerses: 6, revelationType: "Meccan" },
];

export default async function QuranPage() {
  const surahs = await prisma.surah.findMany({ orderBy: { number: "asc" } });
  const displayList = surahs.length > 0 ? surahs : SURAH_PLACEHOLDER;
  const isPlaceholder = surahs.length === 0;

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/islamic-center" className="hover:text-brand transition-colors">Islamic Center</Link>
            <span>/</span>
            <span className="text-foreground">Quran</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Al-Quran</h1>
              <p className="text-muted-foreground mt-1">
                {surahs.length > 0 ? `${surahs.length} surahs available` : "Browse selected surahs · Full library coming soon"}
              </p>
            </div>
            {isPlaceholder && (
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-3 py-1 rounded-full">
                Preview
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured: Al-Fatihah */}
        <div className="bg-gradient-to-br from-brand to-brand-dark rounded-2xl p-7 text-white mb-7 text-center">
          <p className="text-sm font-medium text-white/70 mb-2">Surah 1</p>
          <p className="text-4xl font-arabic mb-2" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
          <p className="text-sm text-white/70">Bismillāhir-raḥmānir-raḥīm</p>
          <p className="text-xs text-white/60 mt-1">In the name of Allah, the Most Gracious, the Most Merciful</p>
        </div>

        {/* Surah grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayList.map((surah) => (
            <div key={surah.number} className="bg-white rounded-xl border border-border p-4 hover:border-brand/30 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
                  <span className="text-xs font-bold text-brand">{surah.number}</span>
                </div>
                <p className="text-2xl font-arabic text-foreground" dir="rtl">{surah.arabicName}</p>
              </div>
              <p className="font-semibold text-foreground text-sm">{surah.englishName}</p>
              <p className="text-xs text-muted-foreground">{surah.meaningName}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{surah.totalVerses} verses</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  surah.revelationType === "Meccan"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-blue-50 text-blue-700"
                }`}>
                  {surah.revelationType}
                </span>
              </div>
            </div>
          ))}
        </div>

        {isPlaceholder && (
          <div className="mt-6 bg-white rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            More surahs will be added by admin. This is a preview of the structure.
          </div>
        )}
      </div>
    </div>
  );
}
