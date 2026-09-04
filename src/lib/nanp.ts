import { AREA_CODES, AREA_CODE_MAP, carrierFor, type AreaCode } from "@/data/areaCodes";

export type InputKind = "areacode" | "prefix" | "phone" | "city" | "region" | "unknown";

export interface LookupResult {
  kind: InputKind;
  query: string;
  normalizedPhone?: string;
  e164?: string;
  npa?: string;
  nxx?: string;
  matches: AreaCode[];
}

const DIGITS = /\D+/g;

const ARABIC_REGIONS: Record<string, string> = {
  "كاليفورنيا": "CA",
  "نيويورك": "NY",
  "تكساس": "TX",
  "فلوريدا": "FL",
  "إلينوي": "IL",
  "بنسلفانيا": "PA",
  "أوهايو": "OH",
  "جورجيا": "GA",
  "كارولاينا الشمالية": "NC",
  "كارولاينا الجنوبية": "SC",
  "ميشيغان": "MI",
  "نيوجيرسي": "NJ",
  "فرجينيا": "VA",
  "واشنطن": "WA",
  "أريزونا": "AZ",
  "ماساتشوستس": "MA",
  "تينيسي": "TN",
  "إنديانا": "IN",
  "ميسوري": "MO",
  "ماريلاند": "MD",
  "ويسكونسن": "WI",
  "كولورادو": "CO",
  "مينيسوتا": "MN",
  "ألاباما": "AL",
  "لويزيانا": "LA",
  "كنتاكي": "KY",
  "أوريغون": "OR",
  "أوكلاهوما": "OK",
  "كونيتيكت": "CT",
  "يوتا": "UT",
  "نيفادا": "NV",
  "أيوا": "IA",
  "أركنساس": "AR",
  "كانساس": "KS",
  "مسيسيبي": "MS",
  "نيومكسيكو": "NM",
  "نبراسكا": "NE",
  "أيداهو": "ID",
  "فيرمونت": "VT",
  "مين": "ME",
  "نيوهامبشير": "NH",
  "هاواي": "HI",
  "ألاسكا": "AK",
  "أونتاريو": "ON",
  "كيبيك": "QC",
  "كولومبيا البريطانية": "BC",
  "ألبرتا": "AB",
};

export function cleanNanpDigits(raw: string): string {
  let d = raw.replace(DIGITS, "");
  if ((d.length === 11 || d.length === 4) && d.startsWith("1")) {
    d = d.slice(1);
  }
  return d;
}

export function detectInput(raw: string): InputKind {
  const q = raw.trim();
  if (!q) return "unknown";
  
  const d = cleanNanpDigits(q);
  if (d.length >= 7 && /^[\d\s()+.-]+$/.test(q)) return "phone";
  if (d.length === 6 && /^[\d\s()+.-]+$/.test(q)) return "prefix";
  if (d.length === 3 && /^\+?\d{3,4}$/.test(q.replace(/[\s()-]/g, ""))) return "areacode";
  
  const lower = q.toLowerCase();
  if (ARABIC_REGIONS[q] || AREA_CODES.some((a) => a.regionName.toLowerCase() === lower || a.region.toLowerCase() === lower)) {
    return "region";
  }
  return "city";
}

export function formatUS(digits: string): string {
  const d = cleanNanpDigits(digits);
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-XXXX`;
  return digits;
}

export function toE164(digits: string): string {
  const d = cleanNanpDigits(digits);
  return d.length === 10 ? `+1${d}` : d ? `+${d}` : "";
}

export function isValidNanp(raw: string): boolean {
  const d = cleanNanpDigits(raw);
  if (d.length !== 10) return false;
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(d);
}

export function lookup(raw: string): LookupResult {
  const query = raw.trim();
  const kind = detectInput(query);
  if (!query) return { kind: "unknown", query, matches: [] };

  const digits = cleanNanpDigits(query);

  if (kind === "phone") {
    const npa = digits.slice(0, 3);
    const nxx = digits.slice(3, 6);
    return {
      kind,
      query,
      npa,
      nxx,
      normalizedPhone: formatUS(digits),
      e164: toE164(digits),
      matches: digits.length >= 10 ? (AREA_CODE_MAP[npa] ?? []) : [],
    };
  }

  if (kind === "prefix") {
    const npa = digits.slice(0, 3);
    const nxx = digits.slice(3, 6);
    return {
      kind,
      query,
      npa,
      nxx,
      normalizedPhone: `(${npa}) ${nxx}-XXXX`,
      e164: `+1${npa}${nxx}XXXX`,
      matches: AREA_CODE_MAP[npa] ?? [],
    };
  }

  if (kind === "areacode") {
    const npa = digits;
    return { 
      kind, 
      query, 
      npa,
      matches: AREA_CODE_MAP[npa] ?? [] 
    };
  }

  const lower = query.toLowerCase();
  const arabicRegionAbbr = ARABIC_REGIONS[query];

  if (kind === "region" || arabicRegionAbbr) {
    const targetAbbr = (arabicRegionAbbr ?? lower).toLowerCase();
    return {
      kind: "region",
      query,
      matches: AREA_CODES.filter(
        (a) => a.region.toLowerCase() === targetAbbr || a.regionName.toLowerCase() === lower,
      ),
    };
  }

  return {
    kind: "city",
    query,
    matches: AREA_CODES.filter(
      (a) =>
        a.cities.some((c) => c.toLowerCase().includes(lower)) ||
        a.regionName.toLowerCase().includes(lower),
    ).slice(0, 40),
  };
}

export { carrierFor };

export interface LocalTime {
  time: string;
  date: string;
  hour: number;
  minute: number;
  offset: string;
}

export function localTime(timezone: string, now: Date = new Date()): LocalTime {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const dateFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    const offset =
      new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "shortOffset" })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName")?.value ?? "";
    return { time: fmt.format(now), date: dateFmt.format(now), hour, minute, offset };
  } catch {
    return { time: "--:--:--", date: "N/A", hour: 12, minute: 0, offset: "UTC" };
  }
}

export type CallStatus = "good" | "caution" | "blocked";

export interface CallWindow {
  status: CallStatus;
  label: string;
  detail: string;
}

/** FCC/TCPA telemarketing window is 8AM–9PM local; courteous window is 9AM–8PM. */
export function callingWindow(hour: number): CallWindow {
  if (hour >= 9 && hour < 20)
    return {
      status: "good",
      label: "Safe to call",
      detail: "Inside the courteous 9:00 AM – 8:00 PM local window.",
    };
  if ((hour >= 8 && hour < 9) || (hour >= 20 && hour < 21))
    return {
      status: "caution",
      label: "Borderline",
      detail: "Legal under TCPA (8 AM – 9 PM) but outside the courteous window.",
    };
  return {
    status: "blocked",
    label: "Do not call",
    detail: "Outside the TCPA 8:00 AM – 9:00 PM local calling window.",
  };
}

export function mapLink(a: AreaCode): string {
  const q = encodeURIComponent(`${a.cities[0] ?? a.regionName}, ${a.regionName}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
