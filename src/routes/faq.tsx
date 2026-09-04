import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle, ChevronDown } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/data/company";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
});

const FAQS = [
  {
    q: "What is the difference between an area code overlay and a split?",
    a: "In a geographic split, an existing area code’s boundary is divided, requiring half the territory to adopt a new 3-digit code. In an overlay, a new area code is introduced across the exact same geographic boundary as the existing code. All existing numbers remain unchanged, but 10-digit dialing becomes mandatory for all local calls.",
  },
  {
    q: "What are the legal calling hours under the TCPA?",
    a: "Under the Telephone Consumer Protection Act (47 U.S.C. § 227) and FCC rules (47 CFR § 64.1200), telemarketing and commercial outreach calls may only be made between 8:00 AM and 9:00 PM local time at the recipient's location. Some states enforce even stricter courtesy hours (such as 9:00 AM to 8:00 PM). ENTEC dynamically flags each NPA according to this standard.",
  },
  {
    q: "Why do some Caribbean numbers look like US phone numbers?",
    a: "Eighteen Caribbean island nations (including Jamaica with 876, Grenada with 473, and the Dominican Republic with 809/829/849) participate in the North American Numbering Plan (NANP). They use the country code +1 followed by a 3-digit area code, identical in appearance to domestic US and Canadian numbers, but are billed as high-tariff international calls.",
  },
  {
    q: "How does the One-Ring (Wangiri) scam work?",
    a: "Fraudulent autodialers place a call to a domestic number and disconnect after just one ring. The curious recipient sees a missed call from what looks like a familiar domestic area code and calls back. The call is connected to an expensive overseas premium toll service, resulting in massive charges on the consumer's phone bill.",
  },
  {
    q: "How frequently is ENTEC's area code registry updated?",
    a: "ENTEC syncs with NANPA monthly planning letters, CNA announcements, and FCC allocation updates to ensure all newly introduced overlays and boundary relief plans are reflected immediately.",
  },
  {
    q: "Can I use ENTEC data for CRM and call center compliance?",
    a: "Yes. ENTEC provides bulk cleansing tools, CSV/Excel exports, and programmatic lookups designed specifically for outbound contact centers, sales operations, and customer data platforms.",
  },
];

function FaqPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

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

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-border/70">
              <h3 className="font-display text-base font-bold text-foreground mb-2 flex items-start gap-2.5">
                <span className="text-primary font-mono text-sm">Q{i + 1}.</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
