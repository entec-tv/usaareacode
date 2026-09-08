import { useEffect, useRef, useState, useCallback } from "react";
import {
  Compass,
  Globe2,
  Layers,
  Maximize2,
  Minimize2,
  PhoneCall,
  Search,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

import { AREA_CODES, type AreaCode } from "@/data/areaCodes";
import { getAreaCodeCoordinates } from "@/data/geoCoordinates";
import { localTime, callingWindow } from "@/lib/nanp";
import { useI18n } from "@/lib/i18n";

// Iconic regional anchor codes to show at continental zoom (prevents clutter)
const ICONIC_REGIONAL_CODES = new Set([
  // US Major Metros / Anchor codes
  "212", "310", "312", "415", "206", "305", "713", "214", "404", "617",
  "202", "303", "702", "602", "503", "612", "313", "504", "615", "808",
  "907", "704", "317", "614", "412", "215", "801", "505", "402", "316",
  "205", "501", "302", "208", "319", "502", "207", "410", "601",
  "406", "603", "701", "405", "401", "803", "605", "802", "304", "307",
  // Canada Anchors
  "416", "514", "604", "403", "613", "204", "902", "709", "306", "867",
  // Caribbean
  "876", "242", "809", "473", "246", "868", "787", "340"
]);

function getCodePriority(item: AreaCode): number {
  if (item.risk) return 100;
  if (ICONIC_REGIONAL_CODES.has(item.code)) return 90;
  if (item.overlays && item.overlays.length > 0) return 30;
  return 60;
}

/**
 * Progressively filters area codes based on map viewport bounds and zoom level.
 * Prevents clustering at continental zoom, and progressively reveals more codes as the user zooms in.
 */
function getVisibleCodesForView(
  map: any,
  codes: AreaCode[],
  zoom: number,
  searchQuery: string
): AreaCode[] {
  // If actively searching, reveal all matching codes immediately
  if (searchQuery.trim().length > 0) {
    return codes;
  }

  const bounds = map.getBounds().pad(0.12);
  const inBoundsCodes = codes.filter((item: AreaCode) => {
    const coords = getAreaCodeCoordinates(item);
    return bounds.contains(coords);
  });

  // At high zoom (>= 8), reveal all codes in bounds without collision pruning
  if (zoom >= 8) {
    return inBoundsCodes;
  }

  // Pixel collision distance: adjusted for larger, highly-legible badges
  const minDistance = zoom <= 4 ? 62 : zoom <= 5 ? 48 : zoom <= 6 ? 34 : 22;

  // Sort by priority so anchor hubs and risk codes survive collision first
  const sorted = [...inBoundsCodes].sort((a, b) => getCodePriority(b) - getCodePriority(a));

  const visible: AreaCode[] = [];
  const placedPoints: { x: number; y: number }[] = [];

  for (const item of sorted) {
    const coords = getAreaCodeCoordinates(item);
    const point = map.latLngToLayerPoint(coords);

    let collides = false;
    for (const p of placedPoints) {
      const dx = p.x - point.x;
      const dy = p.y - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        collides = true;
        break;
      }
    }

    if (!collides) {
      placedPoints.push(point);
      visible.push(item);
    }
  }

  return visible;
}

interface InteractiveMapProps {
  initialRegion?: "all" | "us" | "ca" | "carib" | undefined;
  onSelectCode?: ((code: string) => void) | undefined;
}

export function InteractiveTelecomMap({
  initialRegion = "us",
  onSelectCode,
}: InteractiveMapProps) {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const tileGroupRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [activeRegion, setActiveRegion] = useState<"all" | "us" | "ca" | "carib">(initialRegion);
  const [mapStyle, setMapStyle] = useState<"dark" | "google" | "satellite" | "street">("dark");
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);
  const [filterCallingOnly, setFilterCallingOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCode, setSelectedCode] = useState<AreaCode | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(4);
  const [visibleCount, setVisibleCount] = useState(0);

  const filteredCodesRef = useRef<AreaCode[]>([]);
  const searchQueryRef = useRef<string>("");

  // Time ticker for live clocks inside cards
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered area codes
  const filteredCodes = AREA_CODES.filter((a) => {
    // Region match
    if (activeRegion === "us" && a.country !== "US") return false;
    if (activeRegion === "ca" && a.country !== "CA") return false;
    if (activeRegion === "carib" && a.country !== "CARIB") return false;

    // Risk match
    if (filterRiskOnly && !a.risk) return false;

    // Calling window match
    if (filterCallingOnly) {
      const clock = localTime(a.timezone, now);
      const win = callingWindow(clock.hour);
      if (win.status !== "good") return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCode = a.code.includes(q);
      const matchState = a.regionName.toLowerCase().includes(q) || a.region.toLowerCase().includes(q);
      const matchCity = a.cities.some((c) => c.toLowerCase().includes(q));
      if (!matchCode && !matchState && !matchCity) return false;
    }

    return true;
  });

  // Initialize Leaflet Map (SSR-Safe inside useEffect)
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");
      leafletRef.current = L;

      if (!isMounted || !mapContainerRef.current) return;

      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: [39.5, -98.35],
        zoom: 4,
        minZoom: 3,
        maxZoom: 12,
        attributionControl: false,
        zoomControl: false,
      });

      // Add Zoom Control to bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Tile Layer Group for dynamic switching (ESRI Dark Gray, Satellite, OSM)
      const tileGroup = L.layerGroup().addTo(map);
      tileGroupRef.current = tileGroup;
      applyTelecomTiles(L, tileGroup, mapStyle);

      // Markers Layer Group
      const markersLayer = L.layerGroup().addTo(map);

      // Listen to zoom and pan to progressively unpack codes as user zooms in
      map.on("zoomend moveend", () => {
        setCurrentZoom(map.getZoom());
        renderVisibleMarkers();
      });

      mapInstanceRef.current = map;
      markersLayerRef.current = markersLayer;
      setMapReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        tileGroupRef.current = null;
        leafletRef.current = null;
      }
    };
  }, []);

  // Switch Tile Layers dynamically (Dark Radar, Satellite, OpenStreetMap)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileGroupRef.current) return;
    import("leaflet").then((L) => {
      applyTelecomTiles(L, tileGroupRef.current, mapStyle);
    });
  }, [mapStyle]);

  // Render markers progressively according to viewport & zoom LOD
  const renderVisibleMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const L = leafletRef.current;
    if (!map || !markersLayer || !L) return;

    markersLayer.clearLayers();

    const zoom = map.getZoom();
    const codes = filteredCodesRef.current;
    const query = searchQueryRef.current;

    const visibleCodes = getVisibleCodesForView(map, codes, zoom, query);
    setVisibleCount(visibleCodes.length);

    visibleCodes.forEach((item) => {
      const coords = getAreaCodeCoordinates(item);
      const isHighRisk = item.risk;

      // Custom DivIcon with high-contrast, large, ultra-legible typography
      const iconHtml = `
        <div class="relative group cursor-pointer flex items-center justify-center">
          <div class="h-7 min-w-[42px] px-2 rounded-full flex items-center justify-center text-[13px] font-black font-sans tracking-tight transition-all transform hover:scale-125 shadow-xl ${
            isHighRisk
              ? "bg-rose-600 text-white border-2 border-white shadow-[0_0_14px_rgba(244,63,94,0.8)] animate-pulse"
              : "bg-cyan-400 text-slate-950 border-2 border-white shadow-[0_3px_10px_rgba(0,0,0,0.6)]"
          }">
            <span style="font-weight: 900; letter-spacing: -0.3px; display: inline-block; line-height: 1;">${item.code}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-telecom-marker",
        iconSize: [42, 28],
        iconAnchor: [21, 14],
      });

      const marker = L.marker(coords, { icon: customIcon });

      // Calculate live clock & call status for popup
      const clock = localTime(item.timezone, now);
      const win = callingWindow(clock.hour);

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 220px; color: #f8fafc; background: #0f172a; padding: 12px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.15);">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 8px;">
            <span style="font-family: monospace; font-size: 20px; font-weight: 900; color: #38bdf8;">+1 (${item.code})</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: ${
              isHighRisk ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)"
            }; color: ${isHighRisk ? "#fb7185" : "#34d399"};">
              ${isHighRisk ? "⚠️ HIGH RISK SCAM" : "✓ SAFE"}
            </span>
          </div>
          <div style="font-size: 12px; font-weight: 600; color: #e2e8f0; margin-bottom: 2px;">
            ${item.regionName} (${item.region})
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
            ${item.cities.slice(0, 3).join(", ") || "Region-wide"}
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; font-size: 11px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div>
              <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Local Time</div>
              <div style="font-family: monospace; font-weight: 700; color: #f8fafc;">${clock.time}</div>
            </div>
            <div style="text-align: right;">
              <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">TCPA Window</div>
              <div style="font-weight: 700; color: ${
                win.status === "good" ? "#34d399" : win.status === "caution" ? "#fbbf24" : "#fb7185"
              };">${win.label}</div>
            </div>
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px;">
            <strong>Carrier:</strong> ${item.carrier}
          </div>
          <button id="inspect-code-${item.code}" style="width: 100%; background: #0284c7; color: white; border: none; padding: 6px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;">
            Select & Search Area Code
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "telecom-dark-popup",
        closeButton: false,
      });

      marker.on("popupopen", () => {
        setSelectedCode(item);
        const btn = document.getElementById(`inspect-code-${item.code}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectCode) onSelectCode(item.code);
          };
        }
      });

      marker.on("click", () => {
        setSelectedCode(item);
      });

      markersLayer.addLayer(marker);
    });
  }, [onSelectCode, now]);

  // Keep references synced
  useEffect(() => {
    filteredCodesRef.current = filteredCodes;
    searchQueryRef.current = searchQuery;
    if (mapReady) {
      renderVisibleMarkers();
    }
  }, [mapReady, filteredCodes, searchQuery, renderVisibleMarkers]);

  // Center/Fly to regions when activeRegion changes
  const handleRegionChange = (reg: "all" | "us" | "ca" | "carib") => {
    setActiveRegion(reg);
    if (!mapInstanceRef.current) return;

    if (reg === "us") {
      mapInstanceRef.current.flyTo([38.5, -96.5], 4, { duration: 1.2 });
    } else if (reg === "ca") {
      mapInstanceRef.current.flyTo([56.0, -96.0], 4, { duration: 1.2 });
    } else if (reg === "carib") {
      mapInstanceRef.current.flyTo([18.5, -70.0], 6, { duration: 1.2 });
    } else {
      mapInstanceRef.current.flyTo([42.0, -95.0], 3, { duration: 1.2 });
    }
  };

  // Direct fly to specific state or code from search or chips
  const flyToCode = (codeItem: AreaCode) => {
    setSelectedCode(codeItem);
    if (!mapInstanceRef.current) return;
    const coords = getAreaCodeCoordinates(codeItem);
    mapInstanceRef.current.flyTo(coords, 7, { duration: 1.2 });
  };

  return (
    <div className="space-y-4">
      {/* Top Controls HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card/70 p-3 rounded-2xl border border-border/70 backdrop-blur">
        {/* Region Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-background/80 border border-border/80 text-xs">
          <button
            onClick={() => handleRegionChange("us")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeRegion === "us"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🇺🇸 {isAr ? "الولايات المتحدة" : "United States"}
          </button>
          <button
            onClick={() => handleRegionChange("ca")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeRegion === "ca"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🇨🇦 {isAr ? "كندا" : "Canada"}
          </button>
          <button
            onClick={() => handleRegionChange("carib")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeRegion === "carib"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🌴 {isAr ? "الكاريبي" : "Caribbean"}
          </button>
          <button
            onClick={() => handleRegionChange("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeRegion === "all"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🌐 {isAr ? "الكل" : "All NANP"}
          </button>
        </div>

        {/* Live Map Filters & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={isAr ? "ابحث بالرمز أو المدينة..." : "Search code, city, state..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-background/80 border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-44 sm:w-56"
            />
          </div>

          {/* Toggle Scam Risks Filter */}
          <button
            onClick={() => setFilterRiskOnly(!filterRiskOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
              filterRiskOnly
                ? "bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-xs"
                : "bg-background/80 text-muted-foreground border-border/80 hover:text-foreground"
            }`}
          >
            <ShieldAlert className="size-3.5" />
            <span>{isAr ? "الرموز الاحتيالية" : "Scam Risks"}</span>
          </button>

          {/* Toggle Calling Window Filter */}
          <button
            onClick={() => setFilterCallingOnly(!filterCallingOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
              filterCallingOnly
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-xs"
                : "bg-background/80 text-muted-foreground border-border/80 hover:text-foreground"
            }`}
          >
            <PhoneCall className="size-3.5" />
            <span>{isAr ? "مسموح الاتصال الآن" : "Calling Open"}</span>
          </button>

          {/* Map Layer Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-background/80 border border-border/80 text-xs">
            <button
              onClick={() => setMapStyle("google")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                mapStyle === "google"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Google Maps Roadmap (http://{s}.google.com/vt/lyrs=m)"
            >
              Google
            </button>
            <button
              onClick={() => setMapStyle("dark")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                mapStyle === "dark"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Radar Dark Canvas"
            >
              {isAr ? "رادار" : "Radar"}
            </button>
            <button
              onClick={() => setMapStyle("satellite")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                mapStyle === "satellite"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Satellite Imagery"
            >
              {isAr ? "قمر صناعي" : "Satellite"}
            </button>
            <button
              onClick={() => setMapStyle("street")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                mapStyle === "street"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="OpenStreetMap Street"
            >
              {isAr ? "شوارع" : "Street"}
            </button>
          </div>

          {/* Map Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-background/80 border border-border/80 text-muted-foreground hover:text-foreground transition cursor-pointer"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-slate-950">
        {/* Leaflet Container */}
        <div
          ref={mapContainerRef}
          className={`w-full transition-all duration-300 ${
            isExpanded ? "h-[750px]" : "h-[500px]"
          }`}
          style={{ zIndex: 1 }}
        />

        {/* Floating Top Left Telemetry Badge */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 text-xs text-white shadow-lg">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-cyan-500"></span>
            </span>
            <span className="font-mono font-semibold text-cyan-400">
              {visibleCount}
            </span>
            <span className="text-slate-300">
              {isAr ? "رمز معروض حالياً" : "Active in View"}
            </span>
            <span className="text-slate-500 text-[10px]">
              ({filteredCodes.length} {isAr ? "إجمالي" : "total"})
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-rose-500/30 text-xs text-rose-300 shadow-lg">
            <ShieldAlert className="size-3.5 text-rose-400" />
            <span>
              {filteredCodes.filter((c) => c.risk).length} {isAr ? "رمز احتيالي مرصود" : "High-Risk Codes"}
            </span>
          </div>

          {currentZoom < 7 && !searchQuery.trim() && (
            <div className="pointer-events-auto px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md border border-cyan-500/25 text-[11px] text-cyan-300 flex items-center gap-1.5 shadow-lg">
              <span>🔍</span>
              <span>
                {isAr
                  ? "كبّر الخريطة على أي منطقة لعرض الأكواد تدريجياً"
                  : "Zoom in to reveal more area codes progressively"}
              </span>
            </div>
          )}
        </div>

        {/* Floating Bottom Center: Quick Hub Jumpers */}
        <div className="absolute bottom-4 left-4 right-16 z-10 flex items-center gap-1.5 overflow-x-auto pb-1 pointer-events-auto no-scrollbar">
          {(activeRegion === "ca"
            ? [
                { code: "416", city: "Toronto, ON" },
                { code: "514", city: "Montreal, QC" },
                { code: "604", city: "Vancouver, BC" },
                { code: "403", city: "Calgary, AB" },
                { code: "613", city: "Ottawa, ON" },
                { code: "204", city: "Winnipeg, MB" },
              ]
            : activeRegion === "carib"
              ? [
                  { code: "876", city: "Jamaica" },
                  { code: "242", city: "Bahamas" },
                  { code: "473", city: "Grenada" },
                  { code: "809", city: "Dominican Rep" },
                  { code: "246", city: "Barbados" },
                  { code: "868", city: "Trinidad" },
                ]
              : [
                  { code: "212", city: "New York" },
                  { code: "310", city: "Los Angeles" },
                  { code: "312", city: "Chicago" },
                  { code: "305", city: "Miami" },
                  { code: "713", city: "Houston" },
                  { code: "415", city: "San Francisco" },
                  { code: "206", city: "Seattle" },
                  { code: "404", city: "Atlanta" },
                ]
          ).map((chip) => {
            const item = AREA_CODES.find((a) => a.code === chip.code);
            if (!item) return null;
            return (
              <button
                key={chip.code}
                onClick={() => flyToCode(item)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-[11px] text-white hover:border-cyan-400 transition cursor-pointer backdrop-blur shadow-md"
              >
                <span className="font-mono font-bold text-cyan-400">{chip.code}</span>
                <span className="text-slate-300">{chip.city}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Code Details Card */}
      {selectedCode && (
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-slate-900/70 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-black text-cyan-400 tracking-tight">
                +1 ({selectedCode.code})
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {selectedCode.regionName} ({selectedCode.region}), {selectedCode.country}
                </h4>
                <p className="text-xs text-slate-400">
                  {selectedCode.cities.join(", ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedCode.risk
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                }`}
              >
                {selectedCode.risk ? "⚠️ High-Risk Scam NPA" : "✓ Verified Safe NPA"}
              </span>

              {onSelectCode && (
                <button
                  onClick={() => onSelectCode(selectedCode.code)}
                  className="px-3.5 py-1 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>{isAr ? "بحث في هذا الكود" : "Lookup this Code"}</span>
                  <ExternalLink className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Carrier Attribution</span>
              <span className="font-semibold text-slate-200">{selectedCode.carrier}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Timezone</span>
              <span className="font-semibold text-slate-200">{selectedCode.timezone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Local Time Now</span>
              <span className="font-mono font-bold text-cyan-300" suppressHydrationWarning>
                {localTime(selectedCode.timezone, now).time}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Overlays & Splits</span>
              <span className="font-semibold text-slate-200">
                {selectedCode.overlays.length > 0
                  ? selectedCode.overlays.join(", ")
                  : "Standalone NPA"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Applies selected tile layer provider without API key watermarks.
 * Uses ESRI World Dark Gray Canvas, ESRI World Imagery, or OpenStreetMap.
 */
function applyTelecomTiles(L: any, group: any, style: "dark" | "google" | "satellite" | "street") {
  group.clearLayers();

  if (style === "google") {
    // Google Maps Roadmap Layer ('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}')
    L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution: "&copy; Google Maps",
    }).addTo(group);
  } else if (style === "satellite") {
    // Google Maps Hybrid Satellite
    L.tileLayer("https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution: "&copy; Google Maps",
    }).addTo(group);
  } else if (style === "street") {
    // OpenStreetMap Standard
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(group);
  } else {
    // ESRI Dark Gray Canvas Base + Reference (Futuristic Sleek Dark Radar, Free, No Watermark)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 16,
        attribution: "Esri, DeLorme, NAVTEQ",
      },
    ).addTo(group);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 16,
      },
    ).addTo(group);
  }
}
