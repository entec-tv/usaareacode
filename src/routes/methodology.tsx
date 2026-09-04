import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Database, FileCheck, Layers, Radio, ShieldCheck } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/data/company";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/methodology")({
  component: MethodologyPage,
});

function MethodologyPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/25 selection:text-primary">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            <FileCheck className="size-3.5" />
            <span>{isAr ? "منهجية البيانات والمصادر المعتمدة" : "Data Verification Methodology"}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-gradient mb-3">
            {isAr ? "كيف تجمع ENTEC بيانات الترقيم والاتصالات" : "How ENTEC Sources & Validates Telecom Intelligence"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isAr
              ? "معايير تدقيق صارمة تتوافق مع التحديثات الدورية لإدارة خطة الترقيم في أمريكا الشمالية (NANPA) وهيئة الاتصالات الفيدرالية (FCC)."
              : "Rigorous sourcing and algorithmic validation pipelines aligned directly with NANPA monthly releases and FCC Wireline Competition Bureau orders."}
          </p>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-border/70">
            <div className="flex items-center gap-3 mb-3">
              <Database className="size-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">
                1. NANPA & CNA Direct Numbering Feeds
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every area code in the North American Numbering Plan is cataloged directly from monthly administrative bulletins published by NANPA (Somos, Inc.) and the Canadian Numbering Administrator (CNA). Exhaustion forecasts, geographic overlays, and boundary adjustments are ingested without manual intervention.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border/70">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="size-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">
                2. TCPA Compliance & Legal Calling Windows
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Under 47 U.S.C. § 227 (Telephone Consumer Protection Act) and 47 CFR § 64.1200, telemarketing communications may only be placed between 8:00 AM and 9:00 PM in the recipient’s local timezone. ENTEC’s real-time engine maps every NPA to its exact IANA timezone representation and evaluates Daylight Saving Time (EDT/EST, CDT/CST, MDT/MST, PDT/PST) down to the millisecond.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border/70">
            <div className="flex items-center gap-3 mb-3">
              <Radio className="size-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">
                3. Caribbean Toll-Fraud & Wangiri Heuristics
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Eighteen specific Caribbean island nations share the North American country code (+1) but operate outside US federal rate caps. Scammers intentionally disconnect incoming calls after a single ring, enticing US consumers to dial back premium-rate lines billed at upwards of $30 per minute. ENTEC actively flags these NPAs (such as 876, 473, 284, and 809) with prominent consumer advisories.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border/70">
            <div className="flex items-center gap-3 mb-3">
              <Layers className="size-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">
                4. Operating Company Numbers (OCN) & Facility Carriers
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Carrier attribution reflects dominant facility-based wireline and wireless allocations registered with the FCC and local public utility commissions (e.g. AT&T Mobility, Verizon New England, T-Mobile USA, Comcast Phone LLC).
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
