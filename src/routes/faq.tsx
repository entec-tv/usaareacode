import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle, ChevronDown, Loader2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useI18n } from "@/lib/i18n";
import { fetchFaqsFromDb, type FaqRecord } from "@/lib/collections";
import { isFirebaseConfigured } from "@/lib/firebase";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
});

const DEFAULT_FAQS: FaqRecord[] = [
  {
    id: "faq-1",
    question: "What is the difference between an area code overlay and a split?",
    answer:
      "In a geographic split, an existing area code’s boundary is divided, requiring half the territory to adopt a new 3-digit code. In an overlay, a new area code is introduced across the exact same geographic boundary as the existing code. All existing numbers remain unchanged, but 10-digit dialing becomes mandatory for all local calls.",
    order: 1,
  },
  {
    id: "faq-2",
    question: "What are the legal calling hours under the TCPA?",
    answer:
      "Under the Telephone Consumer Protection Act (47 U.S.C. § 227) and FCC rules (47 CFR § 64.1200), telemarketing and commercial outreach calls may only be made between 8:00 AM and 9:00 PM local time at the recipient's location. Some states enforce even stricter courtesy hours (such as 9:00 AM to 8:00 PM). ENTEC dynamically flags each NPA according to this standard.",
    order: 2,
  },
  {
    id: "faq-3",
    question: "Why do some Caribbean numbers look like US phone numbers?",
    answer:
      "Eighteen Caribbean island nations (including Jamaica with 876, Grenada with 473, and the Dominican Republic with 809/829/849) participate in the North American Numbering Plan (NANP). They use the country code +1 followed by a 3-digit area code, identical in appearance to domestic US and Canadian numbers, but are billed as high-tariff international calls.",
    order: 3,
  },
  {
    id: "faq-4",
    question: "How does the One-Ring (Wangiri) scam work?",
    answer:
      "Fraudulent autodialers place a call to a domestic number and disconnect after just one ring. The curious recipient sees a missed call from what looks like a familiar domestic area code and calls back. The call is connected to an expensive overseas premium toll service, resulting in massive charges on the consumer's phone bill.",
    order: 4,
  },
  {
    id: "faq-5",
    question: "How frequently is ENTEC's area code registry updated?",
    answer:
      "ENTEC syncs with NANPA monthly planning letters, CNA announcements, and FCC allocation updates to ensure all newly introduced overlays and boundary relief plans are reflected immediately.",
    order: 5,
  },
  {
    id: "faq-6",
    question: "Can I use ENTEC data for CRM and call center compliance?",
    answer:
      "Yes. ENTEC provides bulk cleansing tools, CSV/Excel exports, and programmatic lookups designed specifically for outbound contact centers, sales operations, and customer data platforms.",
    order: 6,
  },
];

function FaqPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["faqsList"],
    queryFn: fetchFaqsFromDb,
    enabled: isFirebaseConfigured,
  });

  const displayFaqs = (faqs && faqs.length > 0) ? faqs : DEFAULT_FAQS;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/25 selection:text-primary">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            <HelpCircle className="size-3.5" />
            <span>{isAr ? "الأسئلة الأكثر شيوعاً" : "Frequently Asked Questions"}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-gradient mb-3">
            {isAr ? "دليل إنتك للأسئلة الشائعة في الترقيم الهاتفي" : "ENTEC Telecommunications & NPA FAQ"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isAr
              ? "إجابات معتمدة ومدعومة بالتشريعات حول مفاتيح المناطق، قواعد TCPA، وفخاخ الاحتيال الهاتفي."
              : "Authoritative answers regarding NANP numbering plans, TCPA curfew laws, and toll fraud prevention."}
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">
              {isAr ? "جاري تحميل الأسئلة الشائعة..." : "Loading FAQs from database..."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayFaqs.map((faq, i) => (
              <div
                key={faq.id || i}
                className="glass-panel p-6 sm:p-7 rounded-2xl border border-border/70 hover:border-primary/30 transition-all hover-lift"
              >
                <h3 className="font-display text-base font-bold text-foreground mb-2.5 flex items-start gap-3">
                  <span className="text-primary font-mono text-xs px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 shrink-0">
                    Q{faq.order || i + 1}
                  </span>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-8">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
