/**
 * ENTEC — Intelligent Lead & Entity Extraction Engine
 * Ported and upgraded from legacy areacode core.
 *
 * Features:
 * - Master NANP Phone Regex with extension capture
 * - Arabic & English Name extraction with prefixes (Mr, Dr, Prof, الأستاذ, السيد, دكتور, مهندس...)
 * - Feedback / Notes extraction
 * - Smart CSV/Excel delimiter & column auto-detection (bilingual English + Arabic headers)
 * - Dual mode input detection (Clean Area Code/State list vs. Lead Log text)
 * - Number formatting into 6 standard variants
 */

export const MAX_EXTRACTED_NUMBERS = 50000;
export const EXCEL_ROW_SEP = "\r\n";

// Master NANP phone regex with lookaround and extension support
export const PHONE_MASTER_REGEX =
  /(?<!\d)(?:\+?1[-.\s]?)?\(?([2-9]\d{2})\)?[-.\s]?([2-9]\d{2})[-.\s]?(\d{4})(?!\d)(?:\s*(?:ext(?:ension)?\.?|x|#)\s*(\d{1,6}))?/gi;

const NAME_PREFIX_RE =
  /^(?:mr\.?|mrs\.?|ms\.?|miss\.?|dr\.?|prof\.?|eng\.?|rev\.?|hon\.?|الاستاذ|السيد(?:ة)?|دكتور|مهندس|بروفيسور|أستاذ|الدكتور|الأستاذ|الاستاذة)\s+/i;

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function normalizeEasternArabicNumerals(input: string): string {
  if (!input) return "";
  const easternArabicNumerals: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  };
  return input.replace(/[٠-٩۰-۹]/g, (d) => easternArabicNumerals[d] || d);
}

export function cleanSep(s: string): string {
  return s
    ? s.replace(/^[\s|\-\u2013\u2014,;:\u2022\u00B7]+|[\s|\-\u2013\u2014,;:\u2022\u00B7]+$/g, "").trim()
    : "";
}

export function isLikelyName(str: string): boolean {
  if (!str || str.length < 2 || str.length > 80) return false;
  const s = str.replace(NAME_PREFIX_RE, "").trim();
  if (!s) return false;
  const words = s.split(/\s+/);
  if (words.length === 0 || words.length > 7) return false;
  if (/@/.test(s)) return false;
  if (/https?:\/\//.test(s)) return false;
  if (/\d{4,}/.test(s)) return false;
  if (/[$€£#@%]/.test(s)) return false;
  if (/\d+\s+\w+(St|Ave|Rd|Blvd|Dr|Ln|Pl|Ct|Way)\b/i.test(s)) return false;
  if (/^(yes|no|ok|okay|none|null|n\/a|unknown|true|false)$/i.test(s)) return false;
  const letters = (s.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length;
  if (letters < 2) return false;
  return words.every((w) => /^[\u0600-\u06FFa-zA-Z.'`\-]{1,35}$/.test(w));
}

export function normalizeName(name: string | null): string | null {
  if (!name) return null;
  name = cleanSep(name);
  if (!name) return null;
  if (ARABIC_RE.test(name)) return name.trim();
  return name
    .split(/\s+/)
    .map((w) => {
      const first = w.charAt(0);
      return first ? first.toUpperCase() + w.slice(1).toLowerCase() : "";
    })
    .join(" ");
}

export function extractNameAndFeedback(
  before: string,
  after: string
): { name: string | null; feedback: string | null } {
  let name: string | null = null;
  let feedback: string | null = null;
  const b = cleanSep(before);
  const a = cleanSep(after);

  if (b && isLikelyName(b)) {
    name = normalizeName(b);
    if (a) feedback = a;
  } else if (a) {
    const sepIdx = a.search(/\s{2,}|[\u007C\-\u2013\u2014]\s+/);
    if (sepIdx > 0) {
      const first = a.substring(0, sepIdx).trim();
      const rest = a.substring(sepIdx).replace(/^[\s|\-\u2013\u2014]+/, "").trim();
      if (isLikelyName(first)) {
        name = normalizeName(first);
        feedback = rest || null;
      } else {
        feedback = a;
      }
    } else {
      if (isLikelyName(a)) {
        name = normalizeName(a);
      } else {
        feedback = a;
      }
    }
    if (b && !isLikelyName(b)) {
      feedback = feedback ? b + " | " + feedback : b;
    }
  } else if (b) {
    if (isLikelyName(b)) name = normalizeName(b);
    else feedback = b;
  }

  return { name, feedback };
}

export interface ParsedLineItem {
  phone: string; // 10 digits
  extension: string | null;
  name: string | null;
  feedback: string | null;
  originalLine: string;
  extraPhones?: Array<{ digits: string; ext: string | null }>;
}

export function parseLineComponents(line: string): ParsedLineItem | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (/^[=\-*#~+]{3,}$/.test(trimmed)) return null;
  if (/^https?:\/\//i.test(trimmed)) return null;
  if (/^-{0,3}\s*Sheet:/i.test(trimmed)) return null;

  const phoneRE = new RegExp(PHONE_MASTER_REGEX.source, "gi");
  const found: Array<{ digits: string; ext: string | null; start: number; end: number; match: string }> = [];
  let m: RegExpExecArray | null;

  while ((m = phoneRE.exec(trimmed)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    if (start > 0 && /\d/.test(trimmed.charAt(start - 1))) continue;
    if (end < trimmed.length && /\d/.test(trimmed.charAt(end))) continue;
    found.push({
      digits: `${m[1]}${m[2]}${m[3]}`,
      ext: m[4] || null,
      start,
      end,
      match: m[0],
    });
  }

  if (found.length === 0) return null;

  const primary = found[0];
  if (!primary) return null;
  const before = trimmed.substring(0, primary.start);
  const after = trimmed.substring(primary.end);

  const { name, feedback } = extractNameAndFeedback(before, after);

  return {
    phone: primary.digits,
    extension: primary.ext,
    name,
    feedback,
    originalLine: trimmed,
    extraPhones: found.slice(1).map((p) => ({ digits: p.digits, ext: p.ext })),
  };
}

/**
 * Smart CSV Parser with auto delimiter detection (tab, comma, semicolon)
 */
export function smartParseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/);
  const sample = lines.find((l) => l.trim()) || "";
  const tabCount = (sample.match(/\t/g) || []).length;
  const commaCount = (sample.match(/,/g) || []).length;
  const semiCount = (sample.match(/;/g) || []).length;
  const delim = tabCount > commaCount && tabCount > semiCount ? "\t" : semiCount > commaCount ? ";" : ",";

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;
    const cols: string[] = [];
    let inQuote = false;
    let cur = "";
    for (let i = 0; i < rawLine.length; i++) {
      const c = rawLine[i];
      if (c === '"') {
        if (inQuote && rawLine[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (c === delim && !inQuote) {
        cols.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    cols.push(cur.trim());
    rows.push(cols);
  }
  return rows;
}

export interface CSVColumnMap {
  phoneCol: number;
  nameCol: number;
  feedbackCol: number;
  hasHeader: boolean;
}

export function detectCSVColumns(rows: string[][]): CSVColumnMap | null {
  if (!rows || rows.length < 1) return null;
  const header = rows[0];
  if (!header || header.length === 0) return null;

  const result: CSVColumnMap = { phoneCol: -1, nameCol: -1, feedbackCol: -1, hasHeader: false };

  const headerText = header.some((h) => /[a-zA-Z\u0600-\u06FF]{3,}/.test(h || ""));
  const headerPhone = header.some((h) => /^[2-9]\d{9}$/.test((h || "").replace(/\D/g, "")));
  result.hasHeader = headerText && !headerPhone;

  if (result.hasHeader) {
    header.forEach((h, i) => {
      const lo = (h || "").toLowerCase();
      if (/phone|mobile|cell|number|tel|num|رقم|هاتف|جوال|موبايل|الرقم|تليفون/.test(lo)) {
        if (result.phoneCol === -1) result.phoneCol = i;
      } else if (/name|customer|client|contact|person|اسم|عميل|شخص|العميل|الاسم/.test(lo)) {
        if (result.nameCol === -1) result.nameCol = i;
      } else if (/feedback|note|comment|remark|status|review|ملاحظ|تعليق|حالة|نوت|رأي|الحالة|result/.test(lo)) {
        if (result.feedbackCol === -1) result.feedbackCol = i;
      }
    });
  }

  const dataRows = rows.slice(result.hasHeader ? 1 : 0, Math.min(rows.length, 51));

  if (result.phoneCol === -1 && header.length > 0) {
    let best = -1;
    let bestScore = 0;
    header.forEach((_, ci) => {
      let score = 0;
      dataRows.forEach((r) => {
        const cell = r[ci] || "";
        const d = cell.replace(/\D/g, "");
        if (d.length === 10 && /^[2-9]/.test(d)) score += 3;
        else if (d.length === 11 && d.startsWith("1") && /^1[2-9]/.test(d)) score += 2;
        else if (PHONE_MASTER_REGEX.test(cell)) score += 2;
      });
      if (score > bestScore) {
        bestScore = score;
        best = ci;
      }
    });
    if (best >= 0) result.phoneCol = best;
  }

  if (result.nameCol === -1 && header.length > 0) {
    let best = -1;
    let bestScore = 0;
    header.forEach((_, ci) => {
      if (ci === result.phoneCol) return;
      let score = 0;
      dataRows.forEach((r) => {
        const cell = (r[ci] || "").trim();
        if (isLikelyName(cell)) score += 2;
        else if (/[\u0600-\u06FFa-zA-Z]{2,}/.test(cell) && !/\d{4,}/.test(cell)) score++;
      });
      if (score > bestScore) {
        bestScore = score;
        best = ci;
      }
    });
    if (best >= 0) result.nameCol = best;
  }

  if (result.feedbackCol === -1 && header.length > 0) {
    header.forEach((_, ci) => {
      if (ci === result.phoneCol || ci === result.nameCol) return;
      const hasContent = dataRows.some((r) => (r[ci] || "").trim().length > 1);
      if (hasContent && result.feedbackCol === -1) result.feedbackCol = ci;
    });
  }

  return result;
}

export function csvRowsToText(rows: string[][], colMap: CSVColumnMap): string {
  const lines: string[] = [];
  const start = colMap.hasHeader ? 1 : 0;
  for (let i = start; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c.trim())) continue;
    const phone = colMap.phoneCol >= 0 ? (row[colMap.phoneCol] || "").trim() : "";
    const name = colMap.nameCol >= 0 ? (row[colMap.nameCol] || "").trim() : "";
    const feedback = colMap.feedbackCol >= 0 ? (row[colMap.feedbackCol] || "").trim() : "";
    const extra = row
      .filter((_, ci) => ci !== colMap.phoneCol && ci !== colMap.nameCol && ci !== colMap.feedbackCol)
      .map((c) => c.trim())
      .filter(Boolean)
      .join(" ");
    const parts = [name, phone, feedback, extra].filter(Boolean);
    if (parts.length > 0) lines.push(parts.join("\t"));
  }
  return lines.join("\n");
}

/**
 * Detects whether input lines represent a bulk list of Area Codes / States
 * vs. mixed text logs containing phone numbers.
 */
export function detectBulkList(lines: string[]): boolean {
  if (lines.length < 2) return false;
  let cleanLineCount = 0;

  lines.forEach((line) => {
    const trimmed = line.trim();
    const digitsOnly = trimmed.replace(/\D/g, "");
    // Phone numbers (7+ digits) are treated as lead extractor input
    if (digitsOnly.length >= 7) return;

    const isAreaCode = /^[2-9]\d{2}$/.test(trimmed);
    const isState = trimmed.length === 2 && /^[A-Z]{2}$/i.test(trimmed);
    const isCleanNumber = /^[\d\s\-\(\)\+\.]+$/.test(trimmed) && trimmed.length >= 3;
    const isStateName = /^[a-z\s]+$/i.test(trimmed) && trimmed.split(/\s+/).length <= 3;

    if (isAreaCode || isState || isCleanNumber || isStateName) {
      cleanLineCount++;
    }
  });

  return cleanLineCount > lines.length * 0.6;
}

export type NumberFormat = "e164" | "national" | "digits" | "dash" | "dot" | "space";

export function formatPhoneNumber(num: string, format: NumberFormat): string {
  let clean = num.replace(/\D/g, "");
  if (clean.length === 11 && clean.startsWith("1")) {
    clean = clean.substring(1);
  }
  if (clean.length !== 10) return num;
  const ac = clean.substring(0, 3);
  const pre = clean.substring(3, 6);
  const line = clean.substring(6, 10);

  switch (format) {
    case "e164":
      return `+1${ac}${pre}${line}`;
    case "national":
      return `(${ac}) ${pre}-${line}`;
    case "digits":
      return clean;
    case "dash":
      return `${ac}-${pre}-${line}`;
    case "dot":
      return `${ac}.${pre}.${line}`;
    case "space":
      return `${ac} ${pre} ${line}`;
    default:
      return num;
  }
}
