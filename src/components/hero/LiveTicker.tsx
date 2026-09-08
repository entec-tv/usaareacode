import React from "react";
import { ShieldCheck, AlertTriangle, PhoneCall, Sparkles } from "lucide-react";

interface TickerItem {
  code: string;
  location: string;
  status: "safe" | "warning" | "verified";
  timeLabel: string;
  tag: string;
}

const TICKER_DATA: TickerItem[] = [
  { code: "212", location: "New York, NY", status: "safe", timeLabel: "Eastern Time", tag: "TCPA Safe Window" },
  { code: "310", location: "Los Angeles, CA", status: "safe", timeLabel: "Pacific Time", tag: "10-Digit Active" },
  { code: "876", location: "Jamaica (+1)", status: "warning", timeLabel: "Carib Overlay", tag: "Wangiri Risk High" },
  { code: "312", location: "Chicago, IL", status: "safe", timeLabel: "Central Time", tag: "LERG Synced" },
  { code: "415", location: "San Francisco, CA", status: "safe", timeLabel: "Pacific Time", tag: "Active Exchange" },
  { code: "800", location: "Nationwide Toll-Free", status: "verified", timeLabel: "US & Canada", tag: "FCC Authoritative" },
  { code: "305", location: "Miami, FL", status: "safe", timeLabel: "Eastern Time", tag: "Overlay 786" },
  { code: "416", location: "Toronto, ON", status: "verified", timeLabel: "Eastern Time", tag: "CRTC Registry" },
  { code: "214", location: "Dallas, TX", status: "safe", timeLabel: "Central Time", tag: "Telecom Center" },
  { code: "206", location: "Seattle, WA", status: "safe", timeLabel: "Pacific Time", tag: "Pacific Hub" },
];

interface LiveTickerProps {
  onSelectCode: (code: string) => void;
  isAr?: boolean;
  dark?: boolean;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ onSelectCode, isAr = false, dark = true }) => {
  // Duplicate for seamless loop
  const displayItems = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <div className={`w-full border-y py-2 overflow-hidden relative select-none ${
      dark 
        ? "border-slate-800/80 bg-slate-950/80 backdrop-blur-md text-slate-200" 
        : "border-border/60 bg-card/60 backdrop-blur-md text-foreground"
    }`}>
      {/* Edge Blur Faders */}
      <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 ${
        dark 
          ? "bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" 
          : "bg-gradient-to-r from-background via-background/80 to-transparent"
      }`} />
      <div className={`pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 ${
        dark 
          ? "bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent" 
          : "bg-gradient-to-l from-background via-background/80 to-transparent"
      }`} />

      {/* Live Indicator Tag on Left */}
      <div className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-xs ${
        dark 
          ? "bg-blue-500/15 border border-blue-500/30 text-blue-400" 
          : "bg-primary/10 border border-primary/20 text-primary"
      }`}>
        <span className={`size-1.5 rounded-full animate-pulse ${dark ? "bg-cyan-400" : "bg-primary"}`} />
        <span className="font-mono uppercase tracking-wider">{isAr ? "رادار حي" : "Live Feed"}</span>
      </div>

      <div className="animate-ticker flex items-center gap-3 md:pl-28">
        {displayItems.map((item, idx) => {
          const isWarning = item.status === "warning";
          const isVerified = item.status === "verified";

          return (
            <button
              key={`${item.code}-${idx}`}
              type="button"
              onClick={() => onSelectCode(item.code)}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs transition-all duration-150 cursor-pointer shrink-0 active:scale-95 ${
                isWarning
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                  : isVerified
                  ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25"
                  : dark
                  ? "bg-slate-900/90 border-slate-700/70 text-slate-200 hover:border-blue-500/50 hover:bg-slate-800"
                  : "bg-card/90 border-border/80 text-foreground/90 hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              {isWarning ? (
                <AlertTriangle className="size-3 text-amber-400 shrink-0" />
              ) : isVerified ? (
                <ShieldCheck className="size-3 text-indigo-400 shrink-0" />
              ) : (
                <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
              )}

              <span className={`font-mono font-bold ${dark ? "text-white" : "text-foreground"}`}>{item.code}</span>
              <span className={`font-medium text-[11px] ${dark ? "text-slate-400" : "text-muted-foreground"}`}>{item.location}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                dark 
                  ? "bg-slate-800/80 text-slate-300 border-slate-700/60" 
                  : "bg-muted/60 text-muted-foreground border-border/50"
              }`}>
                {item.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default LiveTicker;
