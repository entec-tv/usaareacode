import React, { useEffect, useRef } from "react";
import { GOOGLE_ADS_CONFIG } from "../../config/ads";

export interface GoogleAdBannerProps {
  /** AdSense Slot ID (optional for auto ads, required for specific units) */
  slot?: string;
  /** Ad unit layout format */
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  /** Whether to enable full-width responsive behavior */
  responsive?: boolean;
  /** Custom wrapper CSS classes */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Optional custom ad label text (default: 'ADVERTISEMENT') */
  label?: string;
  /** Hide the subtle label entirely */
  hideLabel?: boolean;
  /** Force live rendering even in development */
  forceLive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export const GoogleAdBanner: React.FC<GoogleAdBannerProps> = ({
  slot,
  format = "auto",
  responsive = true,
  className = "",
  style,
  label = "ADVERTISEMENT",
  hideLabel = false,
  forceLive = false,
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  const isDev = import.meta.env.DEV && !forceLive;

  useEffect(() => {
    if (isDev) return;
    if (typeof window === "undefined") return;

    if (adRef.current && !pushedRef.current) {
      pushedRef.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        // Safe catch for ad-blockers or duplicate executions
        console.warn("AdSense push notice:", err);
      }
    }
  }, [isDev]);

  if (!GOOGLE_ADS_CONFIG.enabled) {
    return null;
  }

  // Pre-calculated default heights to prevent Cumulative Layout Shift (CLS)
  const minHeight =
    format === "horizontal"
      ? 90
      : format === "rectangle"
      ? 250
      : 90;

  return (
    <div
      className={`ad-space-container my-6 w-full flex flex-col items-center justify-center overflow-hidden text-center transition-opacity ${className}`}
      aria-label="Sponsor Advertisement"
    >
      {!hideLabel && (
        <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground/60 mb-1.5 select-none">
          {label}
        </span>
      )}

      {isDev ? (
        // Development: minimal collapsed indicator — does not disrupt page layout
        <div
          className="w-full max-w-4xl rounded border border-dashed border-sky-400/20 bg-sky-50/30 dark:bg-sky-950/10 px-3 py-1.5 flex items-center gap-2 text-[10px] text-sky-600/60 dark:text-sky-400/50 font-mono"
          title={`AdSense Dev Slot — ${format}${slot ? ` | ${slot}` : ""}`}
        >
          <svg className="w-3 h-3 shrink-0 opacity-60" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <span className="opacity-60">AdSense · {format}{slot ? ` · ${slot}` : ""} · dev only</span>
        </div>
      ) : (
        // Production Google AdSense Tag
        <div className="w-full flex justify-center overflow-hidden" style={{ minHeight }}>
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block", minWidth: "280px", ...style }}
            data-ad-client={GOOGLE_ADS_CONFIG.client}
            {...(slot ? { "data-ad-slot": slot } : {})}
            data-ad-format={format}
            data-full-width-responsive={responsive ? "true" : "false"}
          />
        </div>
      )}
    </div>
  );
};

export default GoogleAdBanner;
