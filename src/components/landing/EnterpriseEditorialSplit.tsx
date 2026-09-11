import React, { useState } from "react";
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Zap,
  PhoneCall,
  Lock,
  Flame,
  Activity,
  Globe2,
} from "lucide-react";

interface EnterpriseEditorialSplitProps {
  onInspectCode: (code: string) => void;
  onNavigateToConverter: () => void;
  onNavigateToBulk: () => void;
  isAr: boolean;
}

const TIMEZONE_PRESETS = [
  { id: "ET", nameEn: "New York (Eastern)", nameAr: "نيويورك (الشرقي)", offsetHours: -4, code: "212" },
  { id: "CT", nameEn: "Chicago (Central)", nameAr: "شيكاغو (المركزي)", offsetHours: -5, code: "312" },
  { id: "MT", nameEn: "Denver (Mountain)", nameAr: "دنفر (الجبلي)", offsetHours: -6, code: "303" },
  { id: "PT", nameEn: "Los Angeles (Pacific)", nameAr: "لوس أنجلوس (الهادئ)", offsetHours: -7, code: "310" },
  { id: "HT", nameEn: "Honolulu (Hawaii)", nameAr: "هونولولو (هاواي)", offsetHours: -10, code: "808" },
];

const FRAUD_SAMPLES = [
  {
    code: "876",
    regionEn: "Jamaica",
    regionAr: "جامايكا (الكاريبي)",
    riskScore: 94,
    typeEn: "Offshore Wangiri Ring Trap",
    typeAr: "احتيال الرنة الواحدة +1 الدولي",
    rate: "$15–$30/min",
    warningEn: "Exploits +1 country code. Caller faces international premium tariffs upon callback.",
    warningAr: "يستغل المفتاح +1 لإيهام المستلم بأنه اتصال محلي، ثم يُفرض عليه سعر دولي باهظ.",
  },
  {
    code: "284",
    regionEn: "British Virgin Islands",
    regionAr: "جزر العذراء البريطانية",
    riskScore: 91,
    typeEn: "International Revenue Sharing (PRS)",
    typeAr: "مشاركة أرباح التعرفة المرتفعة",
    rate: "$12–$25/min",
    warningEn: "Commonly used in automated robocall ring-backs with simulated voice prompts.",
    warningAr: "مستخدم بكثرة في روبوتات الاتصال التلقائي مع رسائل صوتية وهمية لإطالة المكالمة.",
  },
  {
    code: "212",
    regionEn: "New York, NY",
    regionAr: "نيويورك (محلي موثق)",
    riskScore: 3,
    typeEn: "Tier-1 Domestic NANPA Rate Center",
    typeAr: "مقسم محلي معتمد من الدرجة الأولى",
    rate: "Standard Domestic",
    warningEn: "Verified domestic North American numbering plan assignment. Low risk profile.",
    warningAr: "كود محلي موثق رسمياً في السجل الفيدرالي. خالي من مخاطر التعرفة الإضافية.",
  },
  {
    code: "800",
    regionEn: "Toll-Free Service",
    regionAr: "رقم مجاني فيدرالي",
    riskScore: 0,
    typeEn: "Federal Toll-Free Inbound",
    typeAr: "خط مجاني رسمي متوافق",
    rate: "Free to Caller",
    warningEn: "NANPA official toll-free assignment. Full consumer regulatory protection.",
    warningAr: "مفتاح مجاني رسمي معتمد بالكامل من الهيئة الفيدرالية للاتصالات.",
  },
];

export const EnterpriseEditorialSplit: React.FC<EnterpriseEditorialSplitProps> = ({
  onInspectCode,
  onNavigateToConverter,
  onNavigateToBulk,
  isAr,
}) => {
  const [selectedTz, setSelectedTz] = useState<(typeof TIMEZONE_PRESETS)[number]>(TIMEZONE_PRESETS[0]!);
  const [expandedFraudCode, setExpandedFraudCode] = useState<string | null>(FRAUD_SAMPLES[0]!.code);

  // Calculate local time for selected timezone preset
  const nowUtc = new Date();
  const utcHours = nowUtc.getUTCHours() + nowUtc.getUTCMinutes() / 60;
  let localHour = (utcHours + selectedTz.offsetHours + 24) % 24;
  const isSafeWindow = localHour >= 8 && localHour < 21;
  const isCautionWindow = (localHour >= 7 && localHour < 8) || (localHour >= 20.5 && localHour < 21);

  const displayTime = () => {
    const wholeHours = Math.floor(localHour);
    const minutes = Math.floor((localHour - wholeHours) * 60);
    const period = wholeHours >= 12 ? "PM" : "AM";
    const h12 = wholeHours % 12 || 12;
    return `${h12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <section className="space-y-16 sm:space-y-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 mb-3 shadow-xs">
          <ShieldCheck className="size-3.5 text-blue-600 dark:text-blue-400" />
          <span>{isAr ? "منظومة إنتك المتقدمة لذكاء الاتصالات" : "Enterprise Telephony & Compliance Engine"}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-display font-black text-foreground tracking-tight leading-tight">
          {isAr ? (
            <>
              بُنيت للحماية من <span className="text-blue-700 dark:text-blue-400">الغرامات الفيدرالية</span> واحتيال الرنين الدولي
            </>
          ) : (
            <>
              Engineered to Defend Against <span className="text-blue-700 dark:text-blue-400">Statutory Penalties</span> & Toll Traps
            </>
          )}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {isAr
            ? "حلول مؤسسية متقدمة مصممة خصيصاً لمراكز الاتصال الدولية، أنظمة CRM، ومسؤولي الامتثال القانوني."
            : "Precision automation built for enterprise contact centers, B2B sales engines, and telephony compliance officers."}
        </p>
      </div>

      {/* =========================================================================
          EDITORIAL SPLIT A: TCPA COMPLIANCE & CALLING WINDOW ENGINE (REDESIGNED)
      ========================================================================= */}
      <div className="relative rounded-3xl border border-slate-200/90 dark:border-border/80 bg-gradient-to-br from-white via-slate-50/80 to-blue-50/20 dark:from-card dark:via-card/90 dark:to-card/50 p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-lg dark:shadow-black/40 overflow-hidden flex flex-col gap-8">
        <div className="pointer-events-none absolute -top-32 -right-32 size-96 bg-emerald-500/[0.07] blur-[100px] rounded-full" />

        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>47 CFR § 64.1200 • TCPA Safe Harbor</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground tracking-tight">
              {isAr
                ? "لا تتصل خارج النافذة القانونية. احمِ مؤسستك من غرامات $1,500."
                : "Never Dial Outside The Safe Window. Guaranteed."}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isAr
                ? "حساب التوقيت الآمن تلقائياً لتجنب الحظر الفيدرالي وغرامات الـ 1,500$."
                : "Automated TCPA safe-harbor calculations to prevent $1,500 fines per violation."}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
             <button onClick={onNavigateToConverter} className="btn-primary">
                <span>{isAr ? "محول المناطق الزمنية" : "Timezone Converter"}</span>
                <ArrowRight className="size-4" />
              </button>
          </div>
        </div>

        {/* Dashboard Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
          {/* Left: Live Clock & Status */}
          <div className="lg:col-span-4 rounded-2xl bg-slate-950/80 border border-slate-800 p-6 flex flex-col justify-between shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">{isAr ? "الوقت الفعلي" : "Live Local Time"}</span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                  <Globe2 className="size-3 text-cyan-400" />
                  {selectedTz.id} ({selectedTz.offsetHours > 0 ? "+" : ""}{selectedTz.offsetHours}h)
                </span>
              </div>
              <div className="font-mono text-4xl sm:text-5xl font-black text-white tracking-tight">
                {displayTime()}
              </div>
              
              <div className={`mt-4 p-3 rounded-xl border flex items-start gap-3 backdrop-blur-sm transition-colors ${
                  isSafeWindow 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                }`}>
                {isSafeWindow ? <ShieldCheck className="size-5 shrink-0 mt-0.5" /> : <ShieldAlert className="size-5 shrink-0 mt-0.5 animate-pulse" />}
                <div>
                  <div className="font-bold text-sm">{isSafeWindow ? (isAr ? "مسموح بالاتصال (Safe)" : "TCPA Approved (Safe)") : (isAr ? "وقت محظور (Blocked)" : "Curfew Active (Blocked)")}</div>
                  <div className="text-[10px] opacity-80 mt-1">{isSafeWindow ? (isAr ? "ضمن النافذة القانونية 8ص-9م" : "Within 8am-9pm legal window") : (isAr ? "خارج ساعات العمل المسموحة" : "Outside legal contact hours")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: 24hr Timeline & Controls */}
          <div className="lg:col-span-8 rounded-2xl bg-white/50 dark:bg-black/20 border border-slate-200/80 dark:border-white/5 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Activity className="size-4 text-blue-500" />
                  {isAr ? "تحليل النافذة الزمنية لـ 24 ساعة:" : "24-Hour Active Window Analysis:"}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap bg-white dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                  {TIMEZONE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedTz(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedTz.id === preset.id
                          ? "bg-foreground text-background shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      {preset.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Visual 24-Hour Strip */}
              <div className="space-y-2">
                <div className="relative h-10 w-full rounded-xl overflow-hidden flex border border-border/70 shadow-inner bg-slate-100 dark:bg-slate-900">
                  {/* Blocked Morning */}
                  <div className="h-full w-[33.33%] bg-gradient-to-b from-rose-500/10 to-rose-500/5 border-r border-rose-500/20 relative">
                  </div>
                  {/* Safe Calling Window */}
                  <div className="h-full w-[54.17%] bg-gradient-to-b from-emerald-500/20 to-emerald-500/10 border-r border-emerald-500/20 flex items-center justify-center relative">
                    <span className="text-[10px] sm:text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold tracking-widest bg-emerald-500/10 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm border border-emerald-500/20 shadow-sm truncate max-w-[90%]">
                      8 AM — 9 PM SAFE HARBOR
                    </span>
                  </div>
                  {/* Blocked Evening */}
                  <div className="h-full w-[12.5%] bg-gradient-to-b from-rose-500/10 to-rose-500/5 relative">
                  </div>

                  {/* Current Hour Indicator Needle */}
                  <div
                    className="absolute top-0 bottom-0 w-1.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-300 -translate-x-1/2 rounded-full z-10"
                    style={{ left: `${(localHour / 24) * 100}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                      {displayTime()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-1">
                  <span>12 AM</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold relative"><span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">|</span>8 AM</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold relative"><span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">|</span>9 PM</span>
                  <span>12 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          EDITORIAL SPLIT B: OFFSHORE TOLL FRAUD & WANGIRI INTERCEPTOR (REDESIGNED)
      ========================================================================= */}
      <div className="relative rounded-3xl border border-slate-200/90 dark:border-white/10 bg-gradient-to-br from-white via-slate-50/80 to-amber-50/20 dark:from-card dark:via-card/90 dark:to-card/50 p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/40 overflow-hidden flex flex-col gap-8">
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 bg-amber-500/[0.07] blur-[100px] rounded-full" />

        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              <Flame className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span>+1 Caribbean Fraud Shield • PRS Interception</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground tracking-tight">
              {isAr
                ? "كشف احتيال الرنة الواحدة ومصائد الفواتير قبل الاتصال."
                : "Detect Offshore Toll Traps Before Connecting."}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isAr
                ? "كشف فوري لفخاخ الأرقام الكاريبية لحماية ميزانيتك من فواتير الاحتيال الخفية. اضغط على أي كود لرؤية تفاصيل الخطر."
                : "Instant detection of offshore +1 toll traps to shield your campaigns from hidden tariffs. Expand cards below to inspect."}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
             <button onClick={onNavigateToBulk} className="btn-primary">
                <span>{isAr ? "تنظيف وفلترة الأرقام" : "Clean Lead Lists"}</span>
                <ArrowRight className="size-4" />
              </button>
          </div>
        </div>

        {/* Grid of expandable Risk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {FRAUD_SAMPLES.map((s) => {
            const isHighRisk = s.riskScore > 70;
            const isMediumRisk = s.riskScore > 30 && s.riskScore <= 70;
            const isExpanded = expandedFraudCode === s.code;

            const baseColor = isHighRisk 
              ? "rose" 
              : isMediumRisk 
                ? "amber" 
                : "emerald";

            return (
              <div 
                key={s.code}
                onClick={() => setExpandedFraudCode(isExpanded ? null : s.code)}
                className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                  isExpanded 
                    ? `bg-white dark:bg-slate-900 shadow-lg border-${baseColor}-400/50 dark:border-${baseColor}-500/40 ring-1 ring-${baseColor}-400/20` 
                    : `bg-slate-50/80 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 hover:bg-white dark:hover:bg-white/[0.04]`
                }`}
              >
                {/* Always Visible Header */}
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-xl flex shrink-0 items-center justify-center font-mono font-black text-lg border ${
                      isHighRisk ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" :
                      isMediumRisk ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    }`}>
                      {s.code}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm sm:text-base line-clamp-1">{isAr ? s.regionAr : s.regionEn}</h4>
                      <div className="text-[10px] text-muted-foreground font-mono uppercase mt-0.5 line-clamp-1">{s.typeEn}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isHighRisk ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" :
                      isMediumRisk ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    }`}>
                      {s.riskScore}/100
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground">{isAr ? "مؤشر الخطر" : "Risk Index"}</span>
                  </div>
                </div>

                {/* Expandable Content Area */}
                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-white/5 mt-2 space-y-4">
                      
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-mono text-muted-foreground">{isAr ? "التصنيف" : "Classification"}</span>
                          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            {isHighRisk ? <ShieldAlert className="size-3.5 text-rose-500 shrink-0" /> : <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />}
                            <span className="line-clamp-2">{isAr ? s.typeAr : s.typeEn}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-mono text-muted-foreground">{isAr ? "التعرفة المتوقعة" : "Potential Tariff"}</span>
                          <div className={`text-xs font-bold font-mono ${isHighRisk ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                            {s.rate}
                          </div>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg text-xs leading-relaxed border ${
                        isHighRisk ? "bg-rose-50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10 text-rose-800 dark:text-rose-200" :
                        isMediumRisk ? "bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10 text-amber-800 dark:text-amber-200" :
                        "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                      }`}>
                        {isAr ? s.warningAr : s.warningEn}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectCode(s.code);
                        }}
                        className="w-full btn-secondary py-2 text-xs"
                      >
                        {isAr ? `فحص ملف الكود الكامل (${s.code})` : `Inspect Full Dossier (${s.code})`}
                      </button>

                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
