export type ClientGeoInfo = {
  country?: string | undefined;
  countryCode?: string | undefined;
  city?: string | undefined;
  ip?: string | undefined;
  timezone?: string | undefined;
};

// Safe cache in sessionStorage
const GEO_CACHE_KEY = "entec:client_geo";

// Fallback timezone to country mapping for reliable offline / instant detection
const TIMEZONE_COUNTRY_MAP: Record<string, { country: string; code: string }> = {
  "America/New_York": { country: "United States", code: "US" },
  "America/Chicago": { country: "United States", code: "US" },
  "America/Denver": { country: "United States", code: "US" },
  "America/Los_Angeles": { country: "United States", code: "US" },
  "America/Phoenix": { country: "United States", code: "US" },
  "America/Anchorage": { country: "United States", code: "US" },
  "America/Toronto": { country: "Canada", code: "CA" },
  "America/Vancouver": { country: "Canada", code: "CA" },
  "America/Montreal": { country: "Canada", code: "CA" },
  "America/Halifax": { country: "Canada", code: "CA" },
  "Asia/Riyadh": { country: "Saudi Arabia", code: "SA" },
  "Asia/Dubai": { country: "United Arab Emirates", code: "AE" },
  "Asia/Kuwait": { country: "Kuwait", code: "KW" },
  "Asia/Qatar": { country: "Qatar", code: "QA" },
  "Asia/Bahrain": { country: "Bahrain", code: "BH" },
  "Africa/Cairo": { country: "Egypt", code: "EG" },
  "Europe/London": { country: "United Kingdom", code: "GB" },
  "Europe/Berlin": { country: "Germany", code: "DE" },
  "Europe/Paris": { country: "France", code: "FR" },
};

export async function getClientGeoInfo(): Promise<ClientGeoInfo> {
  if (typeof window === "undefined") return {};

  const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined;

  // 1. Check Session Cache
  try {
    const cached = sessionStorage.getItem(GEO_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as ClientGeoInfo;
      return { ...parsed, timezone: tz };
    }
  } catch {
    // Ignore storage issues
  }

  // Fallback seed from browser timezone
  let result: ClientGeoInfo = {
    timezone: tz,
    country: tz && TIMEZONE_COUNTRY_MAP[tz] ? TIMEZONE_COUNTRY_MAP[tz]?.country : undefined,
    countryCode: tz && TIMEZONE_COUNTRY_MAP[tz] ? TIMEZONE_COUNTRY_MAP[tz]?.code : undefined,
  };

  // 2. Fetch non-blocking geo from lightweight service
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch("https://ipapi.co/json/", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && !data.error) {
        result = {
          country: data.country_name || result.country,
          countryCode: data.country_code || result.countryCode,
          city: data.city || undefined,
          ip: data.ip ? `${data.ip.split(".").slice(0, 3).join(".")}.***` : undefined, // Mask last octet for privacy
          timezone: tz || data.timezone,
        };
        sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(result));
        return result;
      }
    }
  } catch {
    // Silent fail - return timezone-based result
  }

  return result;
}

// Dual in-memory and session velocity tracking to prevent tampering
const IN_MEMORY_TIMESTAMPS: number[] = [];

// Security query velocity check (detect anomalous rapid searches in 20 seconds)
export function checkSearchVelocity(): { flagged: boolean; count: number } {
  if (typeof window === "undefined") return { flagged: false, count: 0 };
  try {
    const now = Date.now();
    const key = "entec:velocity_window";

    // 1. In-memory window maintenance
    while (IN_MEMORY_TIMESTAMPS.length > 0 && now - (IN_MEMORY_TIMESTAMPS[0] ?? 0) > 20000) {
      IN_MEMORY_TIMESTAMPS.shift();
    }
    IN_MEMORY_TIMESTAMPS.push(now);

    // 2. SessionStorage window maintenance
    let sessionTimestamps: number[] = [];
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        sessionTimestamps = JSON.parse(raw);
        if (!Array.isArray(sessionTimestamps)) sessionTimestamps = [];
      }
    } catch {
      sessionTimestamps = [];
    }

    sessionTimestamps = sessionTimestamps.filter((t) => typeof t === "number" && now - t < 20000);
    sessionTimestamps.push(now);
    try {
      sessionStorage.setItem(key, JSON.stringify(sessionTimestamps));
    } catch {
      // Storage quota or privacy sandbox
    }

    // Use maximum of in-memory or session count to prevent client script reset tricks
    const effectiveCount = Math.max(IN_MEMORY_TIMESTAMPS.length, sessionTimestamps.length);

    // If more than 6 queries in 20 seconds, flag as suspicious rapid automated traffic
    const flagged = effectiveCount >= 6;
    return { flagged, count: effectiveCount };
  } catch {
    return { flagged: false, count: 0 };
  }
}
