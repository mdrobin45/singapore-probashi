import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const PLACEHOLDER_DUAS = [
  {
    id: "p1",
    category: "Morning",
    title: "Morning Remembrance (Subah Ki Dua)",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
    transliteration: "Aṣbaḥnā wa aṣbaḥal-mulku lillāh, wal-ḥamdu lillāh",
    translation: "We have reached the morning and the whole sovereignty belongs to Allah. All praises are for Allah.",
    source: "Muslim",
  },
  {
    id: "p2",
    category: "Morning",
    title: "Dua upon waking",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alḥamdulillāhil-ladhī aḥyānā ba'da mā amātanā wa ilayhin-nushūr",
    translation: "All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.",
    source: "Bukhari",
  },
  {
    id: "p3",
    category: "Evening",
    title: "Evening Remembrance (Shaam Ki Dua)",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
    transliteration: "Amsaynā wa amsal-mulku lillāh, wal-ḥamdu lillāh",
    translation: "We have reached the evening and the whole sovereignty belongs to Allah. All praises are for Allah.",
    source: "Muslim",
  },
  {
    id: "p4",
    category: "Travel",
    title: "Dua for Travel (Safar Ki Dua)",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
    transliteration: "Subḥānal-ladhī sakhkhara lanā hādhā wa mā kunnā lahū muqrinīn",
    translation: "Glory be to the One Who has subjected this to us, and we were not able to do it ourselves.",
    source: "Abu Dawud",
  },
  {
    id: "p5",
    category: "Protection",
    title: "Dua for Protection (Hifazat Ki Dua)",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ",
    transliteration: "Bismillāhil-ladhī lā yaḍurru ma'asmihi shay'un fil-arḍi wa lā fis-samā'",
    translation: "In the name of Allah, with Whose name nothing can cause harm on earth or in heaven.",
    source: "Tirmidhi",
  },
  {
    id: "p6",
    category: "Food",
    title: "Dua before eating (Khana Khane Ki Dua)",
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Allāhumma bārik lanā fīmā razaqtanā wa qinā 'adhāban-nār",
    translation: "O Allah, bless us in what You have provided for us and protect us from the punishment of Fire.",
    source: "Ibn As-Sunni",
  },
];

export default async function DuasPage() {
  const [duas, t] = await Promise.all([
    prisma.dua.findMany({ orderBy: { createdAt: "asc" } }),
    getTranslations("islamicCenter"),
  ]);
  const displayList = duas.length > 0 ? duas : PLACEHOLDER_DUAS;
  const isPlaceholder = duas.length === 0;

  const categories = [...new Set(displayList.map((d) => d.category))];

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/islamic-center" className="hover:text-brand transition-colors">{t("badge")}</Link>
            <span>/</span>
            <span className="text-foreground">{t("duas")}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("duasPageTitle")}</h1>
              <p className="text-muted-foreground mt-1">
                {duas.length > 0
                  ? t("duasCount", { count: duas.length, categories: categories.length })
                  : t("duasHint")}
              </p>
            </div>
            {isPlaceholder && (
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-3 py-1 rounded-full">
                {t("preview")}
              </span>
            )}
          </div>

          {/* Category filter chips */}
          <div className="flex flex-wrap gap-2 mt-5">
            {categories.map((cat) => (
              <span key={cat} className="text-xs font-semibold bg-brand-50 text-brand px-3 py-1 rounded-full border border-brand/20">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {categories.map((cat) => (
          <div key={cat}>
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-brand inline-block" />
              {t("duasCategoryHeading", { category: cat })}
            </h2>
            <div className="space-y-4">
              {displayList.filter((d) => d.category === cat).map((dua) => (
                <div key={dua.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm">{dua.title}</h3>
                    {dua.source && (
                      <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded">{dua.source}</span>
                    )}
                  </div>
                  <div className="px-6 py-5 space-y-4">
                    <p className="text-2xl leading-loose text-right text-foreground font-arabic" dir="rtl">
                      {dua.arabic}
                    </p>
                    {dua.transliteration && (
                      <p className="text-sm text-brand italic">{dua.transliteration}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{dua.translation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
