import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Layers,
  Globe2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Radio,
  RotateCcw,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

import { type AreaCode } from "@/data/areaCodes";
import { getAreaCodeCoordinates, MAJOR_CITIES_COORDS } from "@/data/geoCoordinates";
import { localTime, callingWindow, type LocalTime, type CallWindow } from "@/lib/nanp";

interface AreaCodeLeafletMapProps {
  item: AreaCode;
  t: (k: string) => string;
  isAr?: boolean | undefined;
  onNavigateToRadar?: (() => void) | undefined;
}

type MapLayerType = "google" | "dark" | "satellite" | "street";

function getTargetCoordinates(item: AreaCode, city: string | null): [number, number] {
  if (city) {
    const coords = MAJOR_CITIES_COORDS[city.trim()];
    if (coords) return coords;
  }
  return getAreaCodeCoordinates(item);
}

export function AreaCodeLeafletMap({
  item,
  t,
  isAr = false,
  onNavigateToRadar,
}: AreaCodeLeafletMapProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [mapLayer, setMapLayer] = useState<MapLayerType>("google");
  const [zoomLevel, setZoomLevel] = useState(10);
  const [now, setNow] = useState<Date>(new Date());

  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerGroupRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  // Reset selected city on code change
  useEffect(() => {
    setSelectedCity(null);
  }, [item.code]);

  // Live time ticker
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const targetCity = selectedCity || item.cities[0] || item.regionName;
  const currentCoords = getTargetCoordinates(item, selectedCity);
  const clock = localTime(item.timezone, now);
  const win = callingWindow(clock.hour);
  const isHighRisk = !!item.risk;

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!containerRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");
      if (!isMounted || !containerRef.current) return;

      const coords = getTargetCoordinates(item, selectedCity);

      const map = L.map(containerRef.current, {
        center: coords,
        zoom: 10,
        minZoom: 3,
        maxZoom: 17,
        zoomControl: false,
        attributionControl: false,
      });

      // Layer group for tiles
      const tileGroup = L.layerGroup().addTo(map);
      tileLayerGroupRef.current = tileGroup;

      applyTileLayer(L, tileGroup, mapLayer);

      // Add animated pulse marker
      const customIcon = createMarkerIcon(L, item.code, isHighRisk);
      const marker = L.marker(coords, { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      // Add rate center radial coverage zone
      const circle = L.circle(coords, {
        radius: 26000, // ~26 km radius
        color: isHighRisk ? "#f43f5e" : "#06b6d4",
        weight: 1.5,
        opacity: 0.8,
        fillColor: isHighRisk ? "#f43f5e" : "#06b6d4",
        fillOpacity: 0.12,
        dashArray: "4, 6",
      }).addTo(map);
      circleRef.current = circle;

      // Popup
      const popupHtml = buildPopupHtml(item, targetCity, clock, win, isHighRisk);
      marker.bindPopup(popupHtml, {
        className: "telecom-dark-popup",
        closeButton: false,
        offset: [0, -10],
      });

      map.on("zoomend", () => {
        setZoomLevel(map.getZoom());
      });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerGroupRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, [item.code]);

  // Handle Layer change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerGroupRef.current) return;
    import("leaflet").then((L) => {
      applyTileLayer(L, tileLayerGroupRef.current, mapLayer);
    });
  }, [mapLayer]);

  // Handle city selection or coordinate changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    const coords = getTargetCoordinates(item, selectedCity);
    mapInstanceRef.current.flyTo(coords, 10, { duration: 1.2 });

    markerRef.current.setLatLng(coords);
    if (circleRef.current) {
      circleRef.current.setLatLng(coords);
    }

    const popupHtml = buildPopupHtml(item, targetCity, clock, win, isHighRisk);
    markerRef.current.setPopupContent(popupHtml);
  }, [selectedCity, targetCity, item, isHighRisk]);

  function applyTileLayer(L: any, group: any, layer: MapLayerType) {
    group.clearLayers();

    if (layer === "google") {
      // Google Maps Roadmap Layer ('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}')
      L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "&copy; Google Maps",
      }).addTo(group);
    } else if (layer === "satellite") {
      // Google Maps Hybrid Satellite Layer
      L.tileLayer("https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "&copy; Google Maps",
      }).addTo(group);
    } else if (layer === "street") {
      // OpenStreetMap Standard
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(group);
    } else {
      // ESRI Dark Gray Canvas (Default Sleek Radar Dark)
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

  function createMarkerIcon(L: any, code: string, highRisk: boolean) {
    const iconHtml = `
      <div class="relative group cursor-pointer flex items-center justify-center">
        <span class="absolute inline-flex h-10 w-12 rounded-full ${
          highRisk ? "bg-rose-500/40" : "bg-cyan-400/40"
        } animate-ping opacity-75"></span>
        <div class="relative h-7 min-w-[42px] px-2 rounded-full flex items-center justify-center text-[13px] font-sans font-black shadow-2xl border-2 ${
          highRisk
            ? "bg-rose-600 text-white border-white shadow-[0_0_14px_rgba(244,63,94,0.8)]"
            : "bg-cyan-400 text-slate-950 border-white shadow-[0_3px_10px_rgba(0,0,0,0.6)]"
        }">
          <span style="font-weight: 900; letter-spacing: -0.3px; display: inline-block; line-height: 1;">${code}</span>
        </div>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: "custom-area-marker",
      iconSize: [42, 28],
      iconAnchor: [21, 14],
    });
  }

  function buildPopupHtml(
    codeItem: AreaCode,
    cityStr: string,
    clockObj: LocalTime,
    winObj: CallWindow,
    highRisk: boolean,
  ) {
    return `
      <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 230px; color: #f8fafc; background: #0b1120; padding: 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 10px;">
          <span style="font-family: monospace; font-size: 20px; font-weight: 900; color: #38bdf8; letter-spacing: -0.5px;">+1 (${codeItem.code})</span>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: ${
            highRisk ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)"
          }; color: ${highRisk ? "#fb7185" : "#34d399"}; border: 1px solid ${
            highRisk ? "rgba(244,63,94,0.4)" : "rgba(16,185,129,0.4)"
          };">
            ${highRisk ? "⚠️ HIGH RISK" : "✓ VERIFIED"}
          </span>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #f1f5f9; margin-bottom: 2px;">
          ${cityStr}
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 10px;">
          ${codeItem.regionName} (${codeItem.region}) • ${codeItem.country}
        </div>
        <div style="background: rgba(255,255,255,0.06); padding: 8px 10px; border-radius: 10px; font-size: 11px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05);">
          <div>
            <div style="color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 700;">Local Time</div>
            <div style="font-family: monospace; font-weight: 800; color: #f8fafc; font-size: 12px;">${clockObj.time}</div>
          </div>
          <div style="text-align: right;">
            <div style="color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 700;">TCPA Window</div>
            <div style="font-weight: 700; color: ${
              winObj.status === "good" ? "#34d399" : winObj.status === "caution" ? "#fbbf24" : "#fb7185"
            }; font-size: 11px;">${winObj.label}</div>
          </div>
        </div>
        <div style="font-size: 10px; color: #94a3b8;">
          <strong style="color: #cbd5e1;">Carrier:</strong> ${codeItem.carrier}
        </div>
      </div>
    `;
  }

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      const coords = getTargetCoordinates(item, selectedCity);
      mapInstanceRef.current.flyTo(coords, 10, { duration: 1.0 });
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/80 dark:border-white/10 p-4 sm:p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full min-h-[380px] sm:min-h-[400px]">
      <div className="space-y-3 flex-1 flex flex-col">
        {/* Header: Title & Map Layer Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-primary shadow-xs">
              <MapPin className="size-4" />
            </div>
            <div>
              <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-none truncate max-w-[260px] sm:max-w-xs">
                {targetCity && targetCity !== item.regionName
                  ? `${targetCity} • ${item.regionName} (${item.region})`
                  : `${item.regionName} (${item.region})`}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {isAr ? "نطاق التغطية الجغرافية والتبادل المحلي" : "Geographic Telecom Coverage & Rate Center"}
              </p>
            </div>
          </div>

          {/* Map Style & Zoom Controls */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-white/[0.04] p-1 rounded-2xl border border-black/[0.06] dark:border-white/10">
            {/* Google Maps Roadmap */}
            <button
              onClick={() => setMapLayer("google")}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mapLayer === "google"
                  ? "bg-white dark:bg-cyan-500/25 text-primary dark:text-cyan-300 border border-black/[0.04] dark:border-cyan-400/40 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Google Maps Roadmap (http://{s}.google.com/vt/lyrs=m)"
            >
              Google
            </button>

            {/* Dark Radar */}
            <button
              onClick={() => setMapLayer("dark")}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mapLayer === "dark"
                  ? "bg-white dark:bg-cyan-500/25 text-primary dark:text-cyan-300 border border-black/[0.04] dark:border-cyan-400/40 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Dark Radar Layer"
            >
              Radar
            </button>

            {/* Satellite */}
            <button
              onClick={() => setMapLayer("satellite")}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mapLayer === "satellite"
                  ? "bg-white dark:bg-cyan-500/25 text-primary dark:text-cyan-300 border border-black/[0.04] dark:border-cyan-400/40 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Google Satellite / Hybrid"
            >
              Satellite
            </button>

            <div className="w-px h-3.5 bg-slate-300 dark:bg-white/15 mx-0.5" />

            {/* Zoom In */}
            <button
              onClick={handleZoomIn}
              className="px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
              title="Zoom In"
            >
              +
            </button>

            {/* Zoom Out */}
            <button
              onClick={handleZoomOut}
              className="px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>

            {/* Reset Center */}
            <button
              onClick={handleResetCenter}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-cyan-300 hover:bg-black/[0.04] dark:hover:bg-white/10 text-xs transition-all cursor-pointer"
              title="Re-center Map"
            >
              <RotateCcw className="size-3" />
            </button>
          </div>
        </div>

        {/* Embedded Interactive Leaflet Map */}
        <div className="relative flex-1 w-full min-h-[210px] sm:min-h-[250px] rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/10 shadow-inner bg-slate-100 dark:bg-slate-950">
          <div ref={containerRef} className="w-full h-full min-h-[210px] sm:min-h-[250px]" style={{ zIndex: 1 }} />

          {/* Coordinates HUD overlay */}
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border border-black/[0.08] dark:border-white/10 text-[10px] font-mono text-slate-700 dark:text-slate-300 shadow-xs">
            <span className="size-1.5 rounded-full bg-primary dark:bg-cyan-400 animate-pulse" />
            <span>
              {currentCoords[0].toFixed(3)}°N, {Math.abs(currentCoords[1]).toFixed(3)}°W
            </span>
          </div>
        </div>

        {/* Rate Center City Quick Filters */}
        {item.cities && item.cities.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400 shrink-0 mr-1">
              {isAr ? "المدن التابعة:" : "Focus City:"}
            </span>
            <button
              onClick={() => setSelectedCity(null)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer shrink-0 border shadow-xs ${
                selectedCity === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white/70 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.08] border-black/[0.08] dark:border-white/10"
              }`}
            >
              {isAr ? "الكل" : "All"} ({item.cities.length})
            </button>
            {item.cities.slice(0, 6).map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer shrink-0 border shadow-xs ${
                  selectedCity === city
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white/70 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.08] border-black/[0.08] dark:border-white/10"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Telemetry Strip */}
      <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
          <span className="size-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          <span>{isAr ? "نظام رادار التغطية الجغرافية نشط" : "Live Rate Center Geocoding Active"}</span>
        </div>

        {onNavigateToRadar ? (
          <button
            onClick={onNavigateToRadar}
            className="px-3.5 py-1.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-primary hover:text-blue-700 dark:text-cyan-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <Radio className="size-3 text-primary animate-pulse" />
            <span>{isAr ? "غرفة عمليات الرادار" : "Operations Radar Room"}</span>
          </button>
        ) : (
          <div className="text-[11px] font-mono text-slate-400 dark:text-cyan-400/80">
            Leaflet &bull; Esri &bull; OSM
          </div>
        )}
      </div>
    </div>
  );
}
