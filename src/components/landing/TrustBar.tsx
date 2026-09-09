import React from "react";
import { ShieldCheck, Database, Award, CheckCircle2, Lock } from "lucide-react";

interface TrustBarProps {
  isAr?: boolean;
}

export const TrustBar: React.FC<TrustBarProps> = ({ isAr = false }) => {
  const authorities = [
    { name: "NANPA", desc: "North American Numbering Plan", status: "Official Registry" },
    { name: "FCC", desc: "Federal Communications Commission", status: "CFR 47 § 64.1200" },
    { name: "CRTC", desc: "Canadian Telecom Commission", status: "Canada Rules" },
    { name: "TCPA", desc: "Telephone Consumer Protection Act", status: "Safe Harbor Active" },
    { name: "LERG", desc: "Local Exchange Routing Guide", status: "Telcordia / iconectiv" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4">
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-border/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                {isAr ? "مصادر البيانات الرسمية وهيئات تنظيم الاتصالات" : "Authoritative Telecom Authorities & Data Sources"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {isAr
                  ? "تتم مزامنة قواعد البيانات دورياً مع السجلات الفيدرالية الرسمية لضمان الدقة القانونية."
                  : "All prefixes and rate centers synchronized with authoritative federal numbering registries."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isAr ? "السجل محدّث لشهر سبتمبر 2026" : "Registry Verified • Sep 2026 Sync"}</span>
          </div>
        </div>

        {/* Regulatory Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-4">
          {authorities.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white/80 dark:bg-card/70 border border-slate-200/90 dark:border-white/10 hover:border-primary/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-mono text-primary">{item.name}</span>
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">{item.desc}</div>
              </div>
              <div className="mt-2 text-[10px] font-mono text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/10 text-center font-medium">
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default TrustBar;
