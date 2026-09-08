import React, { useState } from "react";
import { NA_REGION_PATHS } from "./NorthAmericaPaths";

interface HubNode {
  id: string;
  code: string;
  city: string;
  region: string;
  x: number; // coordinate space
  y: number;
  pulseDelay: string;
  tz: string;
  isAnchor?: boolean;
}

// Exact rate-center coordinates mapped onto the coordinate canvas
const HUBS: HubNode[] = [
  { id: "nyc", code: "212", city: "New York", region: "NY", x: 864, y: 563, pulseDelay: "0s", tz: "ET", isAnchor: true },
  { id: "bos", code: "617", city: "Boston", region: "MA", x: 884, y: 544, pulseDelay: "1.2s", tz: "ET" },
  { id: "chi", code: "312", city: "Chicago", region: "IL", x: 728, y: 588, pulseDelay: "0.5s", tz: "CT", isAnchor: true },
  { id: "tor", code: "416", city: "Toronto", region: "ON", x: 808, y: 538, pulseDelay: "2.0s", tz: "ET", isAnchor: true },
  { id: "mtl", code: "514", city: "Montreal", region: "QC", x: 856, y: 512, pulseDelay: "1.5s", tz: "ET" },
  { id: "wdc", code: "202", city: "Washington", region: "DC", x: 836, y: 592, pulseDelay: "0.9s", tz: "ET" },
  { id: "atl", code: "404", city: "Atlanta", region: "GA", x: 796, y: 676, pulseDelay: "1.7s", tz: "ET" },
  { id: "mia", code: "305", city: "Miami", region: "FL", x: 825, y: 742, pulseDelay: "0.8s", tz: "ET", isAnchor: true },
  { id: "dfw", code: "214", city: "Dallas", region: "TX", x: 642, y: 695, pulseDelay: "1.1s", tz: "CT", isAnchor: true },
  { id: "den", code: "303", city: "Denver", region: "CO", x: 583, y: 603, pulseDelay: "2.3s", tz: "MT" },
  { id: "lax", code: "310", city: "Los Angeles", region: "CA", x: 462, y: 642, pulseDelay: "0.3s", tz: "PT", isAnchor: true },
  { id: "sfo", code: "415", city: "San Francisco", region: "CA", x: 436, y: 602, pulseDelay: "1.4s", tz: "PT", isAnchor: true },
  { id: "sea", code: "206", city: "Seattle", region: "WA", x: 460, y: 478, pulseDelay: "1.9s", tz: "PT", isAnchor: true },
  { id: "van", code: "604", city: "Vancouver", region: "BC", x: 450, y: 468, pulseDelay: "2.2s", tz: "PT" },
];

const CONNECTIONS: [string, string][] = [
  ["nyc", "bos"],
  ["nyc", "tor"],
  ["tor", "mtl"],
  ["nyc", "wdc"],
  ["wdc", "atl"],
  ["atl", "mia"],
  ["atl", "chi"],
  ["chi", "nyc"],
  ["chi", "tor"],
  ["chi", "dfw"],
  ["chi", "den"],
  ["dfw", "atl"],
  ["dfw", "den"],
  ["dfw", "lax"],
  ["den", "sfo"],
  ["sfo", "lax"],
  ["sfo", "sea"],
  ["sea", "van"],
];

// Major telecom density state IDs to highlight with vibrant border & fill
const HIGHLIGHT_STATES = new Set([
  "NY", "CA", "IL", "TX", "FL", "WA", "GA", "MA", "ON", "QC", "BC", "CO", "DC"
]);

interface NaMapPulseProps {
  onSelectCode?: (code: string) => void;
  className?: string;
}

export const NaMapPulse: React.FC<NaMapPulseProps> = ({ onSelectCode, className = "" }) => {
  const [hoveredHub, setHoveredHub] = useState<HubNode | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const hubMap = new Map(HUBS.map((h) => [h.id, h]));

  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      <svg
        viewBox="370 340 590 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Fiber Optic Data Stream Gradient */}
          <linearGradient id="fiberStreamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0071e3" stopOpacity="0.9" />
          </linearGradient>

          {/* Radar Node Glow Filter */}
          <filter id="telecomGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Oceanic Latitude / Longitude Grid Pattern */}
          <pattern id="geoGridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              className="text-blue-500/[0.08] dark:text-blue-400/[0.12]"
            />
          </pattern>
        </defs>

        {/* Background Coordinate Grid */}
        <rect x="360" y="330" width="610" height="460" fill="url(#geoGridPattern)" />

        {/* Telecom Coordinate Reference Parallels */}
        <g className="text-blue-500/25 dark:text-blue-400/35 font-mono text-[8px] select-none pointer-events-none">
          {/* 49°N US-Canada International Border */}
          <line x1="380" y1="465" x2="950" y2="465" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 4" />
          <text x="385" y="461" fill="currentColor">49°N [NANP US-CA BORDER]</text>

          {/* 30°N Southern Gulf Parallel */}
          <line x1="480" y1="730" x2="920" y2="730" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 4" />
          <text x="860" y="726" fill="currentColor">30°N GULF</text>

          {/* Meridians */}
          <line x1="460" y1="360" x2="460" y2="760" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 4" />
          <text x="463" y="375" fill="currentColor">120°W</text>
          <line x1="660" y1="360" x2="660" y2="760" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 4" />
          <text x="663" y="375" fill="currentColor">100°W</text>
          <line x1="860" y1="360" x2="860" y2="760" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 4" />
          <text x="863" y="375" fill="currentColor">80°W</text>
        </g>

        {/* =========================================================================
            DETAILED NORTH AMERICAN STATE & PROVINCE VECTOR BOUNDARIES
        ========================================================================= */}
        <g id="naLandmass" className="transition-colors duration-300">
          {NA_REGION_PATHS.map((region) => {
            const isHighlighted = HIGHLIGHT_STATES.has(region.id);
            const isHovered = hoveredRegion === region.id;

            return (
              <path
                key={region.id}
                id={`region-${region.id}`}
                d={region.d}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={isHovered ? "1.8" : isHighlighted ? "1.4" : "1.0"}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`transition-all duration-200 pointer-events-auto cursor-pointer ${
                  isHovered
                    ? "fill-blue-500/35 stroke-cyan-400"
                    : isHighlighted
                    ? "fill-blue-500/[0.12] stroke-blue-400/50"
                    : "fill-slate-800/[0.28] stroke-slate-700/35"
                }`}
              >
                <title>{region.name} ({region.id})</title>
              </path>
            );
          })}
        </g>

        {/* =========================================================================
            FIBER OPTIC INTERCONNECT LINES (Animated Pulse Streams)
        ========================================================================= */}
        <g id="telecomLines" className="pointer-events-none">
          {CONNECTIONS.map(([srcId, dstId], idx) => {
            const src = hubMap.get(srcId);
            const dst = hubMap.get(dstId);
            if (!src || !dst) return null;

            // Compute curved control point for natural telephony routing arcs
            const midX = (src.x + dst.x) / 2;
            const midY = (src.y + dst.y) / 2 - 12;

            return (
              <g key={`conn-${srcId}-${dstId}`}>
                {/* Background glow line */}
                <path
                  d={`M ${src.x} ${src.y} Q ${midX} ${midY} ${dst.x} ${dst.y}`}
                  stroke="url(#fiberStreamGrad)"
                  strokeWidth="1.8"
                  strokeOpacity="0.55"
                  fill="none"
                />
                {/* Animated dash flow line */}
                <path
                  d={`M ${src.x} ${src.y} Q ${midX} ${midY} ${dst.x} ${dst.y}`}
                  stroke="#0284c7"
                  strokeWidth="2.0"
                  strokeDasharray="4 8"
                  strokeLinecap="round"
                  fill="none"
                  className="animate-pulse"
                  style={{ animationDuration: `${2.0 + (idx % 3) * 0.4}s` }}
                />
              </g>
            );
          })}
        </g>

        {/* =========================================================================
            ACTIVE TELEMETRY NODES (Major Rate Centers)
        ========================================================================= */}
        <g id="telecomNodes" className="pointer-events-auto">
          {HUBS.map((hub) => {
            const isHovered = hoveredHub?.id === hub.id;
            const r = hub.isAnchor ? 4.5 : 3.5;

            return (
              <g
                key={`hub-${hub.id}`}
                className="cursor-pointer group"
                onClick={() => onSelectCode?.(hub.code)}
                onMouseEnter={() => setHoveredHub(hub)}
                onMouseLeave={() => setHoveredHub(null)}
              >
                {/* Radar Ping Wave 1 */}
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r="16"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="1.4"
                  className="origin-center animate-ping opacity-75"
                  style={{ animationDelay: hub.pulseDelay, animationDuration: "2.8s" }}
                />

                {/* Radar Ping Wave 2 */}
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r="24"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="0.9"
                  className="origin-center animate-ping opacity-45"
                  style={{ animationDelay: `${parseFloat(hub.pulseDelay) + 0.9}s`, animationDuration: "3.2s" }}
                />

                {/* Inner Glow Aura */}
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r={isHovered ? 8 : 6}
                  fill="#0071e3"
                  fillOpacity="0.4"
                  filter="url(#telecomGlow)"
                  className="transition-all duration-200"
                />

                {/* Core Anchor Dot */}
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r={r}
                  fill="#38bdf8"
                  stroke="#0284c7"
                  strokeWidth="2.2"
                  className="transition-transform duration-200 group-hover:scale-150"
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Hover Dossier Mini Tooltip */}
      {hoveredHub && (
        <div
          className="absolute z-30 pointer-events-none px-3 py-2 rounded-xl bg-card/95 backdrop-blur-md border border-primary/50 shadow-2xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in duration-150"
          style={{
            left: `${((hoveredHub.x - 370) / 590) * 100}%`,
            top: `${((hoveredHub.y - 340) / 440) * 100 - 3}%`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-primary text-sm">{hoveredHub.code}</span>
            <span className="font-bold text-foreground">{hoveredHub.city}, {hoveredHub.region}</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-between gap-4 font-mono">
            <span>Timezone: {hoveredHub.tz}</span>
            <span className="text-emerald-500 font-bold">Click to inspect NPA</span>
          </div>
        </div>
      )}
    </div>
  );
};
