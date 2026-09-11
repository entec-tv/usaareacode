import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Copy,
  PhoneCall,
  ShieldAlert,
  Star,
  Zap,
  Globe2,
  Navigation,
  MapPin,
  Radio,
  Layers,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Activity,
  Phone,
  Clock,
} from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { COMPANY } from "@/data/company";
import {
  AREA_CODES,
  AREA_CODE_MAP,
  carrierFor,
  type AreaCode,
} from "@/data/areaCodes";
import { getAreaCodeCoordinates } from "@/data/geoCoordinates";
import { localTime, callingWindow, lookup } from "@/lib/nanp";
import { fetchAreaCodesFromDb, adaptDbRecordToAreaCode, logEngagementEvent } from "@/lib/collections";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getAreaNarrative, generateAndSaveNarrative } from "@/lib/ai-narrative-service";

import { AreaCodeNarrativeSection } from "@/components/landing/AreaCodeNarrativeSection";
import { GoogleAdBanner } from "@/components/ads/GoogleAdBanner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const AreaCodeLeafletMap = lazy(() => import("@/components/map/AreaCodeLeafletMap").then(m => ({ default: m.AreaCodeLeafletMap })));

export const Route = createFileRoute("/$npa")({
  component: NpaRouteComponent,
  head: (ctx) => {
    const { npa } = ctx.params;
    const matches = AREA_CODE_MAP[npa] ?? [];
    const item = matches[0];
    
    if (!item) {
      return {
        meta: [
          { title: `${npa} Area Code Not Found | ${COMPANY.name}` },
          { name: "description", content: `No records found for area code ${npa}.` }
        ]
      };
    }

    const title = `${npa} Area Code - ${item.regionName} | Timezone & Carrier | ${COMPANY.brand}`;
    const description = `Instant lookup for the ${npa} area code in ${item.regionName}, ${item.country}. Check live TCPA calling windows, timezone (${item.tzLabel}), and dominant carrier details.`;
    const keywords = `area code ${npa}, ${npa} area code, ${item.regionName} area code, ${item.cities[0]} phone code, ${npa} timezone, ${npa} calling window`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description }
      ]
    };
  }
});

// Reusable Area Code Intelligence Dossier Card
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

function AreaCodeCard({
  item,
  now,
  isFav,
  onToggleFavorite,
  onCopyDossier,
  onInspectCode,
  isAr = false,
  t,
}: {
  item: AreaCode;
  now: Date;
  isFav: boolean;
  onToggleFavorite: (code: string) => void;
  onCopyDossier: (item: AreaCode) => void;
  onInspectCode?: ((code: string) => void) | undefined;
  isAr?: boolean | undefined;
  t: (k: string) => string;
}) {
  const clock = localTime(item.timezone, now);
  const [timeValue, ampm] = clock.time.split(" ");
  const win = callingWindow(clock.hour);
  const carrier = item.carrier || carrierFor(item.code, item.country);
  const [copiedSample, setCopiedSample] = useState(false);
  const samplePhoneNumber = `+1 (${item.code}) 555-0199`;

  const copySampleNumber = () => {
    navigator.clipboard.writeText(`+1${item.code}5550199`);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
    logEngagementEvent({ action: "copy_phone", target: item.code });
  };

  const relatedCodes = AREA_CODES.filter(
    (a) => a.region === item.region && a.code !== item.code && !item.overlays?.includes(a.code)
  );

  return (
    <div
      key={`${item.code}-${item.region}`}
      className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col space-y-4"
    >
      {/* Header Row: Time Focus */}
      <div className="flex items-start justify-between gap-4">
        {/* HUGE Time */}
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <div className="flex items-center gap-3">
            <Clock className="size-7 sm:size-10 text-primary/80" />
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-5xl sm:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">
                {timeValue}
              </span>
              {ampm && (
                <span className="text-lg sm:text-2xl font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                  {ampm}
                </span>
              )}
            </div>
          </div>
          <div className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 pl-10 sm:pl-13 flex items-center gap-1.5">
            <Globe2 className="size-3.5 sm:size-4" />
            <span>{item.tzLabel}</span>
          </div>
        </div>

        <button
          onClick={() => onToggleFavorite(item.code)}
          title={isFav ? "Saved to favorites" : "Save area code"}
          className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
            isFav
              ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
              : "bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:bg-slate-800 dark:text-slate-500 dark:hover:text-amber-400 dark:hover:bg-slate-700"
          }`}
        >
          <Star className={`size-4 ${isFav ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* NPA & Region Info Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{item.code}</span>
          <span className="text-slate-300 dark:text-slate-600 leading-none">—</span>
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 tracking-tight leading-none">
            {item.cities[0] || item.regionName}, {item.region}
          </h3>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            {item.country === "US" ? (
              <UsFlagBadge className="w-3 h-2 rounded-xs" />
            ) : item.country === "CA" ? (
              <CaFlagBadge className="w-3 h-2 rounded-xs" />
            ) : item.country === "TF" ? (
              <Phone className="size-2.5 text-emerald-500" />
            ) : (
              <Globe2 className="size-2.5 text-amber-500" />
            )}
            {item.country}
          </span>
        </div>
        
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${
            win.status === "good"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
              : win.status === "caution"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
          }`}
        >
          <span className={`size-1.5 rounded-full ${win.status === "good" ? "bg-emerald-500" : win.status === "caution" ? "bg-amber-500" : "bg-rose-500"}`} />
          {win.status === "good" ? (isAr ? "مسموح الاتصال" : "Safe to call") : win.status === "caution" ? (isAr ? "نافذة الاتصال تغلق" : "Closing soon") : (isAr ? "ممنوع الاتصال" : "Do not call")}
        </span>
      </div>

      {item.risk && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-2.5 text-[11px] text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <ShieldAlert className="size-3.5 shrink-0 mt-0.5" />
          <span>{t("risk_body")}</span>
        </div>
      )}

      {/* Grid of Mini Cards for Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{isAr ? "الشبكة" : "Carrier"}</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate" title={carrier}>{carrier}</span>
        </div>
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{isAr ? "المدن" : "Cities"}</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate" title={item.cities.join(", ")}>
            {item.cities.slice(0, 2).join(", ")} {item.cities.length > 2 ? `+${item.cities.length - 2}` : ""}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 flex flex-col gap-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{isAr ? "تراكبات" : "Overlays"}</span>
          <div className="flex items-center gap-1 flex-wrap">
            {item.overlays && item.overlays.length > 0 ? (
              item.overlays.map((ov) => (
                <button
                  key={ov}
                  onClick={() => onInspectCode?.(ov)}
                  className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer"
                >
                  {ov}
                </button>
              ))
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500">-</span>
            )}
          </div>
        </div>
      </div>

      {relatedCodes.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
            {isAr ? "مفاتيح أخرى في " + item.regionName : `Other codes in ${item.regionName}`}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {relatedCodes.slice(0, 10).map((a) => (
              <button
                key={a.code}
                onClick={() => onInspectCode?.(a.code)}
                className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 dark:border-slate-700 dark:bg-slate-800/50 rounded font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer"
              >
                {a.code}
              </button>
            ))}
            {relatedCodes.length > 10 && (
              <span className="text-[10px] text-slate-400 font-medium pl-1">
                +{relatedCodes.length - 10} {isAr ? "أخرى" : "more"}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 mt-1 flex-wrap">
        <button
          onClick={copySampleNumber}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5 py-1"
        >
          {copiedSample ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <PhoneCall className="size-3.5" />}
          <span>{copiedSample ? (isAr ? "تم النسخ" : "Copied!") : samplePhoneNumber}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCopyDossier(item)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Copy className="size-3.5" />
            <span className="hidden sm:inline">{t("copy")}</span>
          </button>
          
          {onInspectCode && (
            <button
              onClick={() => onInspectCode(item.code)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Activity className="size-3.5" />
              <span>{isAr ? "تحليل" : "Inspect"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AreaCodeMapCard({
  item,
  t,
  isAr = false,
}: {
  item: AreaCode;
  t: (k: string) => string;
  isAr?: boolean | undefined;
}) {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl"><div className="animate-pulse text-slate-400">Loading Map...</div></div>}>
      <AreaCodeLeafletMap
        item={item}
        t={t}
        isAr={isAr}
      />
    </Suspense>
  );
}

function NpaRouteComponent() {
  const { npa } = Route.useParams();
  const { t, lang } = useI18n();
  const isAr = lang === "ar";
  const navigate = useNavigate();

  const [now, setNow] = useState(new Date());
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedHeroMatchIdx, setSelectedHeroMatchIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const favs = localStorage.getItem("entec:favorites");
      if (favs) setFavorites(JSON.parse(favs));
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

  const triggerToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 2500);
  };

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

  const lookupResult = useMemo(() => {
    return lookup(npa, activeAreaCodes, activeAreaCodeMap);
  }, [npa, activeAreaCodes, activeAreaCodeMap]);

  const activeHeroMatch = useMemo(() => {
    if (!lookupResult.matches || lookupResult.matches.length === 0) return null;
    const clamped = Math.min(selectedHeroMatchIdx, lookupResult.matches.length - 1);
    return lookupResult.matches[clamped] || lookupResult.matches[0];
  }, [lookupResult.matches, selectedHeroMatchIdx]);

  const { data: activeNarrative, isLoading: isNarrativeLoading } = useQuery({
    queryKey: ["areaNarrative", activeHeroMatch?.code],
    queryFn: async () => {
      if (!activeHeroMatch) return null;
      const existing = await getAreaNarrative(activeHeroMatch.code);
      if (existing) return existing;

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
    staleTime: 1000 * 60 * 60 * 24,
  });

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

  if (!activeHeroMatch) {
    return (
      <div className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-12">
        <div className="glass-panel p-8 sm:p-12 text-center rounded-3xl border border-dashed border-border/90">
          <h3 className="text-xl font-bold text-foreground">
            {isAr ? `لا توجد نتائج مطابقة للكود "${npa}"` : `No matching records found for area code "${npa}"`}
          </h3>
          <div className="mt-6">
            <Link to="/" className="btn-primary inline-flex">
              {isAr ? "العودة للصفحة الرئيسية" : "Return Home"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] dark:opacity-[0.14] [background-image:radial-gradient(#2563eb_1.25px,transparent_1.25px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,black_30%,transparent_90%)]" />

      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-card border border-primary/40 px-4 py-2.5 text-sm font-semibold text-primary shadow-xl glow-ring animate-in fade-in slide-in-from-bottom-3">
          {copiedToast}
        </div>
      )}

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-6 sm:py-10 z-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>{isAr ? "العودة للبحث" : "Back to Search"}</span>
          </Link>
        </div>

        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <Zap className="size-5 text-primary" />
                <span>{isAr ? `تقرير متكامل عن الكود ${activeHeroMatch.code}` : `Area Code ${activeHeroMatch.code} Dossier`}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isAr
                  ? "بيانات التوقيت والولاية والمشغل ونوافذ الاتصال القانونية المعتمدة"
                  : "Jurisdiction, TCPA safe calling windows, facility carriers and live local clocks."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
              <AreaCodeCard
                item={activeHeroMatch}
                now={now}
                isFav={favorites.includes(activeHeroMatch.code)}
                onToggleFavorite={toggleFavorite}
                onCopyDossier={copyDossierHandler}
                isAr={isAr}
                t={t}
              />

              <AreaCodeMapCard
                item={activeHeroMatch}
                t={t}
                isAr={isAr}
              />
            </div>

            <AreaCodeNarrativeSection
              narrative={activeNarrative ?? null}
              isLoading={isNarrativeLoading}
              isAr={isAr}
            />

            <GoogleAdBanner format="horizontal" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
