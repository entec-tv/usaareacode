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
        // Development Preview Container (Avoids empty space & CLS during local dev)
        <div
          style={{ minHeight, ...style }}
          className="w-full max-w-4xl rounded-lg border border-dashed border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 p-4 flex flex-col items-center justify-center text-xs text-muted-foreground backdrop-blur-sm shadow-xs"
        >
          <div className="flex items-center gap-2 font-medium text-sky-600 dark:text-sky-400">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <span>Google AdSense Slot ({format})</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground/80">
            Client: <code className="font-mono text-foreground/90">{GOOGLE_ADS_CONFIG.client}</code>
            {slot ? <> · Slot ID: <code className="font-mono text-foreground/90">{slot}</code></> : " · Auto Layout"}
          </p>
          <span className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-medium">
            Active in Production Build
          </span>
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
