import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  History,
  MapPin,
  TrendingUp,
  PhoneCall,
  Check,
  Copy,
  Info,
  Layers,
  Database,
} from "lucide-react";
import type { AreaCodeNarrative } from "../../types/narrative";

interface AreaCodeNarrativeSectionProps {
  narrative: AreaCodeNarrative | null;
  isLoading?: boolean;
  isAr?: boolean;
  onRefresh?: () => void;
}

export const AreaCodeNarrativeSection: React.FC<AreaCodeNarrativeSectionProps> = ({
  narrative,
  isLoading = false,
  isAr = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="my-8 rounded-2xl border border-primary/20 bg-card/60 p-6 sm:p-8 backdrop-blur-md animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 rounded-full bg-primary/30" />
          <div className="h-4 w-48 rounded bg-primary/20" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-muted/60" />
          <div className="h-4 w-5/6 rounded bg-muted/50" />
          <div className="h-4 w-4/6 rounded bg-muted/40" />
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-28 rounded-xl bg-muted/40" />
          <div className="h-28 rounded-xl bg-muted/40" />
        </div>
      </div>
    );
  }

  if (!narrative) {
    return null;
  }

  const copyFullDossier = () => {
    const text = `
ENTEC Official Telecom Guide: Area Code ${narrative.code}
Location: ${narrative.city}, ${narrative.region} (${narrative.state})
Timezone: ${narrative.timezone}

Summary:
${narrative.summary}

Telecom History:
${narrative.history}

Geographic Coverage:
${narrative.geographicCoverage}

Economic Profile:
${narrative.economicProfile}

Dialing & TCPA Rules:
${narrative.dialingRules}

Fast Facts:
${narrative.funFacts.map((f, i) => `${i + 1}. ${f}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className="my-8 w-full rounded-2xl border border-border/80 bg-gradient-to-b from-card/90 to-card/50 p-6 sm:p-8 shadow-sm backdrop-blur-md relative overflow-hidden transition-all"
      aria-labelledby="area-code-narrative-title"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
            <BookOpen className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                {isAr ? "دليل الاتصالات وتاريخ المنطقة" : "Regional Telecommunications & History Guide"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <Database className="size-2.5" />
                <span>{isAr ? "سجل معتمد" : "Verified Official Records"}</span>
              </span>
            </div>
            <h3
              id="area-code-narrative-title"
              className="text-lg sm:text-xl font-display font-bold text-foreground tracking-tight"
            >
              {isAr
                ? `الدليل الشامل لمفتاح المنطقة ${narrative.code} (${narrative.city})`
                : `Comprehensive Guide to Area Code ${narrative.code} (${narrative.city})`}
            </h3>
          </div>
        </div>

        <button
          onClick={copyFullDossier}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors cursor-pointer border border-border/50 shadow-xs"
          title={isAr ? "نسخ الدليل بالكامل" : "Copy full regional guide"}
        >
          {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          <span>{copied ? (isAr ? "تم النسخ!" : "Copied!") : isAr ? "نسخ الدليل" : "Copy Guide"}</span>
        </button>
      </div>

      {/* Executive Summary Card */}
      <div className="mt-5 rounded-xl bg-primary/5 border border-primary/10 p-4 sm:p-5 text-sm text-foreground/90 leading-relaxed">
        <p className="font-medium text-foreground">{narrative.summary}</p>
      </div>

      {/* 4-Grid Deep Dive Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Card 1: Telecom History */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 shadow-2xs hover:border-primary/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
              <History className="size-4" />
              <span>{isAr ? "تاريخ نشأة المفتاح الهاتفي" : "Telecom Origins & Heritage"}</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {narrative.history}
            </p>
          </div>
        </div>

        {/* Card 2: Geographic & Neighborhood Reach */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 shadow-2xs hover:border-primary/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
              <MapPin className="size-4" />
              <span>{isAr ? "التغطية الجغرافية والأحياء" : "Geographic & Municipal Reach"}</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {narrative.geographicCoverage}
            </p>
          </div>
        </div>

        {/* Card 3: Economic Profile */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 shadow-2xs hover:border-primary/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
              <TrendingUp className="size-4" />
              <span>{isAr ? "القيمة الاقتصادية وطلب الخطوط" : "Commercial & Calling Profile"}</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {narrative.economicProfile}
            </p>
          </div>
        </div>

        {/* Card 4: Dialing Rules & Compliance */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 shadow-2xs hover:border-primary/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
              <PhoneCall className="size-4" />
              <span>{isAr ? "قواعد الاتصال والتوافق القانوني" : "Dialing Rules & Regulatory Statutes"}</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {narrative.dialingRules}
            </p>
          </div>
        </div>
      </div>

      {/* Fast Facts / Highlights */}
      {narrative.funFacts && narrative.funFacts.length > 0 && (
        <div className="mt-6 pt-5 border-t border-border/60">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
            <Info className="size-3.5 text-primary" />
            <span>{isAr ? "حقائق هاتفية مميزة" : "Key Telecommunications Highlights"}</span>
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {narrative.funFacts.map((fact, idx) => (
              <li
                key={`fact-${idx}`}
                className="flex items-start gap-2 text-xs text-foreground/80 bg-muted/30 rounded-lg p-2.5 border border-border/40 leading-snug"
              >
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metadata footer */}
      <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <BookOpen className="size-3 text-muted-foreground/70" />
          <span>{isAr ? "سجل الترقيم الرسمي لشمال أمريكا (NANPA)" : "North American Numbering Plan Registry (NANPA)"}</span>
        </span>
        <span>{isAr ? "آخر تحديث:" : "Updated:"} {new Date(narrative.lastUpdated).toLocaleDateString()}</span>
      </div>
    </section>
  );
};

export default AreaCodeNarrativeSection;
