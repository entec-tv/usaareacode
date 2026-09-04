import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef, type ChangeEvent } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  CheckCircle2,
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
  Sparkles,
  Star,
  Trash2,
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
import { useI18n } from "@/lib/i18n";
import { TimeConverterTab } from "@/components/tools/TimeConverterTab";

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

const SAMPLE_RAW_TEXT = `Call Center Raw Inbound Lead Log - 2026 Batch #409
Customer Service Records:
1. John Doe - Philadelphia PA: (215) 555-0143
2. ENTEC Direct Operations Desk: +1 (223) 203-0312
3. Executive Mobile: 484-555-9281
4. Suspicious missed call (1 ring): +1 (876) 555-0199 [Wangiri Fraud Risk]
5. West Coast Partner: (310) 555-8821
6. Toronto Canadian Branch: 416-555-4321
7. Nationwide Support Toll-Free: 1-800-555-0199
8. Miami Regional Logistics: 3055557711
9. Offshore Carrier Scam Alert: +1 (473) 555-0182
10. California Relief Overlay: (738) 555-4422
11. Washington DC Operations: +1 771-555-0100`;

// Clean SVG Flags for Crisp Universal Rendering (Never Glitches on Windows Chromium)
function UsFlagBadge({ className = "w-4 h-2.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#b22234" d="M0 0h640v400H0z"/>
      <path stroke="#fff" strokeWidth="30.77" d="M0 46.15h640M0 107.7h640M0 169.2h640M0 230.8h640M0 292.3h640M0 353.8h640"/>
      <path fill="#3c3b6e" d="M0 0h256v215.4H0z"/>
      <circle cx="42.6" cy="35.9" r="7" fill="#fff"/>
      <circle cx="85.3" cy="35.9" r="7" fill="#fff"/>
      <circle cx="128" cy="35.9" r="7" fill="#fff"/>
      <circle cx="170.6" cy="35.9" r="7" fill="#fff"/>
      <circle cx="213.3" cy="35.9" r="7" fill="#fff"/>
      <circle cx="64" cy="71.8" r="7" fill="#fff"/>
      <circle cx="106.6" cy="71.8" r="7" fill="#fff"/>
      <circle cx="149.3" cy="71.8" r="7" fill="#fff"/>
      <circle cx="192" cy="71.8" r="7" fill="#fff"/>
      <circle cx="42.6" cy="107.7" r="7" fill="#fff"/>
      <circle cx="85.3" cy="107.7" r="7" fill="#fff"/>
      <circle cx="128" cy="107.7" r="7" fill="#fff"/>
      <circle cx="170.6" cy="107.7" r="7" fill="#fff"/>
      <circle cx="213.3" cy="107.7" r="7" fill="#fff"/>
      <circle cx="64" cy="143.6" r="7" fill="#fff"/>
      <circle cx="106.6" cy="143.6" r="7" fill="#fff"/>
      <circle cx="149.3" cy="143.6" r="7" fill="#fff"/>
      <circle cx="192" cy="143.6" r="7" fill="#fff"/>
      <circle cx="42.6" cy="179.5" r="7" fill="#fff"/>
      <circle cx="85.3" cy="179.5" r="7" fill="#fff"/>
      <circle cx="128" cy="179.5" r="7" fill="#fff"/>
      <circle cx="170.6" cy="179.5" r="7" fill="#fff"/>
      <circle cx="213.3" cy="179.5" r="7" fill="#fff"/>
    </svg>
  );
}

function CaFlagBadge({ className = "w-4 h-2.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#d80027" d="M0 0h160v320H0zM480 0h160v320H480z"/>
      <path fill="#fff" d="M160 0h320v320H160z"/>
      <path fill="#d80027" d="m320 60 16 46 36-12-16 40 44 8-32 30 18 36-40-16-10 40-16-40-40 16 18-36-32-30 44-8-16-40 36 12 16-46z"/>
    </svg>
  );
}

// Reusable Area Code Intelligence Dossier Card - Luxury Glassmorphism
function AreaCodeCard({
  item,
  now,
  isFav,
  onToggleFavorite,
  onCopyDossier,
  onInspectCode,
  t,
}: {
  item: AreaCode;
  now: Date;
  isFav: boolean;
  onToggleFavorite: (code: string) => void;
  onCopyDossier: (item: AreaCode) => void;
  onInspectCode?: (code: string) => void;
  t: (k: string) => string;
}) {
  const clock = localTime(item.timezone, now);
  const win = callingWindow(clock.hour);
  const carrier = item.carrier || carrierFor(item.code, item.country);

  return (
    <div
      key={`${item.code}-${item.region}`}
      className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/75 to-[#0b101d]/90 backdrop-blur-2xl border border-white/[0.12] hover:border-cyan-400/40 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:shadow-[0_25px_60px_rgba(6,182,212,0.18)] transition-all duration-300 flex flex-col justify-between"
    >
      {/* Specular Ambient Glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
      <div className="pointer-events-none absolute -top-28 -right-28 size-56 rounded-full bg-cyan-500/15 blur-3xl group-hover:bg-cyan-500/25 transition-all duration-700" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 size-56 rounded-full bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />

      <div className="space-y-4">
        {/* Header: Area Code Emblem & Region Identification */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            {/* Illuminated NPA Badge */}
            <div className="relative flex flex-col items-center justify-center px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-slate-950/80 border border-cyan-400/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_0_20px_rgba(6,182,212,0.15)] group-hover:border-cyan-400/60 transition-all shrink-0">
              <span className="text-[9px] font-mono tracking-widest text-cyan-300 font-bold uppercase">
                NPA
              </span>
              <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-300 drop-shadow-[0_2px_10px_rgba(6,182,212,0.4)] leading-tight">
                {item.code}
              </span>
            </div>

            {/* Region Details & Flags */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-extrabold text-white text-lg sm:text-xl tracking-tight leading-none truncate">
                  {item.regionName}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-white/10 border border-white/20 text-white shadow-xs">
                  {item.region}
                </span>
                {item.mandatory10Digit ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    10-Digit Dialing
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.05] text-slate-400 border border-white/10">
                    7/10-Digit
                  </span>
                )}
              </div>

              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-slate-200 font-medium">
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
                      <Phone className="size-3 text-emerald-400" />
                      <span>Toll-Free Network</span>
                    </>
                  ) : (
                    <>
                      <Globe2 className="size-3 text-amber-400" />
                      <span>Caribbean / Offshore</span>
                    </>
                  )}
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300 font-mono text-[11px]">
                  <Clock className="size-3 text-cyan-400" />
                  <span>{item.tzLabel}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleFavorite(item.code)}
            aria-label="Bookmark"
            title={isFav ? "Saved to favorites" : "Save area code"}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
              isFav
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.25)]"
                : "bg-white/[0.04] hover:bg-white/[0.09] border-white/10 text-slate-400 hover:text-amber-300"
            }`}
          >
            <Star
              className={`size-4.5 transition-transform active:scale-125 ${
                isFav ? "fill-amber-400 text-amber-400" : ""
              }`}
            />
          </button>
        </div>

        {/* High-Risk Trap Advisory (if flagged) */}
        {item.risk && (
          <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/60 via-rose-900/30 to-rose-950/60 p-3.5 text-xs text-rose-200 flex items-start gap-3 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
            <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 shrink-0 mt-0.5">
              <ShieldAlert className="size-4 text-rose-400" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-rose-300 text-xs tracking-wide uppercase flex items-center gap-2">
                <span>{t("risk_title")}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-200 font-mono">
                  FCC Advisory
                </span>
              </div>
              <p className="text-[11px] text-rose-300/90 leading-relaxed">{t("risk_body")}</p>
            </div>
          </div>
        )}

        {/* Live Status & Clock Bar (Precision Radar Strip) */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-950/70 via-[#0a0f1d]/80 to-slate-950/90 border border-white/[0.08] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          {/* Calling Window Status */}
          <div className="flex items-center gap-3">
            <div className="relative flex size-3 shrink-0 items-center justify-center">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  win.status === "good"
                    ? "bg-emerald-400"
                    : win.status === "caution"
                      ? "bg-amber-400"
                      : "bg-rose-500"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full size-2.5 ${
                  win.status === "good"
                    ? "bg-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                    : win.status === "caution"
                      ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                      : "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-extrabold text-xs uppercase tracking-wider ${
                    win.status === "good"
                      ? "text-emerald-400"
                      : win.status === "caution"
                        ? "text-amber-400"
                        : "text-rose-400"
                  }`}
                >
                  {win.label}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-white/[0.06] border border-white/10 text-slate-300">
                  TCPA Rule
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {win.status === "good"
                  ? "Compliant Calling Hours (8:00 AM – 9:00 PM local time)"
                  : win.detail}
              </p>
            </div>
          </div>

          {/* Clock Display */}
          <div className="text-start sm:text-end font-mono shrink-0 pl-6 sm:pl-0 border-t sm:border-t-0 border-white/[0.06] pt-2.5 sm:pt-0" suppressHydrationWarning>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
              {clock.time}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans flex items-center sm:justify-end gap-1.5">
              <span className="text-slate-300 font-medium">{clock.date}</span>
              <span>•</span>
              <span className="font-mono text-[10px] text-cyan-300 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                {clock.offset}
              </span>
            </div>
          </div>
        </div>

        {/* Technical Specs 2-Column Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Dominant Carrier */}
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/[0.06] hover:border-cyan-500/30 transition-colors space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono font-bold tracking-wider">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Radio className="size-3.5" />
                <span>{t("carrier")} / ILEC</span>
              </div>
              <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                Active
              </span>
            </div>
            <div className="font-bold text-white text-xs sm:text-sm tracking-tight truncate" title={carrier}>
              {carrier}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="size-1 rounded-full bg-cyan-400"></span>
              <span>Primary Incumbent Local Exchange</span>
            </div>
          </div>

          {/* Primary Cities */}
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/[0.06] hover:border-emerald-500/30 transition-colors space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono font-bold tracking-wider">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <MapPin className="size-3.5" />
                <span>{t("city")} & Coverage</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">
                {item.cities.length} Centers
              </span>
            </div>
            <div className="font-semibold text-slate-100 text-xs sm:text-sm truncate" title={item.cities.join(", ")}>
              {item.cities.join(", ")}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="size-1 rounded-full bg-emerald-400"></span>
              <span>Principal Rate Centers</span>
            </div>
          </div>
        </div>

        {/* Shared Relief Overlays Strip */}
        <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-mono font-bold tracking-wider shrink-0">
            <div className="p-1 rounded-md bg-purple-500/15 border border-purple-500/25 text-purple-400">
              <Layers className="size-3.5" />
            </div>
            <div>
              <span className="text-slate-200">Shared Relief Overlays</span>
              <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                ({item.overlays?.length || 0})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar justify-end flex-wrap">
            {item.overlays && item.overlays.length > 0 ? (
              item.overlays.slice(0, 8).map((ov) => (
                <button
                  key={ov}
                  onClick={() => onInspectCode?.(ov)}
                  title={`Click to inspect area code ${ov}`}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-400/40 border border-white/10 font-mono text-xs font-bold text-slate-200 transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  {ov}
                </button>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No assigned overlay (Single-code NPA)</span>
            )}
            {item.overlays && item.overlays.length > 8 && (
              <span className="text-[11px] font-mono text-slate-400 px-1 font-semibold">
                +{item.overlays.length - 8} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Unified Executive Action Bar */}
      <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
        <a
          href={mapLink(item)}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-slate-200 hover:text-white flex items-center gap-2 font-semibold text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
        >
          <ExternalLink className="size-3.5 text-cyan-400" />
          <span>{t("map")} Coverage</span>
        </a>

        <button
          onClick={() => onCopyDossier(item)}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-primary to-blue-600 hover:brightness-110 text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-[0_4px_16px_rgba(6,182,212,0.35)] transition-all cursor-pointer active:scale-95"
        >
          <Copy className="size-3.5" />
          <span>{t("copy")} Dossier</span>
        </button>
      </div>
    </div>
  );
}

// Reusable Interactive Google Map Card for Area Code Geocoding
function AreaCodeMapCard({
  item,
  t,
  isAr = false,
}: {
  item: AreaCode;
  t: (k: string) => string;
  isAr?: boolean;
}) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"m" | "k">("m"); // 'm' = roadmap, 'k' = satellite
  const [zoomLevel, setZoomLevel] = useState(10);

  // When item changes, reset selectedCity
  useEffect(() => {
    setSelectedCity(null);
  }, [item.code]);

  const targetCity = selectedCity || item.cities[0] || item.regionName;
  const mapQuery =
    item.country === "US"
      ? `${targetCity}, ${item.regionName}`
      : item.country === "CA"
        ? `${targetCity}, ${item.regionName}, Canada`
        : item.country === "TF"
          ? "United States and Canada"
          : `${item.regionName}`;

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=${mapType}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/75 to-[#0b101d]/90 backdrop-blur-2xl border border-white/[0.12] hover:border-cyan-400/40 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:shadow-[0_25px_60px_rgba(6,182,212,0.18)] transition-all duration-300 flex flex-col justify-between h-full min-h-[440px]">
      {/* Specular Ambient Glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
      <div className="pointer-events-none absolute -top-28 -left-28 size-56 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />
      <div className="pointer-events-none absolute -bottom-28 -right-28 size-56 rounded-full bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />

      <div className="space-y-3.5 flex-1 flex flex-col">
        {/* Header: Title & Map Layer Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-inner">
              <MapPin className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-extrabold text-white text-base tracking-tight leading-none">
                  {isAr ? "خريطة التغطية الجغرافية" : "Geographic Coverage Map"}
                </h4>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-white/10 text-cyan-300 border border-white/15">
                  Google Maps™
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[240px] sm:max-w-xs">
                {targetCity} • {item.regionName} ({item.region})
              </p>
            </div>
          </div>

          {/* Map Controls: Satellite Toggle & Zoom */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setMapType(mapType === "m" ? "k" : "m")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mapType === "k"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Toggle Satellite / Terrain"
            >
              {mapType === "k" ? "Satellite" : "Roadmap"}
            </button>
            <div className="w-px h-3.5 bg-white/15" />
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 1, 16))}
              className="px-2 py-0.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 1, 4))}
              className="px-2 py-0.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
              title="Zoom out"
            >
              -
            </button>
          </div>
        </div>

        {/* Embedded Interactive Google Map */}
        <div className="relative flex-1 w-full min-h-[260px] sm:min-h-[300px] rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-slate-950/80">
          <iframe
            key={`${mapQuery}-${mapType}-${zoomLevel}`}
            title={`Coverage Map for NPA ${item.code}`}
            src={embedUrl}
            className="w-full h-full border-0 absolute inset-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Rate Center City Quick Filters (if multiple cities exist) */}
        {item.cities && item.cities.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 shrink-0 mr-1">
              Focus City:
            </span>
            <button
              onClick={() => setSelectedCity(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 border ${
                selectedCity === null
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-xs"
                  : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border-white/10"
              }`}
            >
              All ({item.cities.length})
            </button>
            {item.cities.slice(0, 6).map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 border ${
                  selectedCity === city
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-xs"
                    : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border-white/10"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Telemetry Strip */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Rate Center Geocoding Active</span>
        </div>

        <a
          href={externalMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-slate-200 hover:text-white flex items-center gap-1.5 font-semibold text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
        >
          <ExternalLink className="size-3 text-cyan-400" />
          <span>{isAr ? "فتح بكامل الشاشة" : "Full Screen Map"}</span>
        </a>
      </div>
    </div>
  );
}


function IndexPage() {
  const { t, lang } = useI18n();
  const isAr = lang === "ar";

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<TabType>("lookup");

  // Sync tab with URL query param ?tab=
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab") as TabType | null;
    const validTabs: TabType[] = ["lookup", "browse", "bulk", "map", "compare", "converter", "saved"];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
      heroResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    if (tab !== "lookup") {
      heroResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState("223");
  const [hasSearched, setHasSearched] = useState(true);
  const [selectedHeroMatchIdx, setSelectedHeroMatchIdx] = useState(0);
  const heroResultsRef = useRef<HTMLDivElement>(null);
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

  // Bulk extractor state
  const [bulkInput, setBulkInput] = useState(SAMPLE_RAW_TEXT);
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [bulkProcessed, setBulkProcessed] = useState(false);
  const [bulkFilter, setBulkFilter] = useState<"all" | "safe" | "caution" | "risk">("all");

  // Map view state
  const [activeMap, setActiveMap] = useState<"us" | "ca">("us");
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Compare state
  const [compareCodeA, setCompareCodeA] = useState("212");
  const [compareCodeB, setCompareCodeB] = useState("310");

  // Favorites & Recents in localStorage
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);

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

  // Perform active lookup
  const lookupResult = useMemo(() => {
    const res = lookup(searchQuery);
    return res;
  }, [searchQuery]);

  const activeHeroMatch = useMemo(() => {
    if (!lookupResult.matches || lookupResult.matches.length === 0) return null;
    const clamped = Math.min(selectedHeroMatchIdx, lookupResult.matches.length - 1);
    return lookupResult.matches[clamped] || lookupResult.matches[0];
  }, [lookupResult.matches, selectedHeroMatchIdx]);

  // Handle Search Submission
  const handleSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    setSelectedHeroMatchIdx(0);
    setHasSearched(true);
    saveRecent(trimmed);
    setActiveTab("lookup");
    setTimeout(() => {
      heroResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 60);
  };

  const copyDossierHandler = (item: AreaCode) => {
    const clock = localTime(item.timezone, now);
    const win = callingWindow(clock.hour);
    const carrier = item.carrier || carrierFor(item.code, item.country);
    const info = `ENTEC NPA Dossier:
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
    triggerToast(isAr ? `تم نسخ معلومات ${item.code}` : `Copied NPA ${item.code} dossier!`);
  };

  // Filtered browse dataset with complete column sorting and calling status
  const filteredBrowse = useMemo(() => {
    const q = browseQuery.trim().toLowerCase();
    const list = AREA_CODES.filter((a) => {
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

  // Bulk processing routine
  const processBulk = () => {
    const lines = bulkInput.split(/\r?\n/);
    const phoneRegex = /(?:\+?1[\s.-]?)?\(?([2-9]\d{2})\)?[\s.-]?([2-9]\d{2})[\s.-]?(\d{4})/g;
    const items: any[] = [];
    const seen = new Set<string>();

    for (const line of lines) {
      let match: RegExpExecArray | null;
      while ((match = phoneRegex.exec(line)) !== null) {
        const fullMatch = match[0];
        const npa = match[1] ?? "";
        const nxx = match[2] ?? "";
        const station = match[3] ?? "";
        if (!npa || !nxx || !station) continue;
        const digits = `${npa}${nxx}${station}`;

        if (seen.has(digits)) continue;
        seen.add(digits);

        const areaMatches = AREA_CODE_MAP[npa] ?? [];
        const areaInfo = areaMatches[0];
        const timeInfo = areaInfo ? localTime(areaInfo.timezone, now) : null;
        const callWin = timeInfo ? callingWindow(timeInfo.hour) : null;

        items.push({
          raw: fullMatch,
          national: formatUS(digits),
          e164: toE164(digits),
          npa,
          nxx,
          valid: isValidNanp(digits),
          region: areaInfo?.regionName ?? "Unknown / Unassigned",
          city: areaInfo?.cities[0] ?? "Unknown",
          carrier: areaInfo ? areaInfo.carrier : "Unknown",
          risk: areaInfo?.risk ?? false,
          timezone: areaInfo?.tzLabel ?? "N/A",
          localTimeStr: timeInfo ? timeInfo.time : "N/A",
          callStatus: callWin?.status ?? "unknown",
          callLabel: callWin?.label ?? "N/A",
        });
      }
    }

    setBulkResults(items);
    setBulkProcessed(true);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setBulkInput(text);
        triggerToast(isAr ? `تم تحميل ملف ${file.name}` : `Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const filteredBulkResults = useMemo(() => {
    if (bulkFilter === "safe") return bulkResults.filter((r) => r.callStatus === "good");
    if (bulkFilter === "caution") return bulkResults.filter((r) => r.callStatus === "caution" || r.callStatus === "blocked");
    if (bulkFilter === "risk") return bulkResults.filter((r) => r.risk);
    return bulkResults;
  }, [bulkResults, bulkFilter]);

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

      {/* Hero Header */}
      <section className={`relative overflow-hidden border-b border-border/50 transition-all duration-300 ${
        hasSearched && searchQuery.trim() ? "pt-4 pb-6 sm:pt-6 sm:pb-8" : "pt-8 pb-12 md:pt-12 md:pb-16"
      }`}>
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[130px] rounded-full" />
        <div className="pointer-events-none absolute top-20 right-10 w-[400px] h-[300px] bg-secondary/15 blur-[120px] rounded-full" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
          {(!hasSearched || !searchQuery.trim()) && (
            <div className="flex flex-col items-center mb-4">
              <div className="size-20 sm:size-24 rounded-3xl p-1 bg-gradient-to-br from-cyan-500/30 via-primary/20 to-indigo-600/30 border border-cyan-400/40 shadow-[0_0_35px_rgba(6,182,212,0.35)] overflow-hidden mb-3.5 glow-ring animate-in fade-in zoom-in duration-500">
                <img src="/entec-logo.jpg" alt="ENTEC Logo" className="w-full h-full object-cover rounded-[20px]" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-[11px] font-semibold text-primary shadow-sm glow-ring">
                <Radio className="size-3 animate-pulse text-primary" />
                <span>{isAr ? "محرك ذكاء الاتصالات المعتمد • 460+ مفتاح حقيقي" : "Authoritative Telecom Intel Hub • 460+ Real NPAs"}</span>
              </div>
            </div>
          )}

          <h1 className={`font-display font-extrabold tracking-tight text-gradient max-w-4xl mx-auto leading-[1.15] transition-all ${
            hasSearched && searchQuery.trim()
              ? "text-xl sm:text-2xl md:text-3xl mb-1"
              : "text-3xl sm:text-5xl lg:text-6xl mb-3"
          }`}>
            {t("hero_title")}
          </h1>

          {(!hasSearched || !searchQuery.trim()) && (
            <p className="mt-2 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("hero_sub")}
            </p>
          )}

          {/* Unified Search Box */}
          <div className={`mx-auto max-w-3xl transition-all ${
            hasSearched && searchQuery.trim() ? "mt-3 sm:mt-4" : "mt-6 sm:mt-8"
          }`}>
            <div className="glass-panel p-1.5 sm:p-2.5 flex flex-row items-center gap-1.5 sm:gap-2 glow-ring rounded-2xl">
              <div className="relative flex-1 min-w-0 flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch(searchQuery);
                  }}
                  placeholder={t("search_ph")}
                  className="w-full bg-transparent pl-9 sm:pl-11 pr-8 sm:pr-10 py-2 sm:py-3 text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setHasSearched(false);
                    }}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 cursor-pointer"
                  >
                    <X className="size-3.5 sm:size-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => handleSearch(searchQuery)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-6 py-2 sm:py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm shadow-md transition-all hover:brightness-110 active:scale-95 shrink-0 cursor-pointer"
              >
                <Sparkles className="size-3.5 sm:size-4" />
                <span>{t("search_btn")}</span>
              </button>
            </div>
          </div>

          {/* Instant Hero Analysis Results */}
          {hasSearched && searchQuery.trim() && (
            <div
              ref={heroResultsRef}
              id="hero-results"
              className="mt-4 sm:mt-6 max-w-6xl mx-auto text-start animate-in fade-in slide-in-from-top-3 duration-300"
            >
              {/* Phone Banner if Phone Detected */}
              {lookupResult.kind === "phone" && (
                <div className="glass-panel mb-3 sm:mb-4 p-3 sm:p-4 border-primary/40 flex flex-wrap items-center justify-between gap-3 rounded-2xl glow-ring">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
                      {isAr ? "رقم هاتف متكامل تم تحليله" : "Normalized Telecommunications Record"}
                    </span>
                    <div className="mt-0.5 flex items-baseline gap-2.5">
                      <span className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                        {lookupResult.normalizedPhone}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {lookupResult.e164}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(lookupResult.e164 || "");
                        triggerToast(isAr ? "تم نسخ الرقم E.164" : "Copied E.164 phone number!");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-card hover:bg-primary/20 border border-border text-xs font-semibold text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Copy className="size-3" />
                      <span>{isAr ? "نسخ E.164" : "Copy E.164"}</span>
                    </button>
                    <a
                      href={`tel:${lookupResult.e164}`}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1 transition-all hover:brightness-110"
                    >
                      <PhoneCall className="size-3" />
                      <span>{isAr ? "اتصال" : "Call"}</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Prefix Banner if 6-digit prefix detected */}
              {lookupResult.kind === "prefix" && (
                <div className="glass-panel mb-3 sm:mb-4 p-3 sm:p-4 border-primary/40 flex flex-wrap items-center justify-between gap-3 rounded-2xl glow-ring">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
                      {isAr ? "بادئة المقسم المركزي (NPA-NXX Prefix)" : "Local Central Office Rate Center Prefix"}
                    </span>
                    <div className="mt-0.5 flex items-baseline gap-2.5">
                      <span className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                        {lookupResult.normalizedPhone}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        NPA: {lookupResult.npa} • Exchange: {lookupResult.nxx}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                      LERG Exchange Active
                    </span>
                  </div>
                </div>
              )}

              {/* Dossier Header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 sm:size-4 text-primary" />
                    <span>{isAr ? "نتيجة التحليل المباشر" : "Instant Analysis Dossier"}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-primary/20 text-primary border border-primary/30">
                      {lookupResult.matches.length} {lookupResult.matches.length === 1 ? (isAr ? "نتيجة" : "match") : (isAr ? "نتائج" : "matches")}
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
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
                        }));
                        exportCsv(rows, `entec-lookup-${searchQuery}.csv`);
                        triggerToast(isAr ? "تم تصدير النتائج CSV" : "Exported CSV!");
                      }}
                      className="px-2.5 py-1 rounded-lg border border-border/80 bg-card hover:bg-accent text-[11px] font-medium text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Download className="size-3" />
                      <span>{t("export_csv")}</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setHasSearched(false);
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-card"
                    title="Close results"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Empty State */}
              {lookupResult.matches.length === 0 && (
                <div className="glass-panel p-6 sm:p-8 text-center rounded-2xl">
                  <HelpCircle className="size-8 mx-auto text-muted-foreground mb-2 opacity-60" />
                  <h3 className="text-base font-bold text-foreground">{t("no_results")}</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                    {isAr
                      ? `لم نتمكن من العثور على مفتاح أو ولاية أو مدينة تطابق "${searchQuery}". جرب البحث برمز مكون من 3 أرقام مثل 212 أو 484 أو اسم ولاية.`
                      : `No registered North American area code matches "${searchQuery}". Try a 3-digit NPA like 212, 484, or a city name like Miami.`}
                  </p>
                  <div className="mt-3 flex justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleSearch("223")}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold cursor-pointer"
                    >
                      223 (PA Line)
                    </button>
                    <button
                      onClick={() => handleSearch("212")}
                      className="px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-semibold border border-border cursor-pointer"
                    >
                      212 (Manhattan)
                    </button>
                    <button
                      onClick={() => handleSearch("800")}
                      className="px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-semibold border border-border cursor-pointer"
                    >
                      800 (Toll-Free)
                    </button>
                  </div>
                </div>
              )}

              {/* Side-by-Side: Card on Left, Google Map on Right */}
              {lookupResult.matches.length > 0 && activeHeroMatch && (
                <div className="space-y-4">
                  {/* Selector Pills if Multiple Matches */}
                  {lookupResult.matches.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      <span className="text-xs font-mono font-bold uppercase text-slate-400 shrink-0">
                        {isAr ? "المفاتيح المطابقة:" : "Matching Codes:"}
                      </span>
                      {lookupResult.matches.map((m, idx) => (
                        <button
                          key={`${m.code}-${m.region}`}
                          onClick={() => setSelectedHeroMatchIdx(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 border ${
                            selectedHeroMatchIdx === idx
                              ? "bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-md shadow-cyan-500/20"
                              : "bg-card hover:bg-card/80 border-border text-slate-300"
                          }`}
                        >
                          {m.code} • {m.region}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
                    {/* Left Column: Dossier Card */}
                    <AreaCodeCard
                      key={`${activeHeroMatch.code}-${activeHeroMatch.region}`}
                      item={activeHeroMatch}
                      now={now}
                      isFav={favorites.includes(activeHeroMatch.code)}
                      onToggleFavorite={toggleFavorite}
                      onCopyDossier={copyDossierHandler}
                      onInspectCode={handleSearch}
                      t={t}
                    />

                    {/* Right Column: Google Maps Interactive Geocoding */}
                    <AreaCodeMapCard
                      key={`hero-map-${activeHeroMatch.code}-${activeHeroMatch.region}`}
                      item={activeHeroMatch}
                      t={t}
                      isAr={isAr}
                    />
                  </div>
                </div>
              )}

              {lookupResult.matches.length > 4 && (
                <div className="mt-2.5 text-center">
                  <button
                    onClick={() => {
                      setActiveTab("lookup");
                      document.getElementById("main-tabs")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                  >
                    {isAr
                      ? `عرض جميع الـ ${lookupResult.matches.length} مفتاح في القسم المفصل بالأسفل ↓`
                      : `View all ${lookupResult.matches.length} matches in detailed directory below ↓`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Target Anchor for Smooth Scrolling */}
      <div ref={heroResultsRef} className="scroll-mt-20" />

      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-card border border-primary/40 px-4 py-2.5 text-sm font-semibold text-primary shadow-xl glow-ring animate-in fade-in slide-in-from-bottom-3">
          {copiedToast}
        </div>
      )}

      {/* Main Body Content */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-8">
        {/* =========================================================================
            TAB 1: INSTANT LOOKUP
        ========================================================================= */}
        {activeTab === "lookup" && (
          <div className="space-y-6">
            {/* Phone Number Banner if Phone Detected */}
            {lookupResult.kind === "phone" && (
              <div className="glass-panel p-5 border-primary/40 flex flex-wrap items-center justify-between gap-4 rounded-2xl">
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
                    }}
                    className="px-3.5 py-2 rounded-xl bg-card hover:bg-primary/20 border border-border text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="size-3.5" />
                    <span>{isAr ? "نسخ E.164" : "Copy E.164"}</span>
                  </button>
                  <a
                    href={`tel:${lookupResult.e164}`}
                    className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 transition-all hover:brightness-110"
                  >
                    <PhoneCall className="size-3.5" />
                    <span>{isAr ? "اتصال" : "Call"}</span>
                  </a>
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  <span>{isAr ? "نتائج الاستعلام اللحظي" : "Instant Intelligence Dossier"}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary">
                    {lookupResult.matches.length} {lookupResult.matches.length === 1 ? "match" : "matches"}
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr
                    ? "بيانات التوقيت والولاية والمشغل ونوافذ الاتصال القانونية المعتمدة"
                    : "Jurisdiction, TCPA safe calling windows, facility carriers and live local clocks."}
                </p>
              </div>

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
                  className="px-3 py-1.5 rounded-lg border border-border/80 bg-card hover:bg-accent text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="size-3.5" />
                  <span>{t("export_csv")}</span>
                </button>
              )}
            </div>

            {/* Empty State */}
            {lookupResult.matches.length === 0 && (
              <div className="glass-panel p-12 text-center rounded-2xl">
                <HelpCircle className="size-12 mx-auto text-muted-foreground mb-3 opacity-60" />
                <h3 className="text-lg font-bold text-foreground">{t("no_results")}</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                  {isAr
                    ? `لم نتمكن من العثور على مفتاح أو ولاية أو مدينة تطابق "${searchQuery}". جرب البحث برمز مكون من 3 أرقام مثل 212 أو 484 أو اسم ولاية.`
                    : `No registered North American area code matches "${searchQuery}". Try a 3-digit NPA like 212, 484, or a city name like Miami.`}
                </p>
                <div className="mt-5 flex justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleSearch("223")}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold cursor-pointer"
                  >
                    223 (PA Line)
                  </button>
                  <button
                    onClick={() => handleSearch("212")}
                    className="px-4 py-2 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-semibold border border-border cursor-pointer"
                  >
                    212 (Manhattan)
                  </button>
                  <button
                    onClick={() => handleSearch("416")}
                    className="px-4 py-2 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-semibold border border-border cursor-pointer"
                  >
                    416 (Toronto)
                  </button>
                  <button
                    onClick={() => handleSearch("800")}
                    className="px-4 py-2 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-semibold border border-border cursor-pointer"
                  >
                    800 (Toll-Free)
                  </button>
                </div>
              </div>
            )}

            {/* Results: Side-by-side Card on Left, Google Map on Right */}
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 border ${
                          selectedHeroMatchIdx === idx
                            ? "bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-md shadow-cyan-500/20"
                            : "bg-card hover:bg-card/80 border-border text-slate-300"
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
                    t={t}
                  />

                  <AreaCodeMapCard
                    key={`tab-map-${activeHeroMatch.code}-${activeHeroMatch.region}`}
                    item={activeHeroMatch}
                    t={t}
                    isAr={isAr}
                  />
                </div>
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
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      countryFilter === c
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
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                win.status === "good"
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : win.status === "caution"
                                    ? "bg-amber-500/15 text-amber-400"
                                    : "bg-rose-500/15 text-rose-400"
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${
                                  win.status === "good"
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
                          className={`size-7 rounded-lg text-xs font-medium cursor-pointer ${
                            currentPage === pageNum
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
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {isAr ? "أداة استخراج وتنظيف أرقام الهواتف بالجملة" : "Enterprise Bulk Phone Extractor & Cleanser"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "الصق سجلات المكالمات أو نصوص CRM غير المهيكلة أو ارفع ملف CSV لاستخراج الأرقام وتحويلها إلى E.164 والتحقق من نوافذ الاتصال اللحظية ومخاطر الاحتيال."
                  : "Paste unformatted call logs, customer notes or upload CSV files to extract 10-digit NANP numbers, verify TCPA curfew status, and flag toll-fraud scams."}
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {isAr ? "النص الخام للمدخلات" : "Raw Input Stream"}
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-xs bg-card hover:bg-muted border border-border px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 font-medium text-foreground transition-colors">
                    <Upload className="size-3" />
                    <span>{isAr ? "رفع ملف CSV/TXT" : "Upload File"}</span>
                    <input
                      type="file"
                      accept=".csv,.txt,.log"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <button
                    onClick={() => setBulkInput(SAMPLE_RAW_TEXT)}
                    className="text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    {isAr ? "تحميل عينة نموذجية" : "Load Sample Lead Log"}
                  </button>
                  <button
                    onClick={() => setBulkInput("")}
                    className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Trash2 className="size-3" />
                    <span>{t("clear")}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                rows={6}
                placeholder="Paste customer logs, emails, CSV records with phone numbers here..."
                className="w-full rounded-xl bg-card/70 border border-border/80 p-3.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-y"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {isAr ? "يدعم التنسيقات: +1، الأقواس، الشُرط، والأرقام المدمجة (10 أرقام)" : "Supports +1 international, brackets, dashes, and contiguous 10-digit strings."}
                </span>

                <button
                  onClick={processBulk}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="size-4" />
                  <span>{isAr ? "استخراج وفحص الأرقام الآن" : "Extract & Analyze Phone Numbers"}</span>
                </button>
              </div>
            </div>

            {/* Bulk Results Section */}
            {bulkProcessed && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="glass rounded-xl p-3.5 text-center">
                    <div className="font-display text-2xl font-bold text-foreground">
                      {bulkResults.length}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Extracted Numbers</div>
                  </div>
                  <div className="glass rounded-xl p-3.5 text-center">
                    <div className="font-display text-2xl font-bold text-emerald-400">
                      {bulkResults.filter((r) => r.callStatus === "good").length}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Safe to Call Now</div>
                  </div>
                  <div className="glass rounded-xl p-3.5 text-center">
                    <div className="font-display text-2xl font-bold text-rose-500 flex items-center justify-center gap-1">
                      <ShieldAlert className="size-4" />
                      <span>{bulkResults.filter((r) => r.risk).length}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">Fraud Traps Flagged</div>
                  </div>
                  <div className="glass rounded-xl p-3.5 text-center">
                    <div className="font-display text-2xl font-bold text-primary">
                      {new Set(bulkResults.map((r) => r.npa)).size}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Unique Area Codes</div>
                  </div>
                </div>

                {/* Filter and Export toolbar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-1 bg-card/60 p-1 rounded-xl border border-border/70 text-xs">
                    <button
                      onClick={() => setBulkFilter("all")}
                      className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                        bulkFilter === "all" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      All ({bulkResults.length})
                    </button>
                    <button
                      onClick={() => setBulkFilter("safe")}
                      className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                        bulkFilter === "safe" ? "bg-emerald-500 text-white font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      Safe to Call ({bulkResults.filter((r) => r.callStatus === "good").length})
                    </button>
                    <button
                      onClick={() => setBulkFilter("caution")}
                      className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                        bulkFilter === "caution" ? "bg-amber-500 text-white font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      Caution / Outside ({bulkResults.filter((r) => r.callStatus !== "good").length})
                    </button>
                    <button
                      onClick={() => setBulkFilter("risk")}
                      className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                        bulkFilter === "risk" ? "bg-rose-500 text-white font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      Scam Traps ({bulkResults.filter((r) => r.risk).length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        exportXlsx(filteredBulkResults, "entec-cleaned-phones.xlsx");
                        triggerToast(isAr ? "تم تصدير إكسل!" : "Exported Excel file!");
                      }}
                      className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-1.5 text-foreground cursor-pointer"
                    >
                      <Download className="size-3" />
                      <span>{t("export_xlsx")}</span>
                    </button>
                    <button
                      onClick={() => {
                        exportCsv(filteredBulkResults, "entec-cleaned-phones.csv");
                        triggerToast(isAr ? "تم تصدير CSV!" : "Exported CSV file!");
                      }}
                      className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-1.5 text-foreground cursor-pointer"
                    >
                      <Download className="size-3" />
                      <span>{t("export_csv")}</span>
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="glass-panel rounded-2xl overflow-hidden border border-border/70">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/80 bg-card/80 text-muted-foreground uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">National Format</th>
                          <th className="py-3 px-4">E.164</th>
                          <th className="py-3 px-4">State / Region</th>
                          <th className="py-3 px-4">Local Time</th>
                          <th className="py-3 px-4">TCPA Status</th>
                          <th className="py-3 px-4">Dominant Carrier</th>
                          <th className="py-3 px-4">Fraud Alert</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 font-medium">
                        {filteredBulkResults.map((item, idx) => (
                          <tr key={idx} className="hover:bg-card/40 transition-colors">
                            <td className="py-2.5 px-4 font-mono font-bold text-foreground">
                              {item.national}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-muted-foreground">
                              {item.e164}
                            </td>
                            <td className="py-2.5 px-4 text-foreground">{item.region}</td>
                            <td className="py-2.5 px-4 font-mono text-foreground" suppressHydrationWarning>
                              {item.localTimeStr}
                            </td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  item.callStatus === "good"
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : item.callStatus === "caution"
                                      ? "bg-amber-500/15 text-amber-400"
                                      : "bg-rose-500/15 text-rose-400"
                                }`}
                              >
                                {item.callLabel}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-mono text-[11px] text-muted-foreground max-w-xs truncate" title={item.carrier}>
                              {item.carrier}
                            </td>
                            <td className="py-2.5 px-4">
                              {item.risk ? (
                                <span className="inline-flex items-center gap-1 text-destructive font-bold text-[11px]">
                                  <ShieldAlert className="size-3.5" />
                                  <span>HIGH RISK</span>
                                </span>
                              ) : (
                                <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                                  <CheckCircle2 className="size-3.5" />
                                  <span>Safe</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
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

              {/* Map Selection Controls */}
              <div className="flex items-center gap-1 bg-card/60 p-1 rounded-xl border border-border/70 text-xs">
                <button
                  onClick={() => setActiveMap("us")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    activeMap === "us" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🇺🇸 United States Map
                </button>
                <button
                  onClick={() => setActiveMap("ca")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    activeMap === "ca" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🇨🇦 Canada Map
                </button>
                <button
                  onClick={() => setIsMapExpanded(!isMapExpanded)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card cursor-pointer"
                  title="Toggle Map Size"
                >
                  <Maximize2 className="size-4" />
                </button>
              </div>
            </div>

            {/* Visual Coverage Map Viewer */}
            <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-border/70 overflow-hidden">
              <div className="relative rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                <img
                  src={activeMap === "us" ? "/maps/us_map_premium.png" : "/maps/ca_map_premium.png"}
                  alt={activeMap === "us" ? "United States Area Code Map" : "Canada Area Code Map"}
                  className={`w-full object-contain transition-all duration-300 ${
                    isMapExpanded ? "max-h-[800px]" : "max-h-[460px]"
                  }`}
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-background/80 backdrop-blur border border-border/80 text-[11px] font-semibold text-foreground flex items-center gap-1.5 shadow-sm">
                  <Compass className="size-3.5 text-primary" />
                  <span>{activeMap === "us" ? "US Geographic NPA Allocations" : "Canadian Provincial NPA Allocations"}</span>
                </div>
              </div>
            </div>

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
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            win.status === "good"
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
                  <div className={`font-display text-lg sm:text-xl font-bold mt-1 ${
                    compareMetrics.bothSafe ? "text-emerald-400" : "text-amber-400"
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
                                className={`size-2 rounded-full ${
                                  win.status === "good" ? "bg-emerald-400" : win.status === "caution" ? "bg-amber-400" : "bg-rose-500"
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
      </main>

      <Footer />
    </div>
  );
}
