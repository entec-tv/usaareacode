import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
});

const POSTS = [
  {
    title: "Understanding the 2026 NANP Relief Plans & 10-Digit Dialing Mandates",
    excerpt: "With mobile subscriber growth and IoT device activations surging, state utility commissions across North America are introducing geographic overlays at record rates.",
    date: "Aug 28, 2026",
    readTime: "5 min read",
    tag: "Regulatory",
  },
  {
    title: "How Wangiri Scammers Exploit Caribbean Area Codes (+1-876, +1-473)",
    excerpt: "An in-depth technical analysis of one-ring international premium rate fraud, the legal loopholes exploited in the Caribbean numbering plan, and automated carrier blocking strategies.",
    date: "Aug 15, 2026",
    readTime: "7 min read",
    tag: "Fraud Prevention",
  },
  {
    title: "The Call Center’s Definitive Guide to TCPA Calling Windows & Timezones",
    excerpt: "Navigating FCC 47 U.S.C. § 227 curfew regulations: how misinterpreting recipient local timezones can trigger six-figure civil penalties.",
    date: "Jul 30, 2026",
    readTime: "6 min read",
    tag: "Compliance",
  },
];

function BlogPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

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

        <div className="space-y-6">
          {POSTS.map((post, i) => (
            <div
              key={i}
              className="glass-panel p-6 sm:p-8 rounded-2xl border border-border/70 hover-lift flex flex-col sm:flex-row items-start justify-between gap-6"
            >
              <div className="space-y-2.5 flex-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary">
                  {post.tag}
                </span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                  {post.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3 text-primary" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3 text-primary" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
