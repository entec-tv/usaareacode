import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { getDb, requireDb, trackAnalyticsEvent } from "./firebase";

export type AreaCodeRecord = {
  id: string;
  code: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
  carrier: string;
  isScam: boolean;
};

export type ArticleRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  tags: string[];
  status: "draft" | "published";
  content: string;
  date: string;
  coverImage?: string;
};

export type FaqRecord = {
  id: string;
  question: string;
  answer: string;
  order: number;
};

export type ScamReportInput = {
  phoneNumber: string;
  areaCode: string;
  callerType: string;
  description: string;
  riskLevel: "high" | "medium" | "low";
  reportedName?: string | undefined;
  country?: string | undefined;
  city?: string | undefined;
};

export type SiteSettings = {
  companyName: string;
  supportEmail: string;
  phone: string;
  businessHours: string;
  address: string;
  twitter: string;
  linkedin: string;
};

export const emptySettings: SiteSettings = {
  companyName: "ENTEC",
  supportEmail: "info@entec.store",
  phone: "+1 (223) 203-0312",
  businessHours: "Monday - Friday: 9:00 AM - 5:00 PM EST",
  address: "2 Great Valley Pkwy 2nd floor, Malvern, PA 19355, USA",
  twitter: "https://twitter.com/entec",
  linkedin: "https://linkedin.com/company/entec",
};

/* ---------------- Area Codes ---------------- */

export async function fetchAreaCodesFromDb(): Promise<AreaCodeRecord[]> {
  const snap = await getDocs(query(collection(requireDb(), "areaCodes"), orderBy("code")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AreaCodeRecord, "id">) }));
}

const STATE_NAME_TO_ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID", Illinois: "IL",
  Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA",
  Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN",
  Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR",
  Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD",
  Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT", Virginia: "VA",
  Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
  Alberta: "AB", "British Columbia": "BC", Manitoba: "MB", "New Brunswick": "NB",
  "Newfoundland and Labrador": "NL", "Northwest Territories": "NT", "Nova Scotia": "NS",
  Nunavut: "NU", Ontario: "ON", "Prince Edward Island": "PE", Quebec: "QC", Saskatchewan: "SK", Yukon: "YT",
};

export function adaptDbRecordToAreaCode(record: AreaCodeRecord) {
  const tzName = record.timezone || "America/New_York";
  const tzLabel = tzName.split("/").pop()?.replace("_", " ") ?? tzName;
  const cities = record.city ? record.city.split(",").map((c) => c.trim()).filter(Boolean) : [record.state];
  const trimmedState = (record.state || "").trim();
  const regionAbbr =
    trimmedState.length <= 3
      ? trimmedState.toUpperCase()
      : (STATE_NAME_TO_ABBR[trimmedState] ?? trimmedState.slice(0, 2).toUpperCase());

  return {
    code: record.code,
    region: regionAbbr,
    regionName: record.state,
    country: (record.country as any) || "US",
    timezone: tzName,
    tzLabel,
    cities,
    risk: Boolean(record.isScam),
    carrier: record.carrier || "Major NANP Carrier",
    overlays: [] as string[],
    mandatory10Digit: true,
  };
}

/* ---------------- Articles ---------------- */

export async function fetchPublishedArticles(): Promise<ArticleRecord[]> {
  try {
    const q = query(
      collection(requireDb(), "articles"),
      where("status", "==", "published"),
      orderBy("date", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ArticleRecord, "id">) }));
  } catch {
    // In case the compound index isn't created yet or status field is missing, fallback to list all and filter
    const snap = await getDocs(query(collection(requireDb(), "articles"), orderBy("date", "desc")));
    const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ArticleRecord, "id">) }));
    return all.filter((a) => a.status === "published" || !a.status);
  }
}

export async function fetchArticleBySlug(slug: string): Promise<ArticleRecord | null> {
  const q = query(collection(requireDb(), "articles"), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  if (!d) return null;
  return { id: d.id, ...(d.data() as Omit<ArticleRecord, "id">) };
}

/* ---------------- FAQs ---------------- */

export async function fetchFaqsFromDb(): Promise<FaqRecord[]> {
  const snap = await getDocs(query(collection(requireDb(), "faqs"), orderBy("order")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FaqRecord, "id">) }));
}

/* ---------------- Input Sanitization Helpers ---------------- */

export function sanitizeString(val: string | undefined, maxLen = 120): string | undefined {
  if (typeof val !== "string") return undefined;
  // Strip control characters, HTML tags, quotes, and dangerous injection characters
  const sanitized = val
    .replace(/[<>'"`;\\]/g, "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim();
  return sanitized ? sanitized.slice(0, maxLen) : undefined;
}

/* ---------------- Scam Reports ---------------- */

export async function submitScamReport(report: ScamReportInput) {
  const sanitizedReport = {
    phoneNumber: sanitizeString(report.phoneNumber, 30) || "",
    areaCode: sanitizeString(report.areaCode, 10) || "",
    callerType: sanitizeString(report.callerType, 50) || "Unknown",
    description: sanitizeString(report.description, 1000) || "",
    riskLevel: (["high", "medium", "low"].includes(report.riskLevel) ? report.riskLevel : "medium") as "high" | "medium" | "low",
    reportedName: sanitizeString(report.reportedName, 100) ?? "",
    country: sanitizeString(report.country, 60) ?? "",
    city: sanitizeString(report.city, 60) ?? "",
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };
  return await addDoc(collection(requireDb(), "scamReports"), sanitizedReport);
}

/* ---------------- Contact Inquiries (Inbox Pipeline) ---------------- */

export type ContactMessageInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  country?: string | undefined;
  city?: string | undefined;
  userLanguage?: string | undefined;
};

export type ContactMessageRecord = {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "archived";
  country?: string | undefined;
  city?: string | undefined;
  userLanguage?: string | undefined;
  createdAt: string;
};

export async function submitContactMessage(input: ContactMessageInput) {
  const sanitized = {
    name: sanitizeString(input.name, 100) || "Anonymous",
    email: sanitizeString(input.email, 120) || "",
    subject: sanitizeString(input.subject, 150) || "General Inquiry",
    message: sanitizeString(input.message, 2500) || "",
    country: sanitizeString(input.country, 60) ?? "",
    city: sanitizeString(input.city, 60) ?? "",
    userLanguage: sanitizeString(input.userLanguage, 10) ?? "en",
    status: "unread" as const,
    createdAt: new Date().toISOString(),
  };

  if (!sanitized.email || !sanitized.email.includes("@") || !sanitized.message) {
    throw new Error("Invalid contact submission: email and message are required.");
  }

  return await addDoc(collection(requireDb(), "contactMessages"), sanitized);
}

/* ---------------- Settings ---------------- */

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(requireDb(), "settings", "global"));
    return snap.exists() ? { ...emptySettings, ...(snap.data() as SiteSettings) } : emptySettings;
  } catch {
    return emptySettings;
  }
}

/* ---------------- Search Telemetry ---------------- */

export type SearchLogEntry = {
  query: string;
  resultsCount: number;
  found: boolean;
  source?: "hero_search" | "direct_url" | "bulk_lookup" | undefined;
  userLanguage?: string | undefined;
  timezone?: string | undefined;
  country?: string | undefined;
  city?: string | undefined;
  flaggedSuspicious?: boolean | undefined;
  createdAt: string;
};

export async function logSearchQuery(entry: Omit<SearchLogEntry, "createdAt">): Promise<void> {
  try {
    const db = getDb();
    if (!db) return;
    
    // Strict sanitization: strip dangerous characters, enforce max length of 64 chars
    const rawClean = (entry.query || "")
      .replace(/[<>'"`;\\]/g, "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .trim()
      .toLowerCase();

    // Reject empty, excessively long, or malicious patterns
    if (!rawClean || rawClean.length > 64) return;

    const docData: SearchLogEntry = {
      query: rawClean,
      resultsCount: Math.max(0, Math.min(Number(entry.resultsCount) || 0, 10000)),
      found: Boolean(entry.found),
      source: entry.source,
      userLanguage: sanitizeString(entry.userLanguage, 10),
      timezone: sanitizeString(entry.timezone, 50),
      country: sanitizeString(entry.country, 60),
      city: sanitizeString(entry.city, 60),
      flaggedSuspicious: Boolean(entry.flaggedSuspicious),
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, "searchLogs"), docData);
  } catch (err) {
    // Silent fail for non-intrusive client telemetry
    console.debug("[Telemetry] Could not write search log:", err);
  }
}

/* ---------------- Engagement Telemetry ---------------- */

export type EngagementLogEntry = {
  action:
    | "copy_code"
    | "copy_dossier"
    | "copy_phone"
    | "theme_toggle"
    | "lang_toggle"
    | "tab_switch"
    | "report_modal_open"
    | "filter_applied";
  target?: string | undefined;
  details?: Record<string, any> | undefined;
  country?: string | undefined;
  city?: string | undefined;
  timezone?: string | undefined;
  userLanguage?: string | undefined;
  createdAt?: string | undefined;
};

const VALID_ACTIONS: Set<EngagementLogEntry["action"]> = new Set([
  "copy_code",
  "copy_dossier",
  "copy_phone",
  "theme_toggle",
  "lang_toggle",
  "tab_switch",
  "report_modal_open",
  "filter_applied",
]);

export async function logEngagementEvent(entry: Omit<EngagementLogEntry, "createdAt">): Promise<void> {
  try {
    if (!VALID_ACTIONS.has(entry.action)) return;

    // 1. Firebase Analytics event
    trackAnalyticsEvent(entry.action, {
      target: sanitizeString(entry.target, 100),
      country: sanitizeString(entry.country, 60),
      ...entry.details,
    });

    // 2. Firestore persistent log for Admin
    const db = getDb();
    if (!db) return;

    const docData: EngagementLogEntry = {
      action: entry.action,
      target: sanitizeString(entry.target, 100),
      country: sanitizeString(entry.country, 60),
      city: sanitizeString(entry.city, 60),
      timezone: sanitizeString(entry.timezone, 50),
      userLanguage: sanitizeString(entry.userLanguage, 10),
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, "engagementLogs"), docData);
  } catch (err) {
    console.debug("[Engagement Telemetry] Could not write event:", err);
  }
}


