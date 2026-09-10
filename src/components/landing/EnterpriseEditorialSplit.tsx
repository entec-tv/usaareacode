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
  const [selectedFraud, setSelectedFraud] = useState<(typeof FRAUD_SAMPLES)[number]>(FRAUD_SAMPLES[0]!);

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
          EDITORIAL SPLIT A: TCPA COMPLIANCE & CALLING WINDOW ENGINE
      ========================================================================= */}
      <div className="relative rounded-3xl border border-slate-200/90 dark:border-border/80 bg-gradient-to-br from-white via-slate-50/80 to-blue-50/20 dark:from-card dark:via-card/90 dark:to-card/50 p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-lg dark:shadow-black/40 overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -right-32 size-96 bg-emerald-500/[0.07] blur-[100px] rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Copy + Interactive Time Slider */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>47 CFR § 64.1200 • TCPA Safe Harbor</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground tracking-tight">
                {isAr
                  ? "لا تتصل خارج النافذة القانونية. احمِ مؤسستك من غرامات $1,500."
                  : "Never Dial Outside The Safe Window. Guaranteed."}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
                {isAr
                  ? "حساب التوقيت الآمن تلقائياً لتجنب الحظر الفيدرالي وغرامات الـ 1,500$."
                  : "Automated TCPA safe-harbor calculations to prevent $1,500 fines per violation."}
              </p>
            </div>

            {/* Interactive 24-Hour Timeline Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-card/80 border border-slate-200/80 dark:border-border/70 space-y-4 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {isAr ? "المنطقة الزمنية المختارة:" : "Active Zone:"}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {TIMEZONE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedTz(preset)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          selectedTz.id === preset.id
                            ? "bg-emerald-500 text-white shadow-xs"
                            : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {preset.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-foreground">{displayTime()}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                      isSafeWindow
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${isSafeWindow ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`} />
                    <span>{isSafeWindow ? (isAr ? "مسموح قانونياً" : "TCPA Safe") : (isAr ? "محظور قانونياً" : "TCPA Blocked")}</span>
                  </span>
                </div>
              </div>

              {/* Visual 24-Hour Strip */}
              <div className="space-y-1.5">
                <div className="relative h-7 w-full rounded-xl overflow-hidden flex border border-border/70">
                  {/* Blocked Morning (12am - 8am) = 8 hours (33.33%) */}
                  <div className="h-full w-[33.33%] bg-rose-500/20 border-r border-rose-500/30 flex items-center justify-center text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">
                    12 AM – 8 AM (BLOCKED)
                  </div>
                  {/* Safe Calling Window (8am - 9pm) = 13 hours (54.17%) */}
                  <div className="h-full w-[54.17%] bg-emerald-500/25 border-r border-emerald-500/30 flex items-center justify-center text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                    8 AM – 9 PM SAFE HARBOR
                  </div>
                  {/* Blocked Evening (9pm - 12am) = 3 hours (12.5%) */}
                  <div className="h-full w-[12.5%] bg-rose-500/20 flex items-center justify-center text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">
                    9 PM – 12 AM
                  </div>

                  {/* Current Hour Indicator Needle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-foreground shadow-md transition-all duration-300 -translate-x-1/2 flex flex-col items-center justify-between"
                    style={{ left: `${(localHour / 24) * 100}%` }}
                  >
                    <div className="size-2 rounded-full bg-foreground" />
                    <div className="size-2 rounded-full bg-foreground" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-0.5">
                  <span>12:00 AM</span>
                  <span>06:00 AM</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">08:00 AM (START)</span>
                  <span>12:00 PM</span>
                  <span>06:00 PM</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">09:00 PM (CUTOFF)</span>
                  <span>11:59 PM</span>
                </div>
              </div>

              {/* Features list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>{isAr ? "مراعاة التوقيت الصيفي والشتوي التلقائي" : "Automatic Daylight Saving Time sync"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>{isAr ? "تغطية 48 ولاية متجاورة + ألاسكا وهاواي" : "50 States + Canadian CRTC statutory rules"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <button
                onClick={onNavigateToConverter}
                className="btn-primary"
              >
                <span>{isAr ? "محول المناطق الزمنية" : "Timezone Converter"}</span>
                <ArrowRight className="size-4" />
              </button>
              <button
                onClick={() => onInspectCode(selectedTz.code)}
                className="btn-secondary"
              >
                {isAr ? `فحص الكود (${selectedTz.code})` : `Inspect NPA (${selectedTz.code})`}
              </button>
            </div>
          </div>

          {/* Right Column: Cinematic Call Center Visual with Live Dossier Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-emerald-500/40 shadow-2xl shadow-emerald-500/10 ring-1 ring-emerald-500/20 group">
              <img
                src="/images/callcenter-pro.jpg"
                alt="Professional Call Center Telecom Infrastructure"
                className="w-full h-80 sm:h-96 object-cover brightness-110 contrast-105 saturate-110 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent pointer-events-none" />

              {/* Floating Live Badge Top Left */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/95 backdrop-blur-md border border-emerald-500/40 text-xs font-mono font-bold text-foreground shadow-md">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ACTIVE CALL SHIELD</span>
              </div>

              {/* Floating Inspection Card Bottom */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl glass-panel border border-white/20 dark:border-white/15 backdrop-blur-md space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs border border-emerald-500/30">
                      {selectedTz.code}
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-xs">{selectedTz.nameEn}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">Local Recipient Window</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{isSafeWindow ? "APPROVED" : "STANDBY"}</div>
                    <div className="text-[10px] text-muted-foreground">{displayTime()}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Potential Penalty Risk:</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">$0.00 (Protected)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          EDITORIAL SPLIT B: OFFSHORE TOLL FRAUD & WANGIRI INTERCEPTOR
      ========================================================================= */}
      <div className="relative rounded-3xl border border-slate-200/90 dark:border-white/10 bg-gradient-to-br from-white via-slate-50/80 to-amber-50/20 dark:from-card dark:via-card/90 dark:to-card/50 p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/40 overflow-hidden">
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 bg-amber-500/[0.07] blur-[100px] rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Interactive Live Fraud Simulator */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="rounded-3xl border border-amber-300/80 dark:border-amber-500/30 bg-slate-50/95 dark:bg-card/95 p-5 sm:p-6 space-y-5 shadow-lg shadow-amber-500/5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <ShieldAlert className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-foreground">WANGIRI RADAR SIMULATOR</div>
                    <div className="text-[10px] text-muted-foreground">Test NPA Surcharge Risk Index</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-500/30">
                  LIVE INTERCEPT
                </span>
              </div>

              {/* Quick Sample Selector */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {isAr ? "اختر مفتاح منطقة للفحص الفوري:" : "Select NPA Sample to Screen:"}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {FRAUD_SAMPLES.map((s) => (
                    <button
                      key={s.code}
                      onClick={() => setSelectedFraud(s)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedFraud.code === s.code
                          ? "bg-amber-500/15 border-amber-500/50 shadow-xs ring-1 ring-amber-500/30"
                          : "bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border-slate-200/80 dark:border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs text-foreground">{s.code}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                            s.riskScore > 70
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {s.riskScore}/100
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate mt-0.5">{s.regionEn}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Prominent Risk Severity Gauge & Analysis Result */}
              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block">Classification</span>
                    <div className="font-bold text-xs text-foreground">{selectedFraud.typeEn}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block">Tariff Potential</span>
                    <div className="font-bold font-mono text-xs text-amber-600 dark:text-amber-400">
                      {selectedFraud.rate}
                    </div>
                  </div>
                </div>

                {/* Prominent Multi-Segment Risk Severity Meter */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/60 dark:border-white/10 space-y-2.5">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">Risk Severity Index</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span
                          className={`font-mono text-2xl font-black ${
                            selectedFraud.riskScore > 70
                              ? "text-rose-600 dark:text-rose-400"
                              : selectedFraud.riskScore > 30
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {selectedFraud.riskScore}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground font-semibold">/ 100</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                        selectedFraud.riskScore > 70
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                          : selectedFraud.riskScore > 30
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {selectedFraud.riskScore > 70 ? "HIGH PENALTY FRAUD" : selectedFraud.riskScore > 30 ? "CAUTION SCREEN" : "CLEARED SAFE"}
                    </span>
                  </div>

                  {/* 5-Stage Visual Segmented Progress Bar */}
                  <div className="grid grid-cols-5 gap-1.5 h-3">
                    {[
                      { threshold: 20, color: "bg-emerald-500" },
                      { threshold: 40, color: "bg-emerald-400" },
                      { threshold: 60, color: "bg-amber-400" },
                      { threshold: 80, color: "bg-amber-500" },
                      { threshold: 100, color: "bg-rose-500" },
                    ].map((segment, idx) => {
                      const isActive = selectedFraud.riskScore >= segment.threshold - 15;
                      return (
                        <div
                          key={idx}
                          className={`rounded-sm transition-all duration-500 ${
                            isActive
                              ? `${segment.color} shadow-xs`
                              : "bg-slate-200 dark:bg-white/10"
                          }`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground uppercase pt-0.5">
                    <span>Safe</span>
                    <span>Guarded</span>
                    <span>Severe</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-slate-100 dark:border-white/10">
                  {isAr ? selectedFraud.warningAr : selectedFraud.warningEn}
                </p>
              </div>

              <button
                onClick={() => onInspectCode(selectedFraud.code)}
                className="btn-primary w-full"
              >
                <span>{isAr ? `فحص ملف الكود الكامل (${selectedFraud.code})` : `Inspect Full Dossier (${selectedFraud.code})`}</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Editorial Copy */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <Flame className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>+1 Caribbean Fraud Shield • PRS Interception</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground tracking-tight">
                {isAr
                  ? "كشف احتيال الرنة الواحدة (Wangiri) ومصائد الفواتير قبل الاتصال."
                  : "Detect Offshore Toll Traps Before Your Dialers Connect."}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
                {isAr
                  ? "كشف فوري لفخاخ الأرقام الكاريبية لحماية ميزانيتك من فواتير الاحتيال الخفية."
                  : "Instant detection of offshore +1 toll traps to shield your campaigns from hidden tariffs."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-card/70 border border-slate-200/80 dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                  <Zap className="size-3.5 text-amber-500" />
                  <span>{isAr ? "19 مفتاح كاريبي موثق" : "19 Caribbean NPAs Indexed"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {isAr
                    ? "تغطية شاملة لجامايكا (876)، الباهاماس (242)، برمودا (441)، الدومينيكان (809/829)، وجزر فيرجن."
                    : "Comprehensive registry for Jamaica (876), Bahamas (242), Bermuda (441), Dominican Rep. (809/829), and Virgin Islands."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-card/70 border border-slate-200/80 dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                  <Lock className="size-3.5 text-primary" />
                  <span>{isAr ? "تنظيف القوائم قبل الحقن" : "Pre-Dial CRM Lead Cleansing"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {isAr
                    ? "استبعاد أرقام الاحتيال تلقائياً من قوائم المبيعات لمنع الخسائر المالية غير المتوقعة لشركتك."
                    : "Automatically strip international toll numbers from your sales CRM lists prior to campaign dispatch."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <button
                onClick={onNavigateToBulk}
                className="btn-primary"
              >
                <span>{isAr ? "تنظيف وفلترة الأرقام" : "Clean Lead Lists"}</span>
                <ArrowRight className="size-4" />
              </button>
              <button
                onClick={() => onInspectCode("876")}
                className="btn-secondary"
              >
                {isAr ? "فحص كود جامايكا (876)" : "Screen Jamaica (876)"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
