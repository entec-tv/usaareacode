import React from "react";
import { Shield, Clock, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

interface HeroFloatingCardsProps {
  onInspectCode: (code: string) => void;
  isAr?: boolean;
}

export const HeroFloatingCards: React.FC<HeroFloatingCardsProps> = ({ onInspectCode, isAr = false }) => {
  return (
    <div className="hidden lg:grid grid-cols-2 gap-4 max-w-4xl mx-auto mt-6 text-left" dir="ltr">
      {/* Card 1: Live Sample Dossier Bento */}
      <div 
        onClick={() => onInspectCode("212")}
        className="glass-apple p-4 rounded-2xl border border-border/80 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {isAr ? "عينة فحص مباشرة" : "Live Dossier Sample"}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="size-2.5" />
            <span>TCPA Safe</span>
          </span>
        </div>

        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl font-mono font-extrabold text-foreground group-hover:text-primary transition-colors">
            212
          </span>
          <span className="text-sm font-semibold text-foreground/90">New York (Manhattan), NY</span>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-border/50">
          <div>
            <div className="text-muted-foreground text-[10px] uppercase font-mono">Timezone</div>
            <div className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
              <Clock className="size-3 text-primary" />
              <span>Eastern (ET)</span>
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] uppercase font-mono">Overlays</div>
            <div className="font-mono font-medium text-foreground mt-0.5">646 • 917 • 332</div>
          </div>
          <div className="flex items-end justify-end">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
              <span>Inspect</span>
              <ArrowRight className="size-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: TCPA Live Radar Status */}
      <div 
        onClick={() => onInspectCode("310")}
        className="glass-apple p-4 rounded-2xl border border-border/80 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="size-3.5 text-primary" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {isAr ? "رادار الامتثال الفيدرالي" : "US Outbound Calling Windows"}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold">
            8 AM – 9 PM Window
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center py-1">
          <div className="p-1.5 rounded-xl bg-muted/40 border border-border/40">
            <div className="text-[10px] font-mono text-muted-foreground">ET (NY)</div>
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">OPEN</div>
          </div>
          <div className="p-1.5 rounded-xl bg-muted/40 border border-border/40">
            <div className="text-[10px] font-mono text-muted-foreground">CT (CHI)</div>
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">OPEN</div>
          </div>
          <div className="p-1.5 rounded-xl bg-muted/40 border border-border/40">
            <div className="text-[10px] font-mono text-muted-foreground">MT (DEN)</div>
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">OPEN</div>
          </div>
          <div className="p-1.5 rounded-xl bg-muted/40 border border-border/40">
            <div className="text-[10px] font-mono text-muted-foreground">PT (LA)</div>
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">OPEN</div>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-muted-foreground flex items-center justify-between pt-2 border-t border-border/50">
          <span className="flex items-center gap-1.5 text-xs text-foreground/80 font-medium">
            <Zap className="size-3 text-amber-500" />
            <span>Statutory Safe Harbor Validated</span>
          </span>
          <span className="text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
            <span>Verify 310</span>
            <ArrowRight className="size-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
export default HeroFloatingCards;
