import { createFileRoute } from "@tanstack/react-router";
import { FileText, Shield } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/data/company";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/25 selection:text-primary">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            <FileText className="size-3.5" />
            <span>{isAr ? "شروط الاستخدام" : "Terms of Service"}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-gradient mb-3">
            {isAr ? "شروط وأحكام استخدام منصة ENTEC" : "ENTEC Terms of Service & Data License"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Effective Date: January 1, 2026 • Last Reviewed: August 2026
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-border/70 space-y-6 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-foreground mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the ENTEC Phone Intelligence platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, you should discontinue using our services.
            </p>
          </div>

          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-foreground mb-2">
              2. Data Accuracy & Disclaimer
            </h2>
            <p>
              While ENTEC compiles and cross-references data from authoritative public regulatory sources (including NANPA, the FCC, and the CNA), numbering plans and carrier allocations evolve continuously. ENTEC provides all data "as is" without warranty of continuous completeness or uninterrupted availability.
            </p>
          </div>

          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-foreground mb-2">
              3. TCPA Compliance Responsibilities
            </h2>
            <p>
              The calling window indicators provided in ENTEC tools are informative guidance based on standard TCPA 8:00 AM – 9:00 PM local rules and courteous 9:00 AM – 8:00 PM guidelines. Users remain solely responsible for ensuring their telemarketing and outreach campaigns comply with specific state regulations (e.g. Florida, Oklahoma curfew statutes) and federal requirements.
            </p>
          </div>

          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-foreground mb-2">
              4. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of Pennsylvania and the United States of America.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
