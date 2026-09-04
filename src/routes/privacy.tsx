import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Lock, Eye } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/data/company";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/25 selection:text-primary">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            <ShieldCheck className="size-3.5" />
            <span>{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-gradient mb-3">
            {isAr ? "سياسة حماية البيانات وخصوصية المستخدم" : "ENTEC Privacy & Data Protection Policy"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Effective Date: January 1, 2026 • Last Reviewed: August 2026
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-border/70 space-y-6 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-foreground mb-2">
              1. Overview
            </h2>
            <p>
              ENTEC ("we", "our", or "us"), operated at {COMPANY.address}, is committed to transparent and secure telecommunications data intelligence. This Privacy Policy details how information is handled when using our public lookup engines and API services.
            </p>
          </div>

          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-foreground mb-2">
              2. Client-Side Lookup Privacy
            </h2>
            <p>
              Queries entered into the ENTEC Instant Lookup or Bulk Cleanser are processed locally within your browser session whenever possible. We do not store, log, sell, or monetize the specific customer telephone numbers or contact lists you process through our client-side utilities.
            </p>
          </div>

          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-foreground mb-2">
              3. Telemetry & Analytics
            </h2>
            <p>
              We collect aggregated, anonymized telemetry (e.g. area code frequency, regional traffic load, and interface interaction metrics) to optimize server capacity and update numbering cache layers.
            </p>
          </div>

          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-foreground mb-2">
              4. Contact Information
            </h2>
            <p>
              For privacy-related inquiries or data requests, reach us directly at {COMPANY.email} or by mail at {COMPANY.address}.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
