import { useMemo, useState, useEffect, useRef } from "react";
import {
  ArrowRightLeft,
  Calendar,
  Clock,
  ExternalLink,
  Info,
  Moon,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Timer,
  Search,
  ChevronDown,
  Check,
  Globe2,
} from "lucide-react";
import {
  LOCATIONS_CATALOG,
  EXTENDED_LOCATIONS_CATALOG,
  DEFAULT_SOURCE_LOCATION,
  DEFAULT_TARGET_LOCATION,
  type LocationItem,
} from "@/data/worldTimezones";
import {
  convertCrossTimezone,
  generate24HourTimeline,
} from "@/lib/timeConverter";

// Clean Country Flag Badge Helper
function LocationFlag({ code }: { code: string }) {
  if (code === "US") {
    return (
      <svg className="w-4 h-3 rounded-xs shrink-0" viewBox="0 0 640 400" fill="none" aria-hidden="true">
        <path fill="#b22234" d="M0 0h640v400H0z" />
        <path stroke="#fff" strokeWidth="30.77" d="M0 46.15h640M0 107.7h640M0 169.2h640M0 230.8h640M0 292.3h640M0 353.8h640" />
        <path fill="#3c3b6e" d="M0 0h256v215.4H0z" />
      </svg>
    );
  }
  if (code === "EG") {
    return (
      <svg className="w-4 h-3 rounded-xs shrink-0" viewBox="0 0 640 427" fill="none" aria-hidden="true">
        <path fill="#000" d="M0 284.7h640V427H0z" />
        <path fill="#fff" d="M0 142.3h640v142.4H0z" />
        <path fill="#ce1126" d="M0 0h640v142.3H0z" />
        <circle cx="320" cy="213.5" r="16" fill="#c09300" />
      </svg>
    );
  }
  if (code === "SA") {
    return (
      <svg className="w-4 h-3 rounded-xs shrink-0" viewBox="0 0 640 427" fill="none" aria-hidden="true">
        <path fill="#006c35" d="M0 0h640v427H0z" />
        <path fill="#fff" d="M220 220h200v12H220z" />
      </svg>
    );
  }
  if (code === "AE") {
    return (
      <svg className="w-4 h-3 rounded-xs shrink-0" viewBox="0 0 640 320" fill="none" aria-hidden="true">
        <path fill="#00732f" d="M0 0h640v106.7H0z" />
        <path fill="#fff" d="M0 106.7h640v106.6H0z" />
        <path fill="#000" d="M0 213.3h640V320H0z" />
        <path fill="#ff0000" d="M0 0h160v320H0z" />
      </svg>
    );
  }
  if (code === "CA") {
    return (
      <svg className="w-4 h-3 rounded-xs shrink-0" viewBox="0 0 640 320" fill="none" aria-hidden="true">
        <path fill="#d80027" d="M0 0h160v320H0zM480 0h160v320H480z" />
        <path fill="#fff" d="M160 0h320v320H160z" />
        <path fill="#d80027" d="m320 60 16 46 36-12-16 40 44 8-32 30 18 36-40-16-10 40-16-40-40 16 18-36-32-30 44-8-16-40 36 12 16-46z" />
      </svg>
    );
  }
  if (code === "GB") {
    return (
      <svg className="w-4 h-3 rounded-xs shrink-0" viewBox="0 0 640 320" fill="none" aria-hidden="true">
        <path fill="#012169" d="M0 0h640v320H0z" />
        <path stroke="#fff" strokeWidth="40" d="m0 0 640 320M640 0 0 320" />
        <path stroke="#c8102e" strokeWidth="20" d="m0 0 640 320M640 0 0 320" />
        <path stroke="#fff" strokeWidth="60" d="M320 0v320M0 160h640" />
        <path stroke="#c8102e" strokeWidth="36" d="M320 0v320M0 160h640" />
      </svg>
    );
  }

  // Generic globe flag pill
  return <span className="text-xs">🌐</span>;
}

function LocationCombobox({
  value,
  onChange,
  isAr,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  isAr: boolean;
  options: typeof LOCATIONS_CATALOG;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLocation = options.find((o) => o.id === value);
  const formatLoc = (loc: typeof options[0]) => {
    const name = isAr ? loc.nameAr : loc.nameEn;
    const ctx = isAr ? (loc.regionAr || loc.countryAr) : (loc.regionEn || loc.countryEn);
    const firstWord = name.split(" ")[0] || "";
    if (!ctx || name.toLowerCase().includes(ctx.toLowerCase()) || ctx.toLowerCase().includes(firstWord.toLowerCase())) {
      return name;
    }
    return isAr ? `${name} - ${ctx}` : `${name}, ${ctx}`;
  };

  const selectedLabel = selectedLocation ? formatLoc(selectedLocation) : (isAr ? "اختر مدينة أو ولاية..." : "Select location...");

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      // By default, show predefined locations
      return LOCATIONS_CATALOG;
    }

    const query = searchQuery.toLowerCase();
    const matches = options.filter(
      (opt) =>
        opt.nameEn.toLowerCase().includes(query) ||
        opt.nameAr.toLowerCase().includes(query) ||
        opt.countryEn.toLowerCase().includes(query) ||
        opt.countryAr.toLowerCase().includes(query)
    );
    // Limit to 50 results to prevent UI lag
    return matches.slice(0, 50);
  }, [searchQuery, options]);

  const renderOption = (loc: typeof LOCATIONS_CATALOG[0]) => {
    const label = formatLoc(loc);
    const isSelected = loc.id === value;
    return (
      <button
        key={loc.id}
        type="button"
        onClick={() => {
          onChange(loc.id);
          setIsOpen(false);
          setSearchQuery("");
        }}
        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors ${
          isSelected ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground"
        }`}
      >
        <span className="truncate">{label}</span>
        {isSelected && <Check className="size-4 shrink-0" />}
      </button>
    );
  };

  const renderGroup = (label: string, items: typeof LOCATIONS_CATALOG) => {
    if (items.length === 0) return null;
    return (
      <div key={label} className="mb-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
          {label}
        </div>
        <div className="p-1">
          {items.map(renderOption)}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-2xl bg-card/80 border border-border/80 px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-primary/60 cursor-pointer ${value ? "text-foreground" : "text-muted-foreground"}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`size-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-border/50 bg-card/95 backdrop-blur-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? "ابحث عن مدينة أو ولاية..." : "Search city or state..."}
                className="w-full bg-muted/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-60 p-0">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {isAr ? "لا توجد نتائج" : "No results found"}
              </div>
            ) : searchQuery ? (
              <div className="p-1">
                {filteredOptions.map((loc) => renderOption(loc))}
              </div>
            ) : (
              <>
                {renderGroup(isAr ? "🇺🇸 الولايات والمدن الأمريكية" : "United States (States & Metros)", filteredOptions.filter(l => l.category === "us_state"))}
                {renderGroup(isAr ? "🇪🇬 العواصم العربية والشرق الأوسط" : "Arab Capitals & Middle East", filteredOptions.filter(l => l.category === "arab"))}
                {renderGroup(isAr ? "🇨🇦 المقاطعات الكندية" : "Canada", filteredOptions.filter(l => l.category === "canada"))}
                {renderGroup(isAr ? "🌍 العواصم العالمية الكبرى" : "Global Capitals", filteredOptions.filter(l => l.category === "world"))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TimeConverterTab({
  t,
  isAr,
  onNavigateLookup,
}: {
  t: (k: string) => string;
  isAr: boolean;
  onNavigateLookup?: (q: string) => void;
}) {
  // 1. Locations: Default Empty
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");

  // 2. Date & Time state (Default: Today & 06:00 as requested in example)
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0] ?? "2026-09-04", []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState("06:00");

  // Retrieve exact definitions for dual-panel synchronization
  // Note: We search in EXTENDED_LOCATIONS_CATALOG now
  const sourceLocation = useMemo(
    () => EXTENDED_LOCATIONS_CATALOG.find((l) => l.id === sourceId),
    [sourceId]
  );
  const targetLocation = useMemo(
    () => EXTENDED_LOCATIONS_CATALOG.find((l) => l.id === targetId),
    [targetId]
  );

  // 3. Swap Locations Feature (التبديل بين المدينتين)
  const handleSwapLocations = () => {
    const prevSource = sourceId;
    const prevTarget = targetId;
    setSourceId(prevTarget);
    setTargetId(prevSource);
  };

  // 4. Set current local time in source location
  const handleSetCurrentTime = () => {
    const now = new Date();
    setSelectedDate(now.toISOString().split("T")[0] ?? todayStr);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setSelectedTime(`${hours}:${minutes}`);
  };

  // 5. Calculations
  const conversion = useMemo(() => {
    if (!sourceLocation || !targetLocation) return null;
    return convertCrossTimezone(
      sourceLocation.timezone,
      targetLocation.timezone,
      selectedDate,
      selectedTime
    );
  }, [sourceLocation, targetLocation, selectedDate, selectedTime]);

  const timeline = useMemo(() => {
    if (!sourceLocation || !targetLocation) return [];
    return generate24HourTimeline(
      sourceLocation.timezone,
      targetLocation.timezone,
      selectedDate
    );
  }, [sourceLocation, targetLocation, selectedDate]);

  // Current slider hour (0..23)
  const currentHour = parseInt(selectedTime.split(":")[0] || "6", 10);
  const currentMinute = selectedTime.split(":")[1] || "00";

  const handleSliderChange = (newHour: number) => {
    setSelectedTime(`${String(newHour).padStart(2, "0")}:${currentMinute}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
            <Timer className="size-3.5 text-primary" />
            <span>
              {isAr ? "مزامنة التوقيت العابر للقارات" : "Cross-Continental Timezone Sync"}
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {isAr
              ? "محول التوقيت الذكي بين أمريكا ومصر والعالم"
              : "US & Global Cross-Timezone Converter"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            {isAr
              ? "حدد أي وقت محدد في القاهرة أو أي ولاية أمريكية لمعرفة التوقيت المقابل فوراً، مع فحص ساعات الاتصال القانونية TCPA ونوافذ تداخل العمل."
              : "Accurately synchronize and convert hours between Cairo, US States, and global capitals with live TCPA curfew legal analysis."}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSetCurrentTime}
            className="px-4 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Clock className="size-3.5 text-primary" />
            <span>{isAr ? "ضبط على التوقيت الحالي" : "Set to Live Now"}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          CONTROLS BAR: LOCATIONS SELECTION & SWAP BUTTON
      ========================================================================= */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-border/80 shadow-xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
          {/* 1. Origin Location Selector (Default: Cairo) */}
          <div className="lg:col-span-5 space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-cyan-400" />
              <span>{isAr ? "المدينة الأولى (المصدر)" : "Origin Location (Source)"}</span>
              {sourceLocation?.id === "cairo" && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 font-sans">
                  {isAr ? "افتراضي" : "Default"}
                </span>
              )}
            </label>
            <LocationCombobox
              value={sourceId}
              onChange={(val) => setSourceId(val)}
              isAr={isAr}
              options={EXTENDED_LOCATIONS_CATALOG}
            />
          </div>

          {/* 2. SWAP BUTTON (زر التبديل التفاعلي بين المدينتين) */}
          <div className="lg:col-span-1 flex justify-center py-2 lg:py-0">
            <button
              onClick={handleSwapLocations}
              title={isAr ? "تبديل الموقعين" : "Swap Locations"}
              aria-label="Swap Locations"
              className="group size-12 sm:size-14 rounded-full bg-gradient-to-br from-cyan-500/20 via-primary/10 to-indigo-600/20 hover:from-cyan-500/30 hover:to-indigo-600/30 border border-cyan-400/40 hover:border-cyan-400 text-cyan-300 hover:text-white flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all duration-300 cursor-pointer active:scale-95"
            >
              <ArrowRightLeft className="size-5 transition-transform duration-300 group-hover:rotate-180" />
            </button>
          </div>

          {/* 3. Target Location Selector (Default: New York) */}
          <div className="lg:col-span-5 space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" />
              <span>{isAr ? "المدينة الثانية (الهدف)" : "Target Destination"}</span>
              {targetLocation?.id === "new-york" && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-sans">
                  {isAr ? "افتراضي" : "Default"}
                </span>
              )}
            </label>
            <LocationCombobox
              value={targetId}
              onChange={(val) => setTargetId(val)}
              isAr={isAr}
              options={EXTENDED_LOCATIONS_CATALOG}
            />
          </div>
        </div>

        {sourceLocation && targetLocation && conversion && (
          <>
            {/* =========================================================================
                TIME & DATE INPUTS + QUICK PRESETS
            ========================================================================= */}
        <div className="pt-5 border-t border-border/50 flex flex-wrap items-center justify-between gap-5">
          {/* Time & Date Pickers */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-card/60 border border-border/60 px-4 py-2.5 rounded-xl shadow-sm backdrop-blur-md transition-colors hover:border-primary/50 relative">
              <Clock className="size-4 text-cyan-500 dark:text-cyan-400" />
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                {isAr ? "الوقت في" : "Time in"} <span className="text-foreground">{isAr ? sourceLocation.nameAr : sourceLocation.nameEn}</span>:
              </span>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="bg-transparent text-sm font-mono font-bold text-foreground focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden w-full"
              />
            </div>

            <div className="flex items-center gap-2 bg-card/60 border border-border/60 px-4 py-2.5 rounded-xl shadow-sm backdrop-blur-md transition-colors hover:border-primary/50 relative">
              <Calendar className="size-4 text-cyan-500 dark:text-cyan-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden w-full"
              />
            </div>

            {/* LIVE TARGET RESULT DISPLAY (NO SCROLL NEEDED) */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-300">
              <Timer className="size-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-100/70">
                {isAr ? "يساوي في" : "Equals in"} <span className="text-emerald-50 font-bold">{isAr ? targetLocation.nameAr : targetLocation.nameEn}</span>:
              </span>
              <span className="text-base font-mono font-black text-emerald-400 ml-1 tracking-tight">
                {conversion.target.time12}
              </span>
              <span className="text-[10px] text-emerald-400/80 font-bold ml-1.5 bg-emerald-400/15 px-1.5 py-0.5 rounded uppercase">
                {conversion.hourDiff > 0 ? "+" : ""}{conversion.hourDiff}h
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons (Segmented Control) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-mono uppercase font-semibold text-muted-foreground mr-1 shrink-0">
              {isAr ? "أوقات شائعة:" : "Presets:"}
            </span>
            <div className="flex bg-muted/40 p-1 rounded-xl border border-border/50 shadow-inner">
              {["06:00", "09:00", "12:00", "18:00", "20:00"].map((time) => {
                const label = time === "18:00" ? "06:00 PM" : time === "20:00" ? "08:00 PM" : time === "12:00" ? "12:00 PM" : `${time} AM`;
                return (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                      selectedTime === time
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interactive 24-Hour Scrubber Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3 text-cyan-400" />
              <span>{isAr ? "شريط التمرير الحي (24 ساعة)" : "24-Hour Live Interactive Scrubber"}</span>
            </span>
            <span className="font-bold text-primary">
              {conversion.source.time12} ({sourceLocation.nameEn})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={currentHour}
            onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-500 dark:accent-cyan-400 h-2.5 bg-muted/80 rounded-lg cursor-pointer transition-all shadow-inner border border-border/50"
          />
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-1 pt-0.5">
            <span>12 AM</span>
            <span>3 AM</span>
            <span>6 AM</span>
            <span>9 AM</span>
            <span>12 PM</span>
            <span>3 PM</span>
            <span>6 PM</span>
            <span>9 PM</span>
            <span>11 PM</span>
          </div>
        </div>
        </>
      )}
    </div>

      {sourceLocation && targetLocation && conversion ? (
        <>
          {/* =========================================================================
              DUAL LUXURY TIME CARDS (RESULTS DISPLAY)
          ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        {/* CARD 1: ORIGIN / SOURCE (e.g. CAIRO) */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/75 to-[#0b101d]/90 backdrop-blur-2xl border border-white/[0.12] hover:border-cyan-400/40 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col justify-between">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
          <div className="pointer-events-none absolute -top-28 -left-28 size-56 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />

          <div className="space-y-4">
            {/* Header: Location & Flags */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <LocationFlag code={sourceLocation.countryCode} />
                <div>
                  <h3 className="font-display text-xl font-extrabold text-white tracking-tight leading-none">
                    {isAr ? sourceLocation.nameAr : sourceLocation.nameEn}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr ? sourceLocation.regionAr : sourceLocation.regionEn} •{" "}
                    {isAr ? sourceLocation.countryAr : sourceLocation.countryEn}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-white/10 text-cyan-300 border border-white/15">
                {conversion.source.offsetLabel}
              </span>
            </div>

            {/* Big Digital Clock */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.08] shadow-inner flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block mb-1">
                  {isAr ? "التوقيت المحدد في المصدر" : "Specified Origin Time"}
                </span>
                <div className="font-mono text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {conversion.source.time12}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {isAr ? conversion.source.formattedDateAr : conversion.source.formattedDateEn}
                </div>
              </div>

              <div className="size-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-cyan-300">
                {conversion.source.isDaytime ? (
                  <Sun className="size-6 text-amber-400 animate-pulse" />
                ) : (
                  <Moon className="size-6 text-indigo-300" />
                )}
              </div>
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">
                  {isAr ? "المنطقة الزمنية الرسمية" : "Standard Zone"}
                </span>
                <span className="font-mono font-bold text-white block">
                  {conversion.source.tzName} ({sourceLocation.timezone})
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">
                  {isAr ? "فترة اليوم" : "Daylight Period"}
                </span>
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  {conversion.source.isBusinessHours
                    ? isAr
                      ? "ساعات عمل رسمية (Business Hours)"
                      : "Standard Working Hours"
                    : conversion.source.isDaytime
                      ? isAr
                        ? "فترة النهار (Daytime)"
                        : "Daytime Window"
                      : isAr
                        ? "فترة الليل (Night / Off-Hours)"
                        : "Night / Off-Hours"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.08] text-xs text-slate-400 flex items-center justify-between">
            <span>{isAr ? "توقيت الإدخال المرجعي" : "Base Reference Point"}</span>
            <span className="font-mono text-cyan-300">24h: {conversion.source.time24}</span>
          </div>
        </div>

        {/* CARD 2: TARGET DESTINATION (e.g. NEW YORK) */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/75 to-[#0b101d]/90 backdrop-blur-2xl border border-white/[0.12] hover:border-cyan-400/40 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col justify-between">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
          <div className="pointer-events-none absolute -top-28 -right-28 size-56 rounded-full bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />

          <div className="space-y-4">
            {/* Header: Target Location & Relative Day */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <LocationFlag code={targetLocation.countryCode} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl font-extrabold text-white tracking-tight leading-none">
                      {isAr ? targetLocation.nameAr : targetLocation.nameEn}
                    </h3>
                    {targetLocation.isUS && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-primary/15 text-primary border border-primary/25">
                        US NPA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr ? targetLocation.regionAr : targetLocation.regionEn} •{" "}
                    {isAr ? targetLocation.countryAr : targetLocation.countryEn}
                  </p>
                </div>
              </div>

              {/* Day Offset Badge */}
              <div className="flex items-center gap-1.5">
                {conversion.dayOffset !== 0 ? (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {conversion.dayOffset > 0
                      ? isAr
                        ? "+1 اليوم التالي"
                        : "+1 Next Day"
                      : isAr
                        ? "-1 اليوم السابق"
                        : "-1 Yesterday"}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/10 text-slate-200 border border-white/15">
                    {isAr ? "نفس اليوم" : "Same Day"}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-white/10 text-cyan-300 border border-white/15">
                  {conversion.target.offsetLabel}
                </span>
              </div>
            </div>

            {/* Big Digital Converted Clock */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.08] shadow-inner flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold block mb-1">
                  {isAr ? "التوقيت المقابل المحول" : "Synchronized Target Time"}
                </span>
                <div className="font-mono text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-300 drop-shadow-sm tracking-tight">
                  {conversion.target.time12}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {isAr ? conversion.target.formattedDateAr : conversion.target.formattedDateEn}
                </div>
              </div>

              <div className="size-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-cyan-300">
                {conversion.target.isDaytime ? (
                  <Sun className="size-6 text-amber-400" />
                ) : (
                  <Moon className="size-6 text-indigo-300" />
                )}
              </div>
            </div>

            {/* TCPA Calling Window Status (If Destination is US) */}
            {targetLocation.isUS ? (
              <div
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
                  conversion.tcpaStatus === "good"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                    : conversion.tcpaStatus === "caution"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-200"
                }`}
              >
                {conversion.tcpaStatus === "good" ? (
                  <ShieldCheck className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert
                    className={`size-5 shrink-0 mt-0.5 ${
                      conversion.tcpaStatus === "caution" ? "text-amber-400" : "text-rose-400"
                    }`}
                  />
                )}
                <div>
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span>{isAr ? conversion.tcpaLabelAr : conversion.tcpaLabelEn}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/30 border border-white/10 uppercase">
                      TCPA 47 U.S.C.
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                    {isAr ? conversion.tcpaDetailAr : conversion.tcpaDetailEn}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/[0.06] flex items-center justify-between text-xs text-slate-300">
                <span className="text-slate-400">{isAr ? "فارق التوقيت:" : "Time Shift:"}</span>
                <span className="font-semibold text-cyan-300">
                  {isAr ? conversion.diffSummaryAr : conversion.diffSummaryEn}
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.08] text-xs text-slate-400 flex items-center justify-between">
            <span>
              {isAr ? conversion.diffSummaryAr : conversion.diffSummaryEn}
            </span>
            <span className="font-mono text-cyan-300">24h: {conversion.target.time24}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE 24-HOUR COMPARATIVE TIMELINE MATRIX
      ========================================================================= */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-border/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              <span>{isAr ? "جدول المقارنة الزمني الكامل (24 ساعة)" : "24-Hour Comparative Timeline Matrix"}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAr
                ? "انقر على أي ساعة في الشريط للانتقال المباشر إليها ومزامنة التوقيت في المدينتين."
                : "Click any hour slot to jump directly to that time and synchronize both clocks."}
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
              <span className="size-2 rounded-full bg-emerald-400" />
              <span>{isAr ? "ساعات عمل مشتركة" : "Mutual Business Hours"}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
              <span className="size-2 rounded-full bg-cyan-400" />
              <span>{isAr ? "ساعات اتصال مسموحة TCPA" : "TCPA Calling Hours"}</span>
            </span>
          </div>
        </div>

        {/* 24-Hour Interactive Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-12 lg:grid-cols-24 gap-1.5 pt-2">
          {timeline.map((slot) => {
            const isSelected = slot.sourceHour === currentHour;

            return (
              <button
                key={`slot-${slot.sourceHour}`}
                onClick={() => handleSliderChange(slot.sourceHour)}
                className={`p-2 rounded-xl text-center flex flex-col items-center justify-between transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-cyan-500/30 border-cyan-400 shadow-md shadow-cyan-500/25 scale-105 z-10"
                    : slot.isMutualBusiness
                      ? "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300"
                      : slot.isTargetTcpaSafe
                        ? "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300"
                        : "bg-black/30 hover:bg-black/50 border-white/[0.04] text-slate-500"
                }`}
              >
                {/* Source Hour */}
                <span className="font-mono text-[10px] font-bold">
                  {slot.sourceTime24}
                </span>

                <div className="my-1.5">
                  {slot.sourcePeriod === "morning" || slot.sourcePeriod === "afternoon" ? (
                    <Sun className={`size-3 ${isSelected ? "text-white" : "text-amber-400"}`} />
                  ) : (
                    <Moon className={`size-3 ${isSelected ? "text-cyan-200" : "text-indigo-400"}`} />
                  )}
                </div>

                {/* Target Hour */}
                <span
                  className={`font-mono text-[10px] font-bold ${
                    isSelected ? "text-white" : "text-cyan-400"
                  }`}
                >
                  {slot.targetTime24}
                </span>

                {slot.targetDayOffset !== 0 && (
                  <span className="text-[8px] font-mono text-amber-300 leading-none mt-0.5">
                    {slot.targetDayOffset > 0 ? "+1d" : "-1d"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
          <Info className="size-3.5 text-primary shrink-0" />
          <span>
            {isAr
              ? `الصف العلوي: توقيت ${sourceLocation.nameAr} • الصف السفلي: التوقيت المقابل في ${targetLocation.nameAr} (${targetLocation.regionAr}).`
              : `Top row: ${sourceLocation.nameEn} local time • Bottom row: Synchronized time in ${targetLocation.nameEn} (${targetLocation.regionEn}).`}
          </span>
        </div>
      </div>
      </>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-border/40 border-dashed rounded-3xl bg-card/20 shadow-sm min-h-[300px]">
          <Globe2 className="size-16 text-muted-foreground/30 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            {isAr ? "أداة تحويل التوقيت" : "Cross-Timezone Converter"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            {isAr
              ? "الرجاء اختيار المدينة المصدر والمدينة الهدف من القوائم أعلاه لعرض توافق الأوقات ونوافذ الاتصال القانونية المتاحة."
              : "Please select both the Origin and Target locations from the dropdowns above to view cross-timezone synchronization and TCPA legal calling windows."}
          </p>
        </div>
      )}
    </div>
  );
}
