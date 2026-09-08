import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  User,
  Tag,
  X,
  Share2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useI18n } from "@/lib/i18n";
import { fetchPublishedArticles, type ArticleRecord } from "@/lib/collections";
import { isFirebaseConfigured } from "@/lib/firebase";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
});

const DEFAULT_POSTS: ArticleRecord[] = [
  {
    id: "default-1",
    title: "Understanding the 2026 NANP Relief Plans & 10-Digit Dialing Mandates",
    slug: "understanding-nanp-relief-plans",
    excerpt:
      "With mobile subscriber growth and IoT device activations surging, state utility commissions across North America are introducing geographic overlays at record rates.",
    date: "2026-08-28",
    author: "Marcus Vance",
    tags: ["Regulatory", "Overlays"],
    status: "published",
    content: `
      <p>With mobile subscriber growth and IoT device activations surging, state utility commissions across North America are introducing geographic overlays at record rates.</p>
      <p>When an area code approaches exhaust, the North American Numbering Plan Administrator (NANPA) files a relief plan with the state regulator. There are two classic remedies: a geographic split, which carves the region in half and reassigns half the subscribers to a new NPA, and an overlay, which layers a second NPA on top of the same geography.</p>
      <p>Overlays preserve existing numbers but require mandatory 10-digit dialing for all calls. Because two different subscribers in the same neighborhood can hold the same 7-digit line number under different NPAs, the switch can no longer resolve a 7-digit dial string unambiguously.</p>
    `,
  },
  {
    id: "default-2",
    title: "How Wangiri Scammers Exploit Caribbean Area Codes (+1-876, +1-473)",
    slug: "wangiri-caribbean-scams",
    excerpt:
      "An in-depth technical analysis of one-ring international premium rate fraud, the legal loopholes exploited in the Caribbean numbering plan, and automated carrier blocking strategies.",
    date: "2026-08-15",
    author: "Dr. Elena Rostova",
    tags: ["Fraud", "Security"],
    status: "published",
    content: `
      <p>Wangiri — Japanese for 'one ring and cut' — relies on a structural quirk of the North American Numbering Plan: several Caribbean nations share the +1 country code while charging international premium rates.</p>
      <p>A caller sees a missed call from 473 (Grenada) or 876 (Jamaica) and assumes it is a domestic number. Returning the call routes internationally, and the fraudster's terminating carrier shares premium revenue with them for every minute you stay on hold.</p>
      <p>The defense is procedural: never return a missed call from an unfamiliar +1 Caribbean NPA, and ask your carrier to block international dialing on lines that never need it.</p>
    `,
  },
  {
    id: "default-3",
    title: "The Call Center’s Definitive Guide to TCPA Calling Windows & Timezones",
    slug: "tcpa-calling-windows-guide",
    excerpt:
      "Navigating FCC 47 U.S.C. § 227 curfew regulations: how misinterpreting recipient local timezones can trigger six-figure civil penalties.",
    date: "2026-07-30",
    author: "Marcus Vance",
    tags: ["Compliance", "TCPA"],
    status: "published",
    content: `
      <p>The Telephone Consumer Protection Act restricts telemarketing calls to between 8:00 AM and 9:00 PM at the called party's location. Many state statutes are stricter, and some prohibit Sunday calling entirely.</p>
      <p>Determining 'the called party's location' with a mobile number is genuinely hard. Number portability means an NPA-NXX assignment is evidence of original assignment geography, not current residence.</p>
      <p>Prudent operations teams treat the NPA-derived timezone as a first-pass filter and layer consent-time zip codes on top.</p>
    `,
  },
];

function BlogPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [selectedArticle, setSelectedArticle] = useState<ArticleRecord | null>(null);

  const { data: articles, isLoading } = useQuery({
    queryKey: ["publishedArticles"],
    queryFn: fetchPublishedArticles,
    enabled: isFirebaseConfigured,
  });

  const displayArticles = (articles && articles.length > 0) ? articles : DEFAULT_POSTS;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/25 selection:text-primary">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            <BookOpen className="size-3.5" />
            <span>{isAr ? "مدونة وأبحاث ENTEC" : "ENTEC Telecom Research & Blog"}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-gradient mb-3">
            {isAr ? "أحدث التحليلات في شبكات الترقيم والامتثال" : "Latest Telecommunications Insights & Reports"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isAr
              ? "مقالات تقنية وأبحاث دورية حول تشريعات الاتصالات، ومكافحة الاحتيال، واستراتيجيات الترقيم."
              : "Technical analyses and operational advisories on NANP updates, robocall mitigation, and telecommunications architecture."}
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">
              {isAr ? "جاري تحميل المقالات من قاعدة البيانات..." : "Loading articles from database..."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayArticles.map((post) => (
              <article
                key={post.id || post.slug}
                className="group glass-panel p-6 sm:p-8 rounded-3xl border border-border/70 hover:border-primary/40 hover-lift flex flex-col sm:flex-row items-start justify-between gap-6 transition-all"
              >
                {post.coverImage && (
                  <div className="w-full sm:w-48 h-36 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-slate-900">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.tags && post.tags.length > 0 ? (
                      post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/20"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary">
                        Research
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {post.author && (
                        <span className="flex items-center gap-1">
                          <User className="size-3 text-primary" />
                          {post.author}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3 text-primary" />
                        {post.date}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedArticle(post)}
                      className="inline-flex items-center gap-1 text-primary font-semibold hover:underline cursor-pointer"
                    >
                      <span>{isAr ? "قراءة المقال كاملاً" : "Read Full Article"}</span>
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Full Article Reading Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-primary/30 p-6 sm:p-10 shadow-2xl text-foreground">
            <button
              onClick={() => setSelectedArticle(null)}
              className="sticky top-0 float-right p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors z-10 cursor-pointer"
              title="Close"
            >
              <X className="size-5" />
            </button>

            {selectedArticle.coverImage && (
              <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-white/10 mb-6 bg-slate-950">
                <img
                  src={selectedArticle.coverImage}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                {selectedArticle.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {selectedArticle.title}
              </h1>

              <div className="flex items-center gap-4 text-xs text-slate-400 pb-4 border-b border-white/10">
                {selectedArticle.author && (
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <User className="size-3.5 text-primary" />
                    {selectedArticle.author}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  {selectedArticle.date}
                </span>
              </div>
            </div>

            {/* Render TipTap HTML Content */}
            <div
              className="prose prose-invert prose-cyan max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
