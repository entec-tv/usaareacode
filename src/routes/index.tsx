import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef, type ChangeEvent, lazy, Suspense } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  Building2,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe2,
  Hash,
  HelpCircle,
  History,
  Layers,
  MapPin,
  Maximize2,
  Phone,
  PhoneCall,
  Radio,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Navigation,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/data/company";
import {
  AREA_CODES,
  AREA_CODE_MAP,
  carrierFor,
  REGIONS,
  STATS,
  type AreaCode,
  type Country,
} from "@/data/areaCodes";
import { getAreaCodeCoordinates } from "@/data/geoCoordinates";
import {
  detectInput,
  formatUS,
  isValidNanp,
  localTime,
  callingWindow,
  mapLink,
  toE164,
  lookup,
  type LookupResult,
} from "@/lib/nanp";
import { exportCsv, exportJson, exportXlsx, copyTable } from "@/lib/exporters";
import { parseUploadedFile, normalizeEasternArabicNumerals } from "@/lib/file-parser";
import { useI18n } from "@/lib/i18n";
import { TimeConverterTab } from "@/components/tools/TimeConverterTab";
import { BulkExtractorTab } from "@/components/tools/BulkExtractorTab";
const InteractiveTelecomMap = lazy(() => import("@/components/map/InteractiveTelecomMap").then(m => ({ default: m.InteractiveTelecomMap })));
const AreaCodeLeafletMap = lazy(() => import("@/components/map/AreaCodeLeafletMap").then(m => ({ default: m.AreaCodeLeafletMap })));
import { useQuery } from "@tanstack/react-query";
import { fetchAreaCodesFromDb, adaptDbRecordToAreaCode, logSearchQuery, logEngagementEvent } from "@/lib/collections";
import { getClientGeoInfo, checkSearchVelocity } from "@/lib/geo";
import { isFirebaseConfigured, trackAnalyticsEvent } from "@/lib/firebase";

import { TrustBar } from "@/components/landing/TrustBar";
import { EnterpriseEditorialSplit } from "@/components/landing/EnterpriseEditorialSplit";
import { InvertedNumbersSection } from "@/components/landing/InvertedNumbersSection";
import { GoogleAdBanner } from "@/components/ads/GoogleAdBanner";
import { AreaCodeNarrativeSection } from "@/components/landing/AreaCodeNarrativeSection";
import { getAreaNarrative, generateAndSaveNarrative } from "@/lib/ai-narrative-service";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

type TabType = "lookup" | "browse" | "bulk" | "map" | "compare" | "converter" | "saved";

const TIMEZONES_LIST = [
  { id: "ALL", label: "All Timezones", sampleCity: "Nationwide Coverage" },
  { id: "America/New_York", label: "Eastern Time (ET)", sampleCity: "New York, Atlanta, Miami, Toronto, Montreal" },
  { id: "America/Chicago", label: "Central Time (CT)", sampleCity: "Chicago, Dallas, Houston, Winnipeg" },
  { id: "America/Denver", label: "Mountain Time (MT)", sampleCity: "Denver, Salt Lake City, Calgary, Edmonton" },
  { id: "America/Phoenix", label: "Mountain Time (MST, no DST)", sampleCity: "Phoenix, Tucson, Mesa, Scottsdale" },
  { id: "America/Los_Angeles", label: "Pacific Time (PT)", sampleCity: "Los Angeles, San Francisco, Seattle, Vancouver" },
  { id: "America/Anchorage", label: "Alaska Time (AKT)", sampleCity: "Anchorage, Fairbanks, Juneau" },
  { id: "Pacific/Honolulu", label: "Hawaii-Aleutian Time (HST)", sampleCity: "Honolulu, Pearl City, Hilo" },
  { id: "America/Halifax", label: "Atlantic Time (AT)", sampleCity: "Halifax, San Juan PR, Bermuda, Dominican Rep" },
  { id: "America/St_Johns", label: "Newfoundland Time (NT)", sampleCity: "St. John's, Mount Pearl, Corner Brook" },
  { id: "America/Regina", label: "Central Time (CST, no DST)", sampleCity: "Regina, Saskatoon, Prince Albert" },
  { id: "Pacific/Guam", label: "Chamorro Time (ChST)", sampleCity: "Hagatna, Dededo, Saipan" },
  { id: "Pacific/Pago_Pago", label: "Samoa Time (SST)", sampleCity: "Pago Pago" }
];

interface PopularNpaDefinition {
  code: string;
  nameEn: string;
  nameAr: string;
  badgeEn: string;
  badgeAr: string;
}

const POPULAR_NPAS: PopularNpaDefinition[] = [
  { code: "212", nameEn: "New York City (Manhattan)", nameAr: "نيويورك (مانهاتن)", badgeEn: "Wall St & Midtown", badgeAr: "مركز المال والأعمال" },
  { code: "310", nameEn: "Los Angeles & Beverly Hills", nameAr: "لوس أنجلوس وبيفرلي هيلز", badgeEn: "West Coast Hub", badgeAr: "مركز الساحل الغربي" },
  { code: "312", nameEn: "Chicago (Downtown Loop)", nameAr: "شيكاغو (وسط المدينة)", badgeEn: "Financial District", badgeAr: "القطاع التجاري المركزي" },
  { code: "415", nameEn: "San Francisco & Silicon Valley", nameAr: "سان فرانسيسكو ووادي السيليكون", badgeEn: "Tech Corridor", badgeAr: "وادي التكنولوجيا" },
  { code: "305", nameEn: "Miami & South Florida", nameAr: "ميامي وجنوب فلوريدا", badgeEn: "International Gateway", badgeAr: "بوابة أمريكا اللاتينية" },
  { code: "416", nameEn: "Toronto, Ontario", nameAr: "تورونتو، أونتاريو", badgeEn: "Canadian Metro", badgeAr: "كندا الكبرى" },
  { code: "800", nameEn: "North American Toll-Free", nameAr: "الخطوط المجانية الوطنية", badgeEn: "Nationwide Inbound", badgeAr: "الشبكة المجانية الموحدة" },
  { code: "876", nameEn: "Jamaica (Caribbean Risk)", nameAr: "جامايكا (مخاطر احتيال)", badgeEn: "Wangiri Risk Alert", badgeAr: "تحذير احتيال الرنة الواحدة" },
];



// Clean SVG Flags for Crisp Universal Rendering (Never Glitches on Windows Chromium)
function UsFlagBadge({ className = "w-4 h-2.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#b22234" d="M0 0h640v400H0z" />
      <path stroke="#fff" strokeWidth="30.77" d="M0 46.15h640M0 107.7h640M0 169.2h640M0 230.8h640M0 292.3h640M0 353.8h640" />
      <path fill="#3c3b6e" d="M0 0h256v215.4H0z" />
      <circle cx="42.6" cy="35.9" r="7" fill="#fff" />
      <circle cx="85.3" cy="35.9" r="7" fill="#fff" />
      <circle cx="128" cy="35.9" r="7" fill="#fff" />
      <circle cx="170.6" cy="35.9" r="7" fill="#fff" />
      <circle cx="213.3" cy="35.9" r="7" fill="#fff" />
      <circle cx="64" cy="71.8" r="7" fill="#fff" />
      <circle cx="106.6" cy="71.8" r="7" fill="#fff" />
      <circle cx="149.3" cy="71.8" r="7" fill="#fff" />
      <circle cx="192" cy="71.8" r="7" fill="#fff" />
      <circle cx="42.6" cy="107.7" r="7" fill="#fff" />
      <circle cx="85.3" cy="107.7" r="7" fill="#fff" />
      <circle cx="128" cy="107.7" r="7" fill="#fff" />
      <circle cx="170.6" cy="107.7" r="7" fill="#fff" />
      <circle cx="213.3" cy="107.7" r="7" fill="#fff" />
      <circle cx="64" cy="143.6" r="7" fill="#fff" />
      <circle cx="106.6" cy="143.6" r="7" fill="#fff" />
      <circle cx="149.3" cy="143.6" r="7" fill="#fff" />
      <circle cx="192" cy="143.6" r="7" fill="#fff" />
      <circle cx="42.6" cy="179.5" r="7" fill="#fff" />
      <circle cx="85.3" cy="179.5" r="7" fill="#fff" />
      <circle cx="128" cy="179.5" r="7" fill="#fff" />
      <circle cx="170.6" cy="179.5" r="7" fill="#fff" />
      <circle cx="213.3" cy="179.5" r="7" fill="#fff" />
    </svg>
  );
}

function CaFlagBadge({ className = "w-4 h-2.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#d80027" d="M0 0h160v320H0zM480 0h160v320H480z" />
      <path fill="#fff" d="M160 0h320v320H160z" />
      <path fill="#d80027" d="m320 60 16 46 36-12-16 40 44 8-32 30 18 36-40-16-10 40-16-40-40 16 18-36-32-30 44-8-16-40 36 12 16-46z" />
    </svg>
  );
}

// Reusable Area Code Intelligence Dossier Card - Apple Light Glass & Materials
function AreaCodeCard({
  item,
  now,
  isFav,
  onToggleFavorite,
  onCopyDossier,
  onInspectCode,
  onNavigateToRadar,
  isAr = false,
  t,
}: {
  item: AreaCode;
  now: Date;
  isFav: boolean;
  onToggleFavorite: (code: string) => void;
  onCopyDossier: (item: AreaCode) => void;
  onInspectCode?: ((code: string) => void) | undefined;
  onNavigateToRadar?: (() => void) | undefined;
  isAr?: boolean | undefined;
  t: (k: string) => string;
}) {
  const clock = localTime(item.timezone, now);
  const win = callingWindow(clock.hour);
  const carrier = item.carrier || carrierFor(item.code, item.country);
  const [lat, lng] = getAreaCodeCoordinates(item);
  const [copiedSample, setCopiedSample] = useState(false);
  const [showTechSpecs, setShowTechSpecs] = useState(false);

  // Time remaining calculation
  let countdownText = "";
  if (win.status === "good" || win.status === "caution") {
    // Window closes at 21:00 (9:00 PM)
    const minutesLeft = (20 - clock.hour) * 60 + (60 - clock.minute);
    const h = Math.floor(minutesLeft / 60);
    const m = minutesLeft % 60;
    countdownText = isAr
      ? `تنتهي فترة الاتصال المسموحة بعد ${h} س ${m} د (عند 9:00 م)`
      : `Safe window closes in ${h}h ${m}m (at 9:00 PM local)`;
  } else {
    // Window opens at 08:00 (8:00 AM)
    const hoursUntil = clock.hour >= 21 ? 24 - clock.hour + 8 : 8 - clock.hour;
    const minutesUntil = (hoursUntil - 1) * 60 + (60 - clock.minute);
    const h = Math.floor(minutesUntil / 60);
    const m = minutesUntil % 60;
    countdownText = isAr
      ? `تفتح فترة الاتصال القانونية بعد ${h} س ${m} د (عند 8:00 ص)`
      : `Legal TCPA window opens in ${h}h ${m}m (at 8:00 AM local)`;
  }

  // 24-hour timeline position: (hour + minute / 60) / 24 * 100%
  const currentTimelinePercent = Math.min(
    100,
    Math.max(0, ((clock.hour + clock.minute / 60) / 24) * 100),
  );

  const samplePhoneNumber = `+1 (${item.code}) 555-0199`;

  const copySampleNumber = () => {
    navigator.clipboard.writeText(`+1${item.code}5550199`);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
    logEngagementEvent({ action: "copy_phone", target: item.code });
  };

  const coordsStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(2)}°${lng >= 0 ? "W" : "E"}`;

  return (
    <div
      key={`${item.code}-${item.region}`}
      className="group rounded-3xl bg-white/80 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/80 dark:border-white/10 p-4 sm:p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:shadow-2xl flex flex-col justify-between space-y-4 transition-all"
    >
      <div className="space-y-4">
        {/* Tier 1: Identity & Real-Time Clock */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* NPA Monogram */}
            <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shrink-0 shadow-xs">
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                NPA
              </span>
              <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {item.code}
              </span>
              <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                {item.country === "TF" ? "Toll-Free" : "Standard"}
              </span>
            </div>

            {/* Region Details & Badges */}
            <div className="space-y-1 min-w-0">
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug truncate">
                {item.regionName} • {item.region}
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  {item.country === "US" ? (
                    <>
                      <UsFlagBadge className="w-3.5 h-2.5 rounded-xs" />
                      <span>United States</span>
                    </>
                  ) : item.country === "CA" ? (
                    <>
                      <CaFlagBadge className="w-3.5 h-2.5 rounded-xs" />
                      <span>Canada</span>
                    </>
                  ) : item.country === "TF" ? (
                    <>
                      <Phone className="size-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Toll-Free Network</span>
                    </>
                  ) : (
                    <>
                      <Globe2 className="size-3 text-amber-600 dark:text-amber-400" />
                      <span>Caribbean / Offshore</span>
                    </>
                  )}
                </span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {item.mandatory10Digit
                    ? isAr
                      ? "طلب 10 أرقام إلزامي"
                      : "10-Digit Dialing"
                    : isAr
                      ? "طلب 7 أو 10 أرقام"
                      : "7/10-Digit"}
                </span>
              </div>
            </div>
          </div>

          {/* Clock & Favorite Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-end font-mono" suppressHydrationWarning>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {clock.time}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1.5">
                <span>{clock.date}</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-primary dark:text-cyan-300 font-semibold">{item.tzLabel}</span>
              </div>
            </div>

            <button
              onClick={() => onToggleFavorite(item.code)}
              aria-label="Bookmark"
              title={isFav ? "Saved to favorites" : "Save area code"}
              className={`p-2 rounded-2xl border transition-all cursor-pointer shrink-0 shadow-xs ${isFav
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300"
                  : "bg-white/80 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border-black/[0.08] dark:border-slate-700/60 text-slate-400 hover:text-amber-500"
                }`}
            >
              <Star
                className={`size-4 transition-transform active:scale-125 ${isFav ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" : ""
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Toll-Fraud Risk Alert if present */}
        {item.risk && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-3 shadow-xs">
            <ShieldAlert className="size-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-rose-700 dark:text-rose-300 text-xs tracking-wide uppercase flex items-center gap-2">
                <span>{t("risk_title")}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 font-mono font-semibold">
                  FCC Advisory
                </span>
              </div>
              <p className="text-[11px] text-rose-700/90 dark:text-rose-300/90 leading-relaxed">{t("risk_body")}</p>
            </div>
          </div>
        )}

        {/* Calling Window & Timeline (Apple Frosted Style) */}
        <div
          className={`rounded-2xl p-3.5 sm:p-4 border transition-colors space-y-2.5 shadow-xs ${win.status === "good"
              ? "bg-emerald-500/[0.08] dark:bg-emerald-950/20 border-emerald-500/25"
              : win.status === "caution"
                ? "bg-amber-500/[0.08] dark:bg-amber-950/20 border-amber-500/25"
                : "bg-rose-500/[0.08] dark:bg-rose-950/20 border-rose-500/25"
            }`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full shrink-0 ${win.status === "good"
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : win.status === "caution"
                      ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                  }`}
              />
              <span
                className={`font-bold text-xs uppercase tracking-wider ${win.status === "good"
                    ? "text-emerald-800 dark:text-emerald-300"
                    : win.status === "caution"
                      ? "text-amber-800 dark:text-amber-300"
                      : "text-rose-800 dark:text-rose-300"
                  }`}
              >
                {win.status === "good"
                  ? isAr
                    ? "ساعات الاتصال مسموحة وقانونية"
                    : "Safe to Call • TCPA Compliant"
                  : win.status === "caution"
                    ? isAr
                      ? "نافذة الاتصال قاربت على الانتهاء"
                      : "Borderline • Window Closing"
                    : isAr
                      ? "خارج ساعات الاتصال القانونية (ممنوع)"
                      : "Do Not Call • Outside TCPA Hours"}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-medium">
              {countdownText}
            </span>
          </div>

          {/* Clean 24-Hour Visual Timeline */}
          <div className="space-y-1">
            <div className="relative h-1.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-800/80 overflow-visible">
              {/* Permitted Calling Window (8 AM - 9 PM) */}
              <div
                className="absolute top-0 bottom-0 left-[33.33%] right-[12.5%] rounded-full bg-emerald-500/30 dark:bg-emerald-500/30"
                title="TCPA Permitted Calling Hours (8:00 AM – 9:00 PM)"
              />
              {/* Current Time Pin */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                style={{ left: `${currentTimelinePercent}%` }}
                title={`Current time: ${clock.time}`}
              >
                <span className="block size-3 rounded-full bg-white border-2 border-primary shadow-xs" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 select-none">
              <span>12 AM</span>
              <span className="text-emerald-600 dark:text-emerald-500/80 font-medium">8 AM (Start)</span>
              <span className="text-emerald-600 dark:text-emerald-500/80 font-medium">9 PM (Cutoff)</span>
              <span>12 AM</span>
            </div>
          </div>
        </div>

        {/* Tier 2: Essential Specifications Matrix (Apple Sunken Glass) */}
        <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/70 p-3.5 sm:p-4 space-y-3 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Dominant Carrier */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                <Radio className="size-3 text-primary" />
                <span>{t("carrier")} / ILEC</span>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm truncate" title={carrier}>
                {carrier}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">
                {isAr ? "المشغّل المحلي الرئيسي (Incumbent Carrier)" : "Incumbent Local Exchange"}
              </div>
            </div>

            {/* Coverage Cities */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                <MapPin className="size-3 text-primary" />
                <span>{t("city")} & Coverage</span>
              </div>
              <div
                className="font-semibold text-slate-900 dark:text-slate-200 text-sm truncate"
                title={item.cities.join(", ")}
              >
                {item.cities.slice(0, 3).join(", ")}
                {item.cities.length > 3 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">
                    +{item.cities.length - 3} more
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">
                {isAr ? `${item.cities.length} مراكز تغطية مسجلة` : `${item.cities.length} Registered Rate Centers`}
              </div>
            </div>
          </div>

          {/* Overlays Row */}
          <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
              <Layers className="size-3 text-primary" />
              <span>
                {isAr ? "الأكواد التراكبية المشتركة" : "Shared Relief Overlays"} ({item.overlays?.length || 0}):
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {item.overlays && item.overlays.length > 0 ? (
                item.overlays.map((ov) => (
                  <button
                    key={ov}
                    onClick={() => onInspectCode?.(ov)}
                    title={`Inspect area code ${ov}`}
                    className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-primary/10 text-slate-800 dark:text-slate-200 hover:text-primary border border-black/[0.08] dark:border-slate-700/80 font-mono text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    {ov}
                  </button>
                ))
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                  {isAr ? "كود مستقل دون تراكبات" : "None (Single code NPA)"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tier 3: Collapsible Advanced Telephony Specs */}
        <div>
          <button
            type="button"
            onClick={() => setShowTechSpecs(!showTechSpecs)}
            className="w-full flex items-center justify-between py-1.5 px-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <span>{isAr ? "المواصفات الفنية المتقدمة والإحداثيات" : "Advanced Technical Specs & Coordinates"}</span>
            </span>
            {showTechSpecs ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>

          {showTechSpecs && (
            <div className="mt-2 p-3.5 rounded-2xl bg-white/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono shadow-xs">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-medium">Coordinates</span>
                <span className="text-slate-900 dark:text-white font-semibold">{coordsStr}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-medium">IANA Timezone</span>
                <span className="text-slate-900 dark:text-white font-semibold truncate block" title={item.timezone}>
                  {item.timezone}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-medium">Dialing Pattern</span>
                <span className="text-slate-900 dark:text-white font-semibold">+1 {item.code} NXX-XXXX</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar: Balanced and Uncluttered */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2.5 flex-wrap">
        <button
          onClick={copySampleNumber}
          className="px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-black/[0.08] dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 text-xs font-mono transition-all cursor-pointer shadow-xs"
          title={`Copy sample number ${samplePhoneNumber}`}
        >
          {copiedSample ? (
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <PhoneCall className="size-3.5 text-slate-500 dark:text-slate-400" />
          )}
          <span className="font-medium">{copiedSample ? (isAr ? "تم النسخ" : "Copied!") : samplePhoneNumber}</span>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => onCopyDossier(item)}
            className="px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-black/[0.08] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Copy className="size-3.5 text-slate-500 dark:text-slate-400" />
            <span>{t("copy")}</span>
          </button>

          {onNavigateToRadar && (
            <button
              onClick={onNavigateToRadar}
              className="px-4 py-2 rounded-2xl bg-primary hover:brightness-105 text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 transition-all cursor-pointer active:scale-95"
              title="Open inside Operations Radar Map"
            >
              <Navigation className="size-3.5" />
              <span>{isAr ? "عرض في الرادار" : "Radar Room"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Interactive Leaflet Map Card for Area Code Geocoding
function AreaCodeMapCard({
  item,
  t,
  isAr = false,
  onNavigateToRadar,
}: {
  item: AreaCode;
  t: (k: string) => string;
  isAr?: boolean | undefined;
  onNavigateToRadar?: (() => void) | undefined;
}) {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl"><div className="animate-pulse text-slate-400">Loading Map...</div></div>}>
<AreaCodeLeafletMap
      item={item}
      t={t}
      isAr={isAr}
      onNavigateToRadar={onNavigateToRadar}
    />
  );
}


function IndexPage() {
  const { t, lang } = useI18n();
  const isAr = lang === "ar";

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<TabType>("lookup");

  // Sync tab and search query with URL query params ?tab= and ?q=
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab") as TabType | null;
    const qParam = urlParams.get("q");

    if (qParam && qParam.trim()) {
      setSearchQuery(qParam.trim());
      setHasSearched(true);
      setActiveTab("lookup");
    }

    const validTabs: TabType[] = ["lookup", "browse", "bulk", "map", "compare", "converter", "saved"];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
      setTimeout(() => {
        if (mainContentRef.current) {
          const headerOffset = 80;
          const pos = mainContentRef.current.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: Math.max(0, pos), behavior: "smooth" });
        }
      }, 50);
    }
  }, []);

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    logEngagementEvent({ action: "tab_switch", target: tab });
    if (tab !== "lookup") {
      setTimeout(() => {
        if (mainContentRef.current) {
          const headerOffset = 80;
          const pos = mainContentRef.current.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: Math.max(0, pos), behavior: "smooth" });
        }
      }, 50);
    }
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedHeroMatchIdx, setSelectedHeroMatchIdx] = useState(0);
  const heroResultsRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const [now, setNow] = useState(new Date());
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Browse database state
  const [browseQuery, setBrowseQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<"ALL" | Country>("ALL");
  const [tzFilter, setTzFilter] = useState("ALL");
  const [callStatusFilter, setCallStatusFilter] = useState<"ALL" | "good" | "caution" | "blocked">("ALL");
  const [sortField, setSortField] = useState<"code" | "regionName" | "timezone" | "carrier">("code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Map view state
  const [activeMap, setActiveMap] = useState<"us" | "ca">("us");
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Compare state
  const [compareCodeA, setCompareCodeA] = useState("212");
  const [compareCodeB, setCompareCodeB] = useState("310");

  // Favorites & Recents in localStorage
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [showAllClocks, setShowAllClocks] = useState(false);

  // Ticking 1-second clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize favorites & recents from localStorage
  useEffect(() => {
    try {
      const favs = localStorage.getItem("entec:favorites");
      if (favs) setFavorites(JSON.parse(favs));
      const rec = localStorage.getItem("entec:recents");
      if (rec) setRecents(JSON.parse(rec));
    } catch {
      // ignore
    }
  }, []);

  const toggleFavorite = (code: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      localStorage.setItem("entec:favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const saveRecent = (query: string) => {
    if (!query.trim()) return;
    setRecents((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== query.toLowerCase());
      const updated = [query.trim(), ...filtered].slice(0, 10);
      localStorage.setItem("entec:recents", JSON.stringify(updated));
      return updated;
    });
  };

  const triggerToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 2500);
  };

  // Live Firestore Area Codes Query with Fallback to Static Registry
  const { data: dbAreaCodes } = useQuery({
    queryKey: ["areaCodesList"],
    queryFn: fetchAreaCodesFromDb,
    enabled: isFirebaseConfigured,
  });

  const activeAreaCodes: AreaCode[] = useMemo(() => {
    if (!dbAreaCodes || dbAreaCodes.length === 0) return AREA_CODES;
    const dbCodesMap = new Map<string, AreaCode>();
    for (const record of dbAreaCodes) {
      dbCodesMap.set(record.code, adaptDbRecordToAreaCode(record));
    }
    const merged: AreaCode[] = [];
    for (const base of AREA_CODES) {
      if (dbCodesMap.has(base.code)) {
        const db = dbCodesMap.get(base.code)!;
        merged.push({
          ...base,
          ...db,
          region: (db.region && db.region.length === 2) ? db.region : base.region,
          regionName: db.regionName || base.regionName,
          carrier: (db.carrier && db.carrier !== "Major NANP Carrier") ? db.carrier : base.carrier,
          cities: (db.cities && db.cities.length > 0 && db.cities[0] !== db.regionName) ? db.cities : base.cities,
          overlays: (db.overlays && db.overlays.length > 0) ? db.overlays : base.overlays,
          timezone: db.timezone || base.timezone,
          tzLabel: db.tzLabel || base.tzLabel,
          country: db.country || base.country,
        });
        dbCodesMap.delete(base.code);
      } else {
        merged.push(base);
      }
    }
    for (const extra of dbCodesMap.values()) {
      merged.push(extra);
    }
    return merged.sort((a, b) => a.code.localeCompare(b.code));
  }, [dbAreaCodes]);

  const activeAreaCodeMap = useMemo(() => {
    return activeAreaCodes.reduce((acc, a) => {
      (acc[a.code] ||= []).push(a);
      return acc;
    }, {} as Record<string, AreaCode[]>);
  }, [activeAreaCodes]);

  // Perform active lookup
  const lookupResult = useMemo(() => {
    const res = lookup(searchQuery, activeAreaCodes, activeAreaCodeMap);
    return res;
  }, [searchQuery, activeAreaCodes, activeAreaCodeMap]);

  const activeHeroMatch = useMemo(() => {
    if (!lookupResult.matches || lookupResult.matches.length === 0) return null;
    const clamped = Math.min(selectedHeroMatchIdx, lookupResult.matches.length - 1);
    return lookupResult.matches[clamped] || lookupResult.matches[0];
  }, [lookupResult.matches, selectedHeroMatchIdx]);

  // Fetch or on-demand synthesize AI Narrative for the active area code
  const { data: activeNarrative, isLoading: isNarrativeLoading } = useQuery({
    queryKey: ["areaNarrative", activeHeroMatch?.code],
    queryFn: async () => {
      if (!activeHeroMatch) return null;
      // 1. Check existing narrative from Firestore / cache
      const existing = await getAreaNarrative(activeHeroMatch.code);
      if (existing) return existing;

      // 2. If not found, generate on-demand and persist to Firestore
      const primaryCity =
        (activeHeroMatch.cities && activeHeroMatch.cities.length > 0 && activeHeroMatch.cities[0]) ||
        activeHeroMatch.regionName ||
        activeHeroMatch.region;

      const generated = await generateAndSaveNarrative({
        code: activeHeroMatch.code,
        city: primaryCity,
        region: activeHeroMatch.regionName || activeHeroMatch.region,
        state: activeHeroMatch.regionName || activeHeroMatch.region,
        country: activeHeroMatch.country || "US",
        timezone: activeHeroMatch.tzLabel || activeHeroMatch.timezone || "Eastern Time (ET)",
        carrier: activeHeroMatch.carrier || "",
      });
      return generated;
    },
    enabled: Boolean(activeHeroMatch?.code),
    staleTime: 1000 * 60 * 60, // 1 hour memory caching
  });

  // Scroll to search results cleanly below sticky header after layout settles
  useEffect(() => {
    if (!hasSearched || !searchQuery.trim()) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const frame = requestAnimationFrame(() => {
      timer = setTimeout(() => {
        if (heroResultsRef.current) {
          const headerOffset = 84; // 64px sticky header + 20px buffer
          const elementPosition = heroResultsRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: "smooth",
          });
        }
      }, 60);
    });

    return () => {
      cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
    };
  }, [hasSearched, searchQuery]);

  // Prevent duplicate telemetry logs on rapid clicks/re-renders
  const lastLoggedSearchRef = useRef<{ query: string; time: number }>({ query: "", time: 0 });

  const recordSearchTelemetry = async (q: string, source: "hero_search" | "direct_url" = "hero_search") => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const nowTime = Date.now();
    if (
      lastLoggedSearchRef.current.query.toLowerCase() === trimmed.toLowerCase() &&
      nowTime - lastLoggedSearchRef.current.time < 3500
    ) {
      return;
    }
    lastLoggedSearchRef.current = { query: trimmed, time: nowTime };

    const res = lookup(trimmed, activeAreaCodes, activeAreaCodeMap);
    const matchesCount = res.matches?.length || 0;
    const found = matchesCount > 0;

    const velocityCheck = checkSearchVelocity();
    const geo = await getClientGeoInfo();

    // 1. Firebase Analytics event
    trackAnalyticsEvent("search", {
      search_term: trimmed,
      results_count: matchesCount,
      found,
      source,
      country: geo.country,
      city: geo.city,
      flagged_suspicious: velocityCheck.flagged,
    });

    // 2. Firestore searchLogs collection for Admin Dashboard
    logSearchQuery({
      query: trimmed,
      resultsCount: matchesCount,
      found,
      source,
      userLanguage: typeof navigator !== "undefined" ? navigator.language : undefined,
      timezone: geo.timezone || (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined),
      country: geo.country,
      city: geo.city,
      flaggedSuspicious: velocityCheck.flagged ? true : undefined,
    });
  };

  // Handle Search Submission
  const handleSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    setSelectedHeroMatchIdx(0);
    setHasSearched(true);
    saveRecent(trimmed);
    setActiveTab("lookup");
    void recordSearchTelemetry(trimmed, "hero_search");
  };


  const copyDossierHandler = (item: AreaCode) => {
    const clock = localTime(item.timezone, now);
    const win = callingWindow(clock.hour);
    const carrier = item.carrier || carrierFor(item.code, item.country);
    const info = `ENTEC Official NPA Telecommunications Record:
Area Code: ${item.code}
State/Region: ${item.regionName} (${item.region})
Country: ${item.country}
Primary Cities: ${item.cities.join(", ")}
Timezone: ${item.tzLabel} (${clock.time})
TCPA Window: ${win.label} (${win.detail})
Dominant Carrier: ${carrier}
Overlays: ${item.overlays.join(", ") || "None"}
Dialing Rule: ${item.mandatory10Digit ? "10-Digit Mandatory" : "7/10-Digit"}
Caribbean Fraud Risk: ${item.risk ? "YES - HIGH RISK" : "No"}`;
    navigator.clipboard.writeText(info);
    triggerToast(isAr ? `تم نسخ معلومات ${item.code}` : `Copied NPA ${item.code} details!`);
    logEngagementEvent({
      action: "copy_dossier",
      target: item.code,
      details: { region: item.region, country: item.country, carrier },
    });
  };

  // Filtered browse dataset with complete column sorting and calling status
  const filteredBrowse = useMemo(() => {
    const q = browseQuery.trim().toLowerCase();
    const list = activeAreaCodes.filter((a) => {
      if (countryFilter !== "ALL" && a.country !== countryFilter) return false;
      if (tzFilter !== "ALL" && a.timezone !== tzFilter) return false;

      if (callStatusFilter !== "ALL") {
        const clk = localTime(a.timezone, now);
        const win = callingWindow(clk.hour);
        if (win.status !== callStatusFilter) return false;
      }

      if (!q) return true;
      return (
        a.code.includes(q) ||
        a.region.toLowerCase().includes(q) ||
        a.regionName.toLowerCase().includes(q) ||
        a.carrier.toLowerCase().includes(q) ||
        a.cities.some((c) => c.toLowerCase().includes(q))
      );
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "code") cmp = a.code.localeCompare(b.code);
      else if (sortField === "regionName") cmp = a.regionName.localeCompare(b.regionName);
      else if (sortField === "timezone") cmp = a.tzLabel.localeCompare(b.tzLabel);
      else if (sortField === "carrier") cmp = a.carrier.localeCompare(b.carrier);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [browseQuery, countryFilter, tzFilter, callStatusFilter, sortField, sortDir, now]);

  const totalBrowsePages = Math.ceil(filteredBrowse.length / pageSize) || 1;
  const paginatedBrowse = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBrowse.slice(start, start + pageSize);
  }, [filteredBrowse, currentPage]);

  const toggleSort = (field: "code" | "regionName" | "timezone" | "carrier") => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Compare Codes objects
  const codeAData = (AREA_CODE_MAP[compareCodeA] ?? [])[0];
  const codeBData = (AREA_CODE_MAP[compareCodeB] ?? [])[0];

  const handleSwapCompare = () => {
    const temp = compareCodeA;
    setCompareCodeA(compareCodeB);
    setCompareCodeB(temp);
  };

  // Compare calculation metrics
  const compareMetrics = useMemo(() => {
    if (!codeAData || !codeBData) return null;
    const clockA = localTime(codeAData.timezone, now);
    const clockB = localTime(codeBData.timezone, now);
    const winA = callingWindow(clockA.hour);
    const winB = callingWindow(clockB.hour);

    const diffHours = clockA.hour - clockB.hour;
    let offsetText = "Identical Timezone";
    if (diffHours > 0) {
      offsetText = `${codeAData.code} is ${diffHours} hour${diffHours > 1 ? "s" : ""} ahead of ${codeBData.code}`;
    } else if (diffHours < 0) {
      offsetText = `${codeAData.code} is ${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? "s" : ""} behind ${codeBData.code}`;
    }

    const bothSafe = winA.status === "good" && winB.status === "good";

    return {
      clockA,
      clockB,
      winA,
      winB,
      diffHours,
      offsetText,
      bothSafe,
    };
  }, [codeAData, codeBData, now]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/25 selection:text-primary">
      <Header activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Hero Header - High-Tech Telecom Command Center */}
      <section 
        className={`relative overflow-hidden bg-gradient-to-b from-slate-50 via-slate-100/80 to-white dark:from-[#050811] dark:via-[#080d1a] dark:to-[#04060d] text-slate-900 dark:text-slate-100 border-b border-slate-200/90 dark:border-slate-800/80 transition-all duration-300 ${
          hasSearched && searchQuery.trim() ? "py-3 sm:py-4" : "pt-10 pb-12 sm:pt-14 sm:pb-16"
        }`}
      >
        {/* Precision Micro Dot-Matrix Pattern */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.14] [background-image:radial-gradient(#2563eb_1.25px,transparent_1.25px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,black_30%,transparent_90%)]" 
        />

        {/* Ambient Luminous Aurora Gradients */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[360px] bg-gradient-to-b from-blue-500/15 via-indigo-500/10 to-transparent dark:from-blue-600/25 dark:via-cyan-600/15 dark:to-transparent blur-[120px] rounded-full" />
        <div className="pointer-events-none absolute top-1/4 -right-12 w-[350px] h-[250px] bg-cyan-500/10 dark:bg-cyan-500/15 blur-[90px] rounded-full" />
        <div className="pointer-events-none absolute bottom-4 -left-12 w-[350px] h-[250px] bg-indigo-500/10 dark:bg-indigo-600/15 blur-[90px] rounded-full" />

        {/* Elegant Concentric Telecom Wave Rings */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full border border-blue-500/[0.07] dark:border-blue-400/[0.07] [mask-image:radial-gradient(circle,black_40%,transparent_75%)]" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] rounded-full border border-indigo-500/[0.04] dark:border-indigo-400/[0.05] [mask-image:radial-gradient(circle,black_40%,transparent_75%)]" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center z-20">

          {/* Architectural Headline (Landing View Only) */}
          {(!hasSearched || !searchQuery.trim()) && (
            <div className="max-w-4xl mx-auto mb-6 sm:mb-8 animate-in fade-in duration-500">
              <h1 className="font-display tracking-tight text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.14]">
                <span className="text-slate-900 dark:text-white">
                  {isAr ? "كل مفتاح اتصال في أمريكا الشمالية، " : "Every North American Area Code, "}
                </span>
                <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300">
                  {isAr ? "مُحلل وموثق لحظياً." : "Decoded in Real Time."}
                </span>
              </h1>

              <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300/85 leading-relaxed font-normal">
                {isAr
                  ? "استعلم عن 460+ كود، احسب النوافذ القانونية المسموحة (TCPA)، واكشف الاحتيال والرسوم الخارجية بدقة متناهية."
                  : "Instant dossier lookup for 460+ area codes. Calculate statutory TCPA calling hours and detect offshore toll fraud instantly."}
              </p>
            </div>
          )}

          {/* Spotlight Command-Center Search Bar */}
          <div className={`mx-auto max-w-3xl transition-all duration-300 ${
            hasSearched && searchQuery.trim() ? "mt-0" : "mt-2"
          }`}>
            <div className="relative group">
              {/* Outer Glow Halo on focus/hover */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/20 via-sky-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 blur-xl transition-all duration-500 pointer-events-none" />

              <div className="relative flex flex-row items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.12] group-focus-within:border-blue-500/70 dark:group-focus-within:border-blue-400/60 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.65)] group-focus-within:shadow-[0_16px_45px_rgba(37,99,235,0.18)] transition-all duration-300">
                <div className="relative flex-1 min-w-0 flex items-center">
                  <Search className={`absolute top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 pointer-events-none transition-colors duration-200 ${
                    isAr ? "right-3.5 sm:right-4" : "left-3.5 sm:left-4"
                  }`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch(searchQuery);
                    }}
                    placeholder={t("search_ph")}
                    className={`w-full bg-transparent py-3 sm:py-3.5 text-base sm:text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none ${
                      isAr ? "pr-11 sm:pr-12 pl-10" : "pl-11 sm:pl-12 pr-10"
                    }`}
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setHasSearched(false);
                      }}
                      className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
                        isAr ? "left-2 sm:left-3" : "right-2 sm:right-3"
                      }`}
                      title={isAr ? "مسح" : "Clear"}
                    >
                      <X className="size-4" />
                    </button>
                  ) : (
                    <div className={`absolute top-1/2 -translate-y-1/2 hidden lg:flex items-center pointer-events-none ${
                      isAr ? "left-2.5 sm:left-3" : "right-2.5 sm:right-3"
                    }`}>
                      <kbd className="px-2 py-0.5 text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/90 rounded-md border border-slate-200 dark:border-slate-700/60 shadow-2xs">
                        Enter ↵
                      </kbd>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSearch(searchQuery)}
                  aria-label={t("search_btn")}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all duration-200 active:scale-95 shrink-0 cursor-pointer ring-1 ring-inset ring-white/20"
                >
                  <Sparkles className="size-4 text-blue-200" />
                  <span className="hidden sm:inline">{t("search_btn")}</span>
                </button>
              </div>
            </div>

            {/* Quick Example Searches */}
            {(!hasSearched || !searchQuery.trim()) && (
              <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium px-1">
                  <Sparkles className="size-3.5 text-blue-500 dark:text-blue-400" />
                  <span>{isAr ? "شائع للبحث:" : "Trending Searches:"}</span>
                </span>
                {[
                  { code: "212", label: "212 NYC" },
                  { code: "310", label: "310 LA" },
                  { code: "312", label: "312 Chicago" },
                  { code: "415", label: "415 SF" },
                  { code: "305", label: "305 Miami" },
                  { code: "416", label: "416 Toronto" },
                  { code: "800", label: "800 Toll-Free", isSpecial: true },
                  { code: "876", label: "876 Fraud Risk", isRisk: true },
                ].map((chip) => (
                  <button
                    key={chip.code}
                    type="button"
                    onClick={() => handleSearch(chip.code)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all duration-150 cursor-pointer active:scale-95 ${
                      chip.isRisk
                        ? "bg-rose-500/10 border-rose-400/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 hover:border-rose-400/50"
                        : chip.isSpecial
                        ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/50"
                        : "bg-white/80 dark:bg-slate-900/60 border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 shadow-2xs"
                    }`}
                  >
                    {chip.isRisk && <span className="size-1.5 rounded-full bg-rose-500" />}
                    {chip.isSpecial && <span className="size-1.5 rounded-full bg-emerald-500" />}
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Live Telemetry & Feature Trust Strip */}
            {(!hasSearched || !searchQuery.trim()) && (
              <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-200/70 dark:border-slate-800/70 flex flex-wrap items-center justify-center gap-y-3 gap-x-6 sm:gap-x-9 text-xs text-slate-600 dark:text-slate-400">
                <div className="inline-flex items-center gap-2 font-medium">
                  <Shield className="size-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>{isAr ? "460+ مفتاح اتصال موثق (NANPA)" : "460+ Real NPAs Synced"}</span>
                </div>
                <div className="inline-flex items-center gap-2 font-medium">
                  <Clock className="size-4 text-blue-500 dark:text-blue-400 shrink-0" />
                  <span>{isAr ? "ساعات TCPA القانونية المباشرة" : "Live TCPA Compliance Clocks"}</span>
                </div>
                <div className="inline-flex items-center gap-2 font-medium">
                  <AlertTriangle className="size-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span>{isAr ? "كشف احتيال وتكلفة الأرقام الدولية" : "High-Risk Offshore Detection"}</span>
                </div>
                <div className="inline-flex items-center gap-2 font-medium">
                  <Zap className="size-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                  <span>{isAr ? "استجابة فورية فائقة السرعة" : "Sub-millisecond Resolution"}</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </section>

      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-card border border-primary/40 px-4 py-2.5 text-sm font-semibold text-primary shadow-xl glow-ring animate-in fade-in slide-in-from-bottom-3">
          {copiedToast}
        </div>
      )}

      {/* Main Body Content */}
      <main ref={mainContentRef} className={`flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 ${hasSearched && searchQuery.trim() ? "py-4 sm:py-5" : "pt-6 pb-12 sm:pt-8 sm:pb-16"}`}>
        {/* =========================================================================
            TAB 1: INSTANT LOOKUP
        ========================================================================= */}
        {activeTab === "lookup" && (
          <div className="space-y-6 sm:space-y-8">
            {hasSearched && searchQuery.trim() ? (
              /* =========================================================================
                 SEARCH RESULTS VIEW (ACTIVE SEARCH)
              ========================================================================= */
              <div ref={heroResultsRef} className="scroll-mt-24 space-y-4 animate-in fade-in duration-300">
                {/* Phone Number Banner if Phone Detected */}
                {lookupResult.kind === "phone" && (
                  <div className="glass-panel p-4 sm:p-5 border-primary/40 flex flex-wrap items-center justify-between gap-4 rounded-2xl glow-ring">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                        {isAr ? "رقم هاتف متكامل تم تحليله" : "Normalized Telecommunications Record"}
                      </span>
                      <div className="mt-1 flex items-baseline gap-3">
                        <span className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                          {lookupResult.normalizedPhone}
                        </span>
                        <span className="text-sm font-mono text-muted-foreground">
                          {lookupResult.e164}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(lookupResult.e164 || "");
                          triggerToast(isAr ? "تم نسخ الرقم E.164" : "Copied E.164 phone number!");
                          logEngagementEvent({
                            action: "copy_phone",
                            target: lookupResult.e164 || lookupResult.normalizedPhone,
                          });
                        }}
                        className="px-3.5 py-2 rounded-xl bg-card hover:bg-primary/20 border border-border text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Copy className="size-3.5" />
                        <span>{isAr ? "نسخ E.164" : "Copy E.164"}</span>
                      </button>
                      <a
                        href={`tel:${lookupResult.e164}`}
                        className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 transition-all hover:brightness-110 active:scale-95"
                      >
                        <PhoneCall className="size-3.5" />
                        <span>{isAr ? "اتصال" : "Call"}</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Prefix Banner if 6-digit prefix detected */}
                {lookupResult.kind === "prefix" && (
                  <div className="glass-panel p-4 sm:p-5 border-primary/40 flex flex-wrap items-center justify-between gap-4 rounded-2xl glow-ring">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                        {isAr ? "بادئة المقسم المركزي (NPA-NXX Prefix)" : "Local Central Office Rate Center Prefix"}
                      </span>
                      <div className="mt-1 flex items-baseline gap-3">
                        <span className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                          {lookupResult.normalizedPhone}
                        </span>
                        <span className="text-sm font-mono text-muted-foreground">
                          NPA: {lookupResult.npa} • Exchange: {lookupResult.nxx}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                        LERG Exchange Active
                      </span>
                    </div>
                  </div>
                )}

                {/* Results Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      <span>{isAr ? "نتيجة البحث والتحقق المباشر" : "Instant Verification & Results"}</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary">
                        {lookupResult.matches.length} {lookupResult.matches.length === 1 ? (isAr ? "نتيجة" : "match") : (isAr ? "نتائج" : "matches")}
                      </span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isAr
                        ? "بيانات التوقيت والولاية والمشغل ونوافذ الاتصال القانونية المعتمدة"
                        : "Jurisdiction, TCPA safe calling windows, facility carriers and live local clocks."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {lookupResult.matches.length > 0 && (
                      <button
                        onClick={() => {
                          const rows = lookupResult.matches.map((m) => ({
                            code: m.code,
                            state: m.regionName,
                            cities: m.cities.join(", "),
                            carrier: m.carrier || carrierFor(m.code, m.country),
                            timezone: m.tzLabel,
                            risk: m.risk,
                            mandatory10Digit: m.mandatory10Digit,
                          }));
                          exportCsv(rows, `entec-lookup-${searchQuery}.csv`);
                          triggerToast(isAr ? "تم تصدير النتائج" : "Exported lookup results!");
                        }}
                        className="px-3 py-1.5 rounded-xl border border-border/80 bg-card hover:bg-accent text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="size-3.5" />
                        <span>{t("export_csv")}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setHasSearched(false);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-border/80 bg-card hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium text-muted-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={isAr ? "إلغاء البحث والعودة للدليل" : "Clear search and return to landing overview"}
                    >
                      <X className="size-3.5" />
                      <span>{isAr ? "إلغاء البحث" : "Clear Search"}</span>
                    </button>
                  </div>
                </div>

                {/* Empty State when Search Yields 0 Matches */}
                {lookupResult.matches.length === 0 && (
                  <div className="glass-panel p-8 sm:p-12 text-center rounded-3xl border border-dashed border-border/90">
                    <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <HelpCircle className="size-8 opacity-80" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {isAr ? `لا توجد نتائج مطابقة لـ "${searchQuery}"` : `No matching records found for "${searchQuery}"`}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto mt-2 leading-relaxed">
                      {isAr
                        ? `لم نتمكن من العثور على مفتاح أو ولاية أو مدينة تطابق هذا الإدخال. جرب البحث برمز مكون من 3 أرقام مثل 212 أو 310 أو 800 أو اسم ولاية.`
                        : `No registered North American area code matches this query. Try a 3-digit NPA (e.g. 212, 310, 800), full phone number, or state/city name.`}
                    </p>
                    <div className="mt-5 flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleSearch("212")}
                        className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold cursor-pointer active:scale-95"
                      >
                        212 (Manhattan NY)
                      </button>
                      <button
                        onClick={() => handleSearch("310")}
                        className="px-3.5 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-semibold border border-border cursor-pointer active:scale-95"
                      >
                        310 (Los Angeles CA)
                      </button>
                      <button
                        onClick={() => handleSearch("800")}
                        className="px-3.5 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-semibold border border-border cursor-pointer active:scale-95"
                      >
                        800 (Toll-Free)
                      </button>
                      <button
                        onClick={() => handleSearch("416")}
                        className="px-3.5 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-semibold border border-border cursor-pointer active:scale-95"
                      >
                        416 (Toronto ON)
                      </button>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border/50">
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setHasSearched(false);
                        }}
                        className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                      >
                        {isAr ? "← العودة إلى ملخص ودليل الصفحة الرئيسية" : "← Return to Homepage Overview & Directory"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Results: Side-by-side Card on Left, Leaflet Map on Right */}
                {lookupResult.matches.length > 0 && activeHeroMatch && (
                  <div className="space-y-4">
                    {lookupResult.matches.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                        <span className="text-xs font-mono font-bold uppercase text-slate-400 shrink-0">
                          {isAr ? "المفاتيح المطابقة:" : "Matching Codes:"}
                        </span>
                        {lookupResult.matches.map((m, idx) => (
                          <button
                            key={`tab-m-${m.code}-${m.region}`}
                            onClick={() => setSelectedHeroMatchIdx(idx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 border ${selectedHeroMatchIdx === idx
                                ? "bg-primary/20 text-primary border-primary/40 shadow-xs"
                                : "bg-card hover:bg-card/80 border-border text-foreground/80"
                              }`}
                          >
                            {m.code} • {m.region}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
                      <AreaCodeCard
                        key={`tab-card-${activeHeroMatch.code}-${activeHeroMatch.region}`}
                        item={activeHeroMatch}
                        now={now}
                        isFav={favorites.includes(activeHeroMatch.code)}
                        onToggleFavorite={toggleFavorite}
                        onCopyDossier={copyDossierHandler}
                        onInspectCode={handleSearch}
                        onNavigateToRadar={() => setActiveTab("map")}
                        isAr={isAr}
                        t={t}
                      />

                      <AreaCodeMapCard
                        key={`tab-map-${activeHeroMatch.code}-${activeHeroMatch.region}`}
                        item={activeHeroMatch}
                        t={t}
                        isAr={isAr}
                        onNavigateToRadar={() => setActiveTab("map")}
                      />
                    </div>

                    {/* Regional Telecommunications Guide Section */}
                    <AreaCodeNarrativeSection
                      narrative={activeNarrative ?? null}
                      isLoading={isNarrativeLoading}
                      isAr={isAr}
                    />

                    {/* Google AdSense: Post-Search Result Banner */}
                    <GoogleAdBanner format="horizontal" />
                  </div>
                )}
              </div>
            ) : (
              /* =========================================================================
                 COMPREHENSIVE LANDING PAGE CONTENT (EDITORIAL HIERARCHY)
              ========================================================================= */
              <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-500">
                {/* SECTION 2: HIGH-VOLUME & TRENDING AREA CODES GRID */}
                <div>
                  <div className="flex flex-col gap-2 mb-6">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                      <Sparkles className="size-3.5" />
                      <span>{isAr ? "المراكز الهاتفية الأكثر نشاطاً" : "High-Volume Telephony Hubs"}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-foreground tracking-tight">
                      {isAr ? "ساعات حية مباشرة للمناطق الكبرى" : "Explore Live Telecommunications Clocks"}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed font-normal">
                      {isAr
                        ? "ساعات حية دقيقة ومطابقة قانونية لحظية لنوافذ الاتصال لكل ولاية ومقاطعة."
                        : "Live local clocks, dominant carriers, and TCPA legality computed in real time."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {(showAllClocks ? POPULAR_NPAS : POPULAR_NPAS.slice(0, 4)).map((p) => {
                      const item = activeAreaCodeMap[p.code]?.[0];
                      if (!item) return null;
                      const clock = localTime(item.timezone, now);
                      const win = callingWindow(clock.hour);

                      return (
                        <div
                          key={p.code}
                          className="group relative rounded-3xl bg-white dark:bg-card/90 border border-slate-200/90 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 p-6 shadow-sm dark:shadow-none hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between space-y-5"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="font-mono text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                                  {p.code}
                                </span>
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10">
                                  {item.country}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 font-semibold border border-slate-200/60 dark:border-white/10">
                                {item.tzLabel}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h3 className="font-bold text-sm text-foreground truncate" title={isAr ? p.nameAr : p.nameEn}>
                                {isAr ? p.nameAr : p.nameEn}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-300 truncate" title={item.cities.join(", ")}>
                                {item.cities.slice(0, 2).join(", ")}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3.5 border-t border-slate-100 dark:border-white/10 space-y-3.5">
                            {/* Live Time & TCPA Status */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono font-bold text-foreground">
                                {clock.time}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${
                                  item.risk
                                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                                    : win.status === "good"
                                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                      : "bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30"
                                }`}
                              >
                                <span
                                  className={`size-1.5 rounded-full ${
                                    item.risk
                                      ? "bg-rose-500"
                                      : win.status === "good"
                                        ? "bg-emerald-500"
                                        : "bg-slate-400"
                                  }`}
                                />
                                <span>
                                  {item.risk
                                    ? (isAr ? "احتيال" : "Fraud Risk")
                                    : win.status === "good"
                                      ? (isAr ? "مسموح" : "Safe")
                                      : (isAr ? "مغلق" : "Closed")}
                                </span>
                              </span>
                            </div>

                            <button
                              onClick={() => handleSearch(p.code)}
                              className="btn-secondary w-full text-xs py-2"
                            >
                              <span>{isAr ? "فحص الكود" : "Inspect Dossier"}</span>
                              <span className="text-[11px] group-hover:translate-x-0.5 transition-transform">→</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex justify-center">
                    <button
                      onClick={() => setShowAllClocks(!showAllClocks)}
                      className="btn-secondary px-5 py-2.5 text-xs"
                    >
                      {showAllClocks ? (
                        <>
                          <span>{isAr ? "عرض أقل (4 مراكز رئيسية)" : "Show Less (4 Primary Hubs)"}</span>
                          <ChevronUp className="size-3.5" />
                        </>
                      ) : (
                        <>
                          <span>{isAr ? "عرض المزيد (4 مراكز إضافية)" : "Explore 4 More Telephony Hubs"}</span>
                          <ChevronDown className="size-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 dark:border-white/10" />

                {/* SECTION 3: ENTERPRISE EDITORIAL ASYMMETRIC SPLIT */}
                <EnterpriseEditorialSplit
                  onInspectCode={handleSearch}
                  onNavigateToConverter={() => {
                    setActiveTab("converter");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onNavigateToBulk={() => {
                    setActiveTab("bulk");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  isAr={isAr}
                />

                <div className="border-t border-slate-200/80 dark:border-white/10" />

                {/* SECTION 4: INVERTED DARK EDITORIAL SECTION ("NUMBERS TELL THE STORY") */}
                <InvertedNumbersSection
                  onSelectCode={handleSearch}
                  isAr={isAr}
                />

                <div className="border-t border-slate-200/80 dark:border-white/10" />

                {/* SECTION 5: VISUAL OPERATIONS RADAR BANNER */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/95 p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/40 dark:shadow-2xl dark:shadow-black/40">
                  {/* Subtle Ambient Depth Glows */}
                  <div className="pointer-events-none absolute -right-24 -top-24 size-80 bg-primary/10 blur-[90px] rounded-full" />
                  <div className="pointer-events-none absolute -left-24 -bottom-24 size-80 bg-indigo-500/10 blur-[90px] rounded-full" />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
                    <div className="lg:col-span-7 space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono font-bold text-primary shadow-xs">
                        <Navigation className="size-3.5" />
                        <span>{isAr ? "غرفة عمليات الاتصالات التفاعلية" : "VISUAL OPERATIONS RADAR ROOM"}</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {isAr ? "خريطة جغرافية حية لمناطق التوقيت والمفاتيح الهاتفية" : "Interactive North American Telecom & Timezone Map"}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-normal">
                        {isAr
                          ? "استكشف خرائط التغطية وتوزيع النطاقات الزمنية (الشرقي، المركزي، الجبلي، الهادئ، ألاسكا، وهاواي) مع تحديد مراكز الخدمة على خريطة Leaflet تفاعلية حية."
                          : "Visualize area code density across Eastern, Central, Mountain, Pacific, Alaska and Hawaii zones with live geocoded coordinate rate centers on our operations radar."}
                      </p>

                      {/* Telecom Capability Badges */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 font-medium">
                          <span className="size-1.5 rounded-full bg-emerald-400" />
                          {isAr ? "460+ مقسم جغرافي محدد" : "460+ Geocoded Rate Centers"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 font-medium">
                          <span className="size-1.5 rounded-full bg-primary" />
                          {isAr ? "9 نطاقات توقيت متزامنة" : "9 Synchronized Zones"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 font-medium">
                          <span className="size-1.5 rounded-full bg-amber-400" />
                          {isAr ? "محرك خرائط تفاعلي فائق الدقة" : "Leaflet Vector Engine"}
                        </span>
                      </div>

                      <div className="pt-3 flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => {
                            setActiveTab("map");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="btn-primary"
                        >
                          <Globe2 className="size-4" />
                          <span>{isAr ? "تشغيل الخريطة التفاعلية" : "Launch Telecom Map"}</span>
                          <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab("browse");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="btn-secondary"
                        >
                          <Layers className="size-4" />
                          <span>{isAr ? "استعراض 460+ مفتاح" : "Browse All 460+ NPAs"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Rich Visual Operations Image Preview */}
                    <div className="lg:col-span-5">
                      <div
                        onClick={() => {
                          setActiveTab("map");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="group relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/15 bg-slate-950 shadow-2xl hover:border-primary/50 transition-all duration-300 cursor-pointer"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src="/images/operations-room.webp"
                            alt="Telecom Operations Center Radar"
                            className="w-full h-full object-cover brightness-105 contrast-110 saturate-110 group-hover:scale-105 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white font-bold">
                            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>LIVE TELEMETRY RADAR</span>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-900/95 dark:bg-slate-950 border-t border-slate-200/20 dark:border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                              <Globe2 className="size-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">
                                {isAr ? "الخريطة التفاعلية المتكاملة" : "Interactive Telecom Radar"}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {isAr ? "اضغط لفتح الخريطة بالكامل" : "Click to expand full map"}
                              </div>
                            </div>
                          </div>
                          <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground font-mono text-xs font-bold transition-colors flex items-center gap-1">
                            <span>{isAr ? "فتح الخريطة" : "Open Map"}</span>
                            <span>→</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TRUST & REGULATORY AUTHORITIES BAR */}
                <TrustBar isAr={isAr} />

                {/* Google AdSense: Mid-Page Leaderboard */}
                <GoogleAdBanner format="horizontal" className="my-8" />

                {/* SECTION 5: OUTBOUND COMPLIANCE PROTOCOL (3 STEPS) */}
                <div>
                  <div className="text-center max-w-xl mx-auto mb-6">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      {isAr ? "كيف تعمل المنظومة" : "Operational Protocol"}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-foreground tracking-tight mt-1">
                      {isAr ? "3 خطوات للاتصال الآمن المتوافق قانونياً" : "Three Steps to Confident, Compliant Outreach"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-white dark:bg-card/60 border border-slate-200/90 dark:border-border/70 p-5 space-y-2.5 shadow-sm shadow-slate-200/50 dark:shadow-2xs">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary font-mono font-bold text-sm flex items-center justify-center border border-primary/20">
                        01
                      </div>
                      <h3 className="font-bold text-sm text-foreground">
                        {isAr ? "إدخال المفتاح أو الرقم أو القائمة" : "Input NPA, Number or Batch"}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                        {isAr
                          ? "أدخل كود المنطقة المكون من 3 أرقام أو رقماً هاتفياً كاملاً، أو الصق ملف بيانات العملاء في مستخرج الأرقام."
                          : "Type any 3-digit area code, full telephone number, or drop your CRM lead list into the bulk extraction workspace."}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white dark:bg-card/60 border border-slate-200/90 dark:border-border/70 p-5 space-y-2.5 shadow-sm shadow-slate-200/50 dark:shadow-2xs">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary font-mono font-bold text-sm flex items-center justify-center border border-primary/20">
                        02
                      </div>
                      <h3 className="font-bold text-sm text-foreground">
                        {isAr ? "فحص التوقيت والامتثال لـ TCPA" : "Verify TCPA & Fraud Score"}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                        {isAr
                          ? "يقوم المحرك فورياً باحتساب التوقيت المحلي الفعلي للمستلم وتأكيد ما إذا كان يقع ضمن نافذة الاتصال القانونية المسموحة."
                          : "Our engine synchronizes with local rate-center clocks to evaluate TCPA legality (8 AM – 9 PM) and screens against Wangiri fraud."}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white dark:bg-card/60 border border-slate-200/90 dark:border-border/70 p-5 space-y-2.5 shadow-sm shadow-slate-200/50 dark:shadow-2xs">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary font-mono font-bold text-sm flex items-center justify-center border border-primary/20">
                        03
                      </div>
                      <h3 className="font-bold text-sm text-foreground">
                        {isAr ? "الاتصال أو تصدير البيانات النظيفة" : "Execute Outreach or Export"}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                        {isAr
                          ? "باشر الاتصال بثقة مطلقة ودون خوف من الغرامات، أو قم بتصدير ملفات الأرقام المنسقة إلى Excel أو CSV."
                          : "Connect with recipients knowing you're fully compliant, or download clean, standardized lead dossiers to CSV or Excel."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 6: QUICK ACCESS (FAVORITES & RECENTS) */}
                {(favorites.length > 0 || recents.length > 0) && (
                  <div className="rounded-2xl bg-card/40 border border-border/60 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-muted-foreground flex items-center gap-1">
                        <History className="size-3.5" />
                        <span>{isAr ? "عمليات بحث ومفضلات سريعة:" : "Quick Access:"}</span>
                      </span>
                      {favorites.map((code) => (
                        <button
                          key={`fav-${code}`}
                          onClick={() => handleSearch(code)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 font-mono font-bold flex items-center gap-1 cursor-pointer hover:bg-amber-500/20"
                        >
                          <Star className="size-3 fill-amber-500" />
                          <span>{code}</span>
                        </button>
                      ))}
                      {recents.slice(0, 5).map((query) => (
                        <button
                          key={`rec-${query}`}
                          onClick={() => handleSearch(query)}
                          className="px-2.5 py-1 rounded-lg bg-muted border border-border text-foreground font-mono cursor-pointer hover:bg-muted/80"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("saved");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-primary hover:underline font-semibold cursor-pointer"
                    >
                      {isAr ? "عرض كل المحفوظات ←" : "View All Saved →"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: BROWSE DATABASE (460+ AREA CODES)
        ========================================================================= */}
        {activeTab === "browse" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {isAr ? "قاعدة بيانات مفاتيح أمريكا الشمالية كاملة" : "North American Area Code Registry"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr
                    ? "استعراض والبحث في كافة الرموز الـ 460+ مع التصدير إلى إكسل و CSV"
                    : "Complete registry of 460+ real NPAs with live calling windows, carriers, overlays, and exports."}
                </p>
              </div>

              {/* Export Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const rows = filteredBrowse.map((a) => ({
                      AreaCode: a.code,
                      Region: a.regionName,
                      Abbr: a.region,
                      Country: a.country,
                      Cities: a.cities.join("; "),
                      Timezone: a.tzLabel,
                      DominantCarrier: a.carrier || carrierFor(a.code, a.country),
                      Overlays: a.overlays.join(", "),
                      Mandatory10Digit: a.mandatory10Digit ? "YES" : "NO",
                      HighRiskFraud: a.risk ? "YES" : "NO",
                    }));
                    exportXlsx(rows, "entec-area-codes.xlsx");
                    triggerToast(isAr ? "تم تصدير ملف إكسل بنجاح!" : "Exported Excel file successfully!");
                  }}
                  className="px-3 py-2 rounded-xl bg-card hover:bg-primary/20 border border-border text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="size-4 text-emerald-400" />
                  <span>{t("export_xlsx")}</span>
                </button>

                <button
                  onClick={() => {
                    const rows = filteredBrowse.map((a) => ({
                      AreaCode: a.code,
                      Region: a.regionName,
                      Abbr: a.region,
                      Country: a.country,
                      Cities: a.cities.join("; "),
                      Timezone: a.tzLabel,
                      DominantCarrier: a.carrier || carrierFor(a.code, a.country),
                      Overlays: a.overlays.join(", "),
                      Mandatory10Digit: a.mandatory10Digit ? "YES" : "NO",
                      HighRiskFraud: a.risk ? "YES" : "NO",
                    }));
                    exportCsv(rows, "entec-area-codes.csv");
                    triggerToast(isAr ? "تم تصدير CSV بنجاح!" : "Exported CSV successfully!");
                  }}
                  className="px-3 py-2 rounded-xl bg-card hover:bg-primary/20 border border-border text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="size-4 text-primary" />
                  <span>{t("export_csv")}</span>
                </button>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center gap-3">
              {/* Search Inside Table */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={browseQuery}
                  onChange={(e) => {
                    setBrowseQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={isAr ? "فلترة حسب المفتاح، الولاية، أو المدينة أو المشغل..." : "Filter by NPA, state, city, or carrier..."}
                  className="w-full bg-card/60 pl-9 pr-3 py-2 text-xs rounded-xl border border-border/70 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Country Filter */}
              <div className="flex items-center gap-1 bg-card/60 p-1 rounded-xl border border-border/70 text-xs">
                {(["ALL", "US", "CA", "CARIB", "TF"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCountryFilter(c);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${countryFilter === c
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {c === "ALL" ? t("all") : c === "US" ? "🇺🇸 US" : c === "CA" ? "🇨🇦 CA" : c === "TF" ? "📞 Toll-Free" : "⚠️ Fraud"}
                  </button>
                ))}
              </div>

              {/* Timezone Filter */}
              <select
                value={tzFilter}
                onChange={(e) => {
                  setTzFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-card/60 px-3 py-2 text-xs rounded-xl border border-border/70 text-foreground focus:outline-none cursor-pointer"
              >
                {TIMEZONES_LIST.map((tz) => (
                  <option key={tz.id} value={tz.id}>
                    {tz.label}
                  </option>
                ))}
              </select>

              {/* TCPA Calling Window Filter */}
              <select
                value={callStatusFilter}
                onChange={(e) => {
                  setCallStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="bg-card/60 px-3 py-2 text-xs rounded-xl border border-border/70 text-foreground focus:outline-none cursor-pointer"
              >
                <option value="ALL">TCPA: All Hours</option>
                <option value="good">🟢 Safe to Call Now (9am–8pm)</option>
                <option value="caution">🟡 Borderline Window (8am/8pm)</option>
                <option value="blocked">🔴 Outside Permitted Hours</option>
              </select>
            </div>

            {/* Results Count Summary */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                {isAr
                  ? `عرض ${paginatedBrowse.length} من أصل ${filteredBrowse.length} مفتاح مسجل`
                  : `Showing ${paginatedBrowse.length} of ${filteredBrowse.length} matching area codes`}
              </span>
              <span>
                {isAr ? `صفحة ${currentPage} من ${totalBrowsePages}` : `Page ${currentPage} of ${totalBrowsePages}`}
              </span>
            </div>

            {/* Data Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-border/70">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-card/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                      <th
                        onClick={() => toggleSort("code")}
                        className="py-3.5 px-4 cursor-pointer hover:text-foreground select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>NPA</span>
                          {sortField === "code" && (sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort("regionName")}
                        className="py-3.5 px-4 cursor-pointer hover:text-foreground select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>{t("state")}</span>
                          {sortField === "regionName" && (sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                        </div>
                      </th>
                      <th className="py-3.5 px-4">{t("city")}</th>
                      <th
                        onClick={() => toggleSort("timezone")}
                        className="py-3.5 px-4 cursor-pointer hover:text-foreground select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>{t("timezone")}</span>
                          {sortField === "timezone" && (sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                        </div>
                      </th>
                      <th className="py-3.5 px-4">{t("localtime")}</th>
                      <th className="py-3.5 px-4">{t("callwindow")}</th>
                      <th
                        onClick={() => toggleSort("carrier")}
                        className="py-3.5 px-4 cursor-pointer hover:text-foreground select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>{t("carrier")}</span>
                          {sortField === "carrier" && (sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                        </div>
                      </th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-medium">
                    {paginatedBrowse.map((a) => {
                      const clock = localTime(a.timezone, now);
                      const win = callingWindow(clock.hour);
                      const carrier = a.carrier || carrierFor(a.code, a.country);
                      const isFav = favorites.includes(a.code);

                      return (
                        <tr
                          key={`${a.code}-${a.region}`}
                          className="hover:bg-card/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-sm text-primary flex items-center gap-1.5">
                            <button
                              onClick={() => toggleFavorite(a.code)}
                              className="text-muted-foreground hover:text-amber-400 cursor-pointer"
                            >
                              <Star className={`size-3.5 ${isFav ? "fill-amber-400 text-amber-400" : ""}`} />
                            </button>
                            <span
                              onClick={() => handleSearch(a.code)}
                              className="hover:underline cursor-pointer"
                            >
                              {a.code}
                            </span>
                            {a.risk && (
                              <span
                                className="size-2 rounded-full bg-rose-500"
                                title="Caribbean One-Ring Scam Risk"
                              />
                            )}
                          </td>
                          <td className="py-3 px-4 text-foreground whitespace-nowrap">
                            <div className="font-semibold flex items-center gap-1">
                              <span>{a.regionName}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">({a.region})</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {a.country === "US"
                                ? "United States"
                                : a.country === "CA"
                                  ? "Canada"
                                  : a.country === "TF"
                                    ? "Toll-Free"
                                    : "Offshore Risk"}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground max-w-xs truncate" title={a.cities.join(", ")}>
                            {a.cities.join(", ")}
                          </td>
                          <td className="py-3 px-4 text-foreground/80 font-mono text-[11px] whitespace-nowrap">
                            {a.tzLabel}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap" suppressHydrationWarning>
                            {clock.time}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${win.status === "good"
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : win.status === "caution"
                                    ? "bg-amber-500/15 text-amber-400"
                                    : "bg-rose-500/15 text-rose-400"
                                }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${win.status === "good"
                                    ? "bg-emerald-400"
                                    : win.status === "caution"
                                      ? "bg-amber-400"
                                      : "bg-rose-500"
                                  }`}
                              />
                              {win.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground font-mono text-[11px] max-w-[170px] truncate" title={carrier}>
                            {carrier}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleSearch(a.code)}
                              className="px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-[11px] font-semibold cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalBrowsePages > 1 && (
                <div className="border-t border-border/80 px-4 py-3 bg-card/60 flex items-center justify-between">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold disabled:opacity-40 hover:bg-muted cursor-pointer"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1 text-xs font-mono">
                    {Array.from({ length: Math.min(totalBrowsePages, 7) }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`size-7 rounded-lg text-xs font-medium cursor-pointer ${currentPage === pageNum
                              ? "bg-primary text-primary-foreground font-bold"
                              : "text-muted-foreground hover:bg-card"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalBrowsePages > 7 && <span className="text-muted-foreground">...</span>}
                  </div>
                  <button
                    disabled={currentPage >= totalBrowsePages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalBrowsePages))}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold disabled:opacity-40 hover:bg-muted cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: BULK EXTRACTOR & CLEANSER
        ========================================================================= */}
        {activeTab === "bulk" && (
          <BulkExtractorTab isAr={isAr} t={t} onNavigateLookup={handleSearch} />
        )}

        {/* =========================================================================
            TAB 4: TIMEZONE MAP & REGIONAL LIVE CLOCKS
        ========================================================================= */}
        {activeTab === "map" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {isAr ? "غرفة عمليات وخرائط المناطق الزمنية في أمريكا الشمالية" : "North American Telecom Coverage & Timezone Operations Room"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr
                    ? "خرائط توزيع مفاتيح الاتصال المعتمدة ومزامنة مباشرة على مدار الثانية لكل منطقة زمنية لتحديد قانونية الاتصال بموجب تشريعات FCC و TCPA."
                    : "High-resolution telecom coverage maps and live second-by-second synchronization across all 12 North American zones."}
                </p>
              </div>

            </div>

            {/* Real Interactive Telecom Coverage Map Engine */}
            <Suspense fallback={<div className="h-[500px] w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-[2rem]"><div className="animate-pulse text-slate-400">Loading Map...</div></div>}>
<InteractiveTelecomMap
              initialRegion={activeMap === "ca" ? "ca" : "us"}
              onSelectCode={(code) => {
                setSearchQuery(code);
                setHasSearched(true);
                setSelectedHeroMatchIdx(0);
                setActiveTab("lookup");
                heroResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />

            {/* Timezone Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {TIMEZONES_LIST.filter((tz) => tz.id !== "ALL").map((tz) => {
                const clock = localTime(tz.id, now);
                const win = callingWindow(clock.hour);
                const codesInTz = AREA_CODES.filter((a) => a.timezone === tz.id);

                return (
                  <div
                    key={tz.id}
                    className="glass-panel p-5 rounded-2xl border border-border/70 flex flex-col justify-between hover-lift"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-lg font-bold text-foreground">
                            {tz.label}
                          </h3>
                          <span className="text-xs text-muted-foreground font-mono">
                            {tz.id} • {clock.offset}
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${win.status === "good"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : win.status === "caution"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                        >
                          {win.label}
                        </span>
                      </div>

                      {/* Large Digital Clock */}
                      <div className="mt-4 p-4 rounded-xl bg-card/80 border border-border/60 text-center">
                        <div className="font-mono text-3xl font-black text-foreground tracking-tight" suppressHydrationWarning>
                          {clock.time}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
                          {clock.date}
                        </div>
                      </div>

                      {/* Info & Cities */}
                      <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                        <div>
                          <span className="font-semibold text-foreground">Hub Cities: </span>
                          <span>{tz.sampleCity}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Active NPAs: </span>
                          <span>{codesInTz.length} codes registered</span>
                        </div>
                      </div>
                    </div>

                    {/* Area Code Samples */}
                    <div className="mt-5 pt-3 border-t border-border/60">
                      <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                        Sample Area Codes:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {codesInTz.slice(0, 8).map((a) => (
                          <button
                            key={a.code}
                            onClick={() => handleSearch(a.code)}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-card hover:bg-primary/20 hover:text-primary transition-colors border border-border/60 cursor-pointer"
                          >
                            {a.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: COMPARE AREA CODES
        ========================================================================= */}
        {activeTab === "compare" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {isAr ? "مقارنة مفاتيح المناطق جنباً إلى جنب" : "Side-by-Side Area Code Comparison Engine"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "مقارنة الفارق الزمني الحقيقي، والمشغل المعتمد، ونوافذ الاتصال المتداخلة، والتغطية الجغرافية وشبكات التراكب بين أي رمزين."
                  : "Benchmark time offsets, mutual TCPA legal calling overlap, carrier topology, and relief overlays between any two NPAs."}
              </p>
            </div>

            {/* Preset Quick Comparisons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground">Popular Comparisons:</span>
              {[
                { a: "212", b: "310", label: "212 (NY) vs 310 (LA)" },
                { a: "305", b: "312", label: "305 (Miami) vs 312 (Chicago)" },
                { a: "416", b: "604", label: "416 (Toronto) vs 604 (Vancouver)" },
                { a: "800", b: "223", label: "800 (Toll-Free) vs 223 (PA)" },
                { a: "876", b: "212", label: "876 (Jamaica Scam) vs 212 (US)" },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setCompareCodeA(p.a);
                    setCompareCodeB(p.b);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-card hover:bg-primary/20 hover:text-primary border border-border text-xs font-medium transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Selector Bar */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Area Code #1
                </label>
                <select
                  value={compareCodeA}
                  onChange={(e) => setCompareCodeA(e.target.value)}
                  className="w-full bg-card px-3 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground focus:outline-none cursor-pointer"
                >
                  {AREA_CODES.map((a) => (
                    <option key={`a-${a.code}-${a.region}`} value={a.code}>
                      {a.code} — {a.regionName} ({a.cities[0]})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSwapCompare}
                className="p-3 mt-4 sm:mt-5 rounded-xl bg-card hover:bg-primary hover:text-primary-foreground border border-border transition-colors cursor-pointer"
                title="Swap area codes"
              >
                <ArrowRightLeft className="size-4" />
              </button>

              <div className="flex-1 w-full">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Area Code #2
                </label>
                <select
                  value={compareCodeB}
                  onChange={(e) => setCompareCodeB(e.target.value)}
                  className="w-full bg-card px-3 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground focus:outline-none cursor-pointer"
                >
                  {AREA_CODES.map((a) => (
                    <option key={`b-${a.code}-${a.region}`} value={a.code}>
                      {a.code} — {a.regionName} ({a.cities[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Analytical Metrics Highlight */}
            {compareMetrics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass p-4 rounded-2xl border border-border/80 text-center">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Timezone Differential
                  </span>
                  <div className="font-display text-lg sm:text-xl font-bold text-primary mt-1">
                    {compareMetrics.offsetText}
                  </div>
                  <span className="text-xs text-muted-foreground block mt-1">
                    {codeAData?.tzLabel} vs {codeBData?.tzLabel}
                  </span>
                </div>

                <div className="glass p-4 rounded-2xl border border-border/80 text-center">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Mutual TCPA Calling Curfew Status
                  </span>
                  <div className={`font-display text-lg sm:text-xl font-bold mt-1 ${compareMetrics.bothSafe ? "text-emerald-400" : "text-amber-400"
                    }`}>
                    {compareMetrics.bothSafe ? "Mutual Calling Permitted Now" : "Curfew In Effect For One Region"}
                  </div>
                  <span className="text-xs text-muted-foreground block mt-1">
                    {codeAData?.code} ({compareMetrics.winA.label}) • {codeBData?.code} ({compareMetrics.winB.label})
                  </span>
                </div>
              </div>
            )}

            {/* Comparison Cards Side-by-Side */}
            {codeAData && codeBData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[codeAData, codeBData].map((item, idx) => {
                  const clock = localTime(item.timezone, now);
                  const win = callingWindow(clock.hour);
                  const carrier = item.carrier || carrierFor(item.code, item.country);

                  return (
                    <div
                      key={item.code}
                      className="glass-panel p-6 rounded-2xl border border-border/80 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-display text-4xl font-black text-primary">
                            {item.code}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-card border border-border text-muted-foreground">
                            Candidate #{idx + 1}
                          </span>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div className="p-3 rounded-xl bg-card/60 border border-border/60">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                              Live Local Clock & TCPA Status
                            </span>
                            <div className="mt-1 font-mono text-2xl font-bold text-foreground" suppressHydrationWarning>
                              {clock.time}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={`size-2 rounded-full ${win.status === "good" ? "bg-emerald-400" : win.status === "caution" ? "bg-amber-400" : "bg-rose-500"
                                  }`}
                              />
                              <span className="font-semibold text-foreground">{win.label}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-card/40 border border-border/40">
                              <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                                Region
                              </span>
                              <span className="font-bold text-foreground text-sm">
                                {item.regionName} ({item.region})
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-card/40 border border-border/40">
                              <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                                Timezone
                              </span>
                              <span className="font-bold text-foreground text-sm">
                                {item.tzLabel}
                              </span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-card/40 border border-border/40">
                            <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                              Dominant Facilities Carrier
                            </span>
                            <span className="font-mono text-foreground text-xs">{carrier}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-card/40 border border-border/40">
                            <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                              Active Overlays
                            </span>
                            <span className="text-foreground text-xs font-mono">
                              {item.overlays.length > 0 ? item.overlays.join(", ") : "None (Single NPA Region)"}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-card/40 border border-border/40">
                            <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                              Major Coverage Cities
                            </span>
                            <span className="text-foreground text-xs">{item.cities.join(", ")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border/60">
                        <button
                          onClick={() => handleSearch(item.code)}
                          className="w-full py-2.5 rounded-xl bg-card hover:bg-primary hover:text-primary-foreground border border-border text-xs font-semibold transition-all cursor-pointer"
                        >
                          View Full Telecom Intelligence
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB: WORLD & US TIME CONVERTER
        ========================================================================= */}
        {activeTab === "converter" && (
          <TimeConverterTab t={t} isAr={isAr} onNavigateLookup={handleSearch} />
        )}

        {/* =========================================================================
            TAB 6: FAVORITES & RECENTS
        ========================================================================= */}
        {activeTab === "saved" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {isAr ? "المفاتيح المفضلة وسجل البحث" : "Saved Favorites & Search History"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "وصول سريع للأرقام والمفاتيح التي تهمك محفوظة في متصفحك."
                  : "Quick access to your pinned area codes and recently analyzed telecommunications queries."}
              </p>
            </div>

            {/* Pinned Favorites */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Star className="size-4 text-amber-400 fill-amber-400" />
                  <span>{t("favorites")}</span>
                  <span className="text-xs font-mono text-muted-foreground">({favorites.length})</span>
                </h3>
              </div>

              {favorites.length === 0 ? (
                <div className="glass-panel p-8 text-center rounded-xl text-xs text-muted-foreground">
                  {isAr
                    ? "لم تقم بتفضيل أي مفتاح حتى الآن. انقر على أيقونة النجمة بجانب أي مفتاح لإضافته هنا."
                    : "No favorite area codes saved yet. Click the star icon on any card to pin it here."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((code) => {
                    const matches = AREA_CODE_MAP[code] ?? [];
                    const a = matches[0];
                    if (!a) return null;
                    const clock = localTime(a.timezone, now);

                    return (
                      <div
                        key={code}
                        className="glass-panel p-4 rounded-xl border border-border/70 flex items-center justify-between"
                      >
                        <div
                          onClick={() => handleSearch(code)}
                          className="cursor-pointer"
                        >
                          <div className="font-display text-2xl font-bold text-primary">
                            {code}
                          </div>
                          <div className="text-xs font-semibold text-foreground">
                            {a.regionName}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono" suppressHydrationWarning>
                            {clock.time} • {a.tzLabel}
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFavorite(code)}
                          className="p-2 rounded-lg text-amber-400 hover:bg-card cursor-pointer"
                          title="Remove bookmark"
                        >
                          <Star className="size-4 fill-amber-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recents */}
            <div className="space-y-3 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <History className="size-4 text-primary" />
                  <span>{t("recents")}</span>
                </h3>
                {recents.length > 0 && (
                  <button
                    onClick={() => {
                      setRecents([]);
                      localStorage.removeItem("entec:recents");
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="size-3" />
                    <span>{t("clear")}</span>
                  </button>
                )}
              </div>

              {recents.length === 0 ? (
                <div className="glass-panel p-6 text-center rounded-xl text-xs text-muted-foreground">
                  {isAr ? "لا توجد عمليات بحث سابقة." : "No recent searches recorded yet."}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {recents.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSearch(q)}
                      className="px-3 py-1.5 rounded-xl bg-card hover:bg-primary/20 border border-border text-xs font-mono font-medium text-foreground transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Google AdSense: Pre-Footer Banner */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <GoogleAdBanner format="auto" className="my-8" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
