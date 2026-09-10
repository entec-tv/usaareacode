import React, { useState, useMemo, useRef } from "react";
import {
  Upload,
  Trash2,
  Sparkles,
  Download,
  Copy,
  Search,
  X,
  ShieldAlert,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  FileText,
  FileSpreadsheet,
  CheckCheck,
  AlertTriangle,
  Phone,
  User,
  MessageSquare,
  Globe,
  Filter,
  Check,
  WrapText,
} from "lucide-react";

import { AREA_CODE_MAP, carrierFor } from "@/data/areaCodes";
import { localTime, callingWindow, toE164, formatUS, isValidNanp } from "@/lib/nanp";
import {
  parseLineComponents,
  detectBulkList,
  formatPhoneNumber,
  type NumberFormat,
  EXCEL_ROW_SEP,
} from "@/lib/lead-extractor";
import { parseUploadedFile, normalizeEasternArabicNumerals } from "@/lib/file-parser";
import { exportXlsx, exportCsv } from "@/lib/exporters";

export interface BulkExtractorTabProps {
  isAr: boolean;
  t: (key: string) => string;
  onNavigateLookup?: (code: string) => void;
}

export interface ExtractedItem {
  number: string; // clean 10 digits
  formatted: string;
  extension: string;
  area: string;
  state: string;
  abbr: string;
  timezone: string;
  time: string;
  name: string;
  feedback: string;
  carrier: string;
  risk: boolean;
  callStatus: "good" | "caution" | "blocked" | "unknown";
  callLabel: string;
}

const SAMPLE_TEXT = `Ahmed Al-Rashid  (212) 555-0123  ext 104  VIP Client - Priority Routing
محمد عبدالله  +1-310-555-7890  عميل مميز - متابعة دورية
Dr. Sarah Jenkins  415.555.9876  Silicon Valley Clinic follow-up
Office: 312-555-0100  Mobile: 646-555-0200  Chicago Loop Headquarters
Toll-Free Support: 1-800-555-4321 ext 800  Customer Service Center
High-Risk Call: +1 (876) 555-9123  Offshore lottery scam pattern`;

export function BulkExtractorTab({ isAr, t }: BulkExtractorTabProps) {
  const now = useMemo(() => new Date(), []);

  // Main Input State
  const [bulkInput, setBulkInput] = useState<string>(SAMPLE_TEXT);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>("");
  const [optionsOpen, setOptionsOpen] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Processing Options
  const [removeDupes, setRemoveDupes] = useState<boolean>(true);
  const [sortResults, setSortResults] = useState<boolean>(true);
  const [validateAC, setValidateAC] = useState<boolean>(true);
  const [groupByArea, setGroupByArea] = useState<boolean>(false);
  const [showLocation, setShowLocation] = useState<boolean>(true);
  const [removeInvalid, setRemoveInvalid] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeNames, setIncludeNames] = useState<boolean>(true);
  const [includeFeedback, setIncludeFeedback] = useState<boolean>(true);

  // Formatting & Filters
  const [extFormat, setExtFormat] = useState<NumberFormat>("national");
  const [displayFormat, setDisplayFormat] = useState<"both" | "number" | "location">("both");
  const [tzFilter, setTzFilter] = useState<string>("");

  // Extracted Data & Stats
  const [bulkResults, setBulkResults] = useState<ExtractedItem[]>([]);
  const [bulkProcessed, setBulkProcessed] = useState<boolean>(false);
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    dupes: 0,
    uniqueAreas: 0,
  });

  // Results UI State
  const [viewMode, setViewMode] = useState<"table" | "text">("table");
  const [textFormat, setTextFormat] = useState<"table" | "records" | "numbers" | "tsv">("table");
  const [wrapText, setWrapText] = useState<boolean>(false);
  const [resultsSearchQuery, setResultsSearchQuery] = useState<string>("");
  const [filterTab, setFilterTab] = useState<"all" | "safe" | "caution" | "risk">("all");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Column Visibility Toggles
  const [colVisible, setColVisible] = useState({
    number: true,
    area: true,
    state: true,
    abbr: true,
    timezone: true,
    time: true,
    name: true,
    feedback: true,
    carrier: true,
    tcpa: true,
    risk: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Drag and drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    try {
      triggerToast(isAr ? `جارٍ فحص وتحليل ملف ${file.name}...` : `Processing ${file.name}...`);
      const text = await parseUploadedFile(file);
      if (text && text.trim()) {
        setBulkInput(text);
        triggerToast(isAr ? `تم تحميل ملف ${file.name} بنجاح` : `Loaded ${file.name} successfully`);
      } else {
        triggerToast(isAr ? "الملف فارغ أو تعذر قراءته" : "File is empty or could not be read");
      }
    } catch (err) {
      console.error("Failed to parse file:", err);
      triggerToast(isAr ? "حدث خطأ أثناء قراءة الملف" : "Error reading file");
    }
  };

  // Process Routine
  const processExtraction = async () => {
    if (!bulkInput.trim()) {
      triggerToast(isAr ? "يرجى إدخال نصوص أو رفع ملف أولاً" : "Please enter text or upload a file first.");
      return;
    }

    setIsProcessing(true);
    setProgressPercent(0);
    setProgressText("0%");

    const normalized = normalizeEasternArabicNumerals(bulkInput);
    const rawLines = normalized.split(/\r?\n/).filter((l: string) => l.trim());

    // Check if input is a clean list of area codes/states vs mixed lead logs
    const isBulkList = detectBulkList(rawLines);
    const items: ExtractedItem[] = [];
    const seenDigits = new Set<string>();
    let rawTotalFound = 0;
    let dupesCount = 0;
    let invalidCount = 0;

    const CHUNK_SIZE = 1000;
    const shouldShowProgress = rawLines.length > 1000;

    for (let i = 0; i < rawLines.length; i += CHUNK_SIZE) {
      const chunk = rawLines.slice(i, i + CHUNK_SIZE);

      chunk.forEach((line: string) => {
        if (isBulkList) {
          const trimmed = line.trim();
          const cleanDigits = trimmed.replace(/\D/g, "");
          let npa = "";
          let storedNumber = trimmed;

          if (cleanDigits.length === 10) {
            npa = cleanDigits.substring(0, 3);
            storedNumber = cleanDigits;
          } else if (cleanDigits.length === 11 && cleanDigits.startsWith("1")) {
            npa = cleanDigits.substring(1, 4);
            storedNumber = cleanDigits.substring(1);
          } else if (cleanDigits.length === 3) {
            npa = cleanDigits;
            storedNumber = `${cleanDigits}5550100`;
          } else {
            npa = cleanDigits.substring(0, 3);
          }

          if (!npa) return;
          rawTotalFound++;

          if (removeDupes && seenDigits.has(storedNumber)) {
            dupesCount++;
            return;
          }
          seenDigits.add(storedNumber);

          const areaMatches = AREA_CODE_MAP[npa] ?? [];
          const areaInfo = areaMatches[0];

          if (validateAC && !areaInfo) {
            invalidCount++;
            if (removeInvalid) return;
          }

          if (tzFilter === "US" && areaInfo && areaInfo.country !== "US") return;
          if (tzFilter === "CA" && areaInfo && areaInfo.country !== "CA") return;
          if (tzFilter.startsWith("America/") && areaInfo && !areaInfo.timezone.includes(tzFilter)) return;

          const timeInfo = areaInfo ? localTime(areaInfo.timezone, now) : null;
          const callWin = timeInfo ? callingWindow(timeInfo.hour) : null;

          items.push({
            number: storedNumber,
            formatted: formatPhoneNumber(storedNumber, extFormat),
            extension: "",
            area: npa,
            state: areaInfo?.regionName ?? "Unknown",
            abbr: areaInfo?.region ?? "--",
            timezone: areaInfo?.tzLabel ?? "N/A",
            time: timeInfo ? timeInfo.time : "N/A",
            name: "",
            feedback: "",
            carrier: areaInfo ? areaInfo.carrier : "Unknown",
            risk: areaInfo?.risk ?? false,
            callStatus: callWin?.status ?? "unknown",
            callLabel: callWin?.label ?? "N/A",
          });
        } else {
          // Mixed lead extraction mode
          const parsed = parseLineComponents(line);
          if (parsed && parsed.phone) {
            const allPhones = [{ digits: parsed.phone, ext: parsed.extension }];
            if (parsed.extraPhones) {
              parsed.extraPhones.forEach((ep) => allPhones.push(ep));
            }

            allPhones.forEach((p) => {
              rawTotalFound++;
              const digits = p.digits;

              if (removeDupes && seenDigits.has(digits)) {
                dupesCount++;
                return;
              }
              seenDigits.add(digits);

              const npa = digits.substring(0, 3);
              const areaMatches = AREA_CODE_MAP[npa] ?? [];
              const areaInfo = areaMatches[0];

              if (validateAC && (!areaInfo || !isValidNanp(digits))) {
                invalidCount++;
                if (removeInvalid) return;
              }

              if (tzFilter === "US" && areaInfo && areaInfo.country !== "US") return;
              if (tzFilter === "CA" && areaInfo && areaInfo.country !== "CA") return;
              if (tzFilter.startsWith("America/") && areaInfo && !areaInfo.timezone.includes(tzFilter)) return;

              const timeInfo = areaInfo ? localTime(areaInfo.timezone, now) : null;
              const callWin = timeInfo ? callingWindow(timeInfo.hour) : null;

              items.push({
                number: digits,
                formatted: formatPhoneNumber(digits, extFormat),
                extension: p.ext ? String(p.ext) : "",
                area: npa,
                state: areaInfo?.regionName ?? "Unknown",
                abbr: areaInfo?.region ?? "--",
                timezone: areaInfo?.tzLabel ?? "N/A",
                time: timeInfo ? timeInfo.time : "N/A",
                name: includeNames && parsed.name ? parsed.name : "",
                feedback: includeFeedback && parsed.feedback ? parsed.feedback : "",
                carrier: areaInfo ? areaInfo.carrier : "Unknown",
                risk: areaInfo?.risk ?? false,
                callStatus: callWin?.status ?? "unknown",
                callLabel: callWin?.label ?? "N/A",
              });
            });
          }
        }
      });

      if (shouldShowProgress) {
        const pct = Math.min(Math.round(((i + CHUNK_SIZE) / rawLines.length) * 100), 100);
        setProgressPercent(pct);
        setProgressText(`${pct}% (${Math.min(i + CHUNK_SIZE, rawLines.length)} / ${rawLines.length})`);
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    // Sort if requested
    if (sortResults) {
      items.sort((a, b) => a.number.localeCompare(b.number));
    }

    const uniqueAreaCodesCount = new Set(items.map((it) => it.area)).size;

    setBulkResults(items);
    setStats({
      total: rawTotalFound,
      valid: items.length,
      invalid: invalidCount,
      dupes: dupesCount,
      uniqueAreas: uniqueAreaCodesCount,
    });
    setBulkProcessed(true);
    setIsProcessing(false);

    triggerToast(
      isAr
        ? `✅ تم استخراج ${items.length} جهة اتصال بنجاح`
        : `✅ Successfully extracted ${items.length} contact records`
    );
  };

  // Re-format on the fly when user changes number format
  const formattedResults = useMemo(() => {
    return bulkResults.map((item) => ({
      ...item,
      formatted: formatPhoneNumber(item.number, extFormat),
    }));
  }, [bulkResults, extFormat]);

  // Filtered by in-results search & status tab
  const displayResults = useMemo(() => {
    return formattedResults.filter((row) => {
      // Status filter
      if (filterTab === "safe" && row.callStatus !== "good") return false;
      if (filterTab === "caution" && row.callStatus === "good") return false;
      if (filterTab === "risk" && !row.risk) return false;

      // Search query filter
      if (!resultsSearchQuery.trim()) return true;
      const q = resultsSearchQuery.toLowerCase();
      return (
        row.formatted.toLowerCase().includes(q) ||
        row.area.includes(q) ||
        row.state.toLowerCase().includes(q) ||
        row.abbr.toLowerCase().includes(q) ||
        row.timezone.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.feedback.toLowerCase().includes(q) ||
        row.carrier.toLowerCase().includes(q)
      );
    });
  }, [formattedResults, filterTab, resultsSearchQuery]);

  // Monospace text view output generation
  const textOutputString = useMemo(() => {
    if (displayResults.length === 0) return "";

    // 1. Group by Area Code mode (if enabled in options)
    if (groupByArea) {
      const grouped: Record<string, ExtractedItem[]> = {};
      displayResults.forEach((r) => {
        const list = grouped[r.area] || (grouped[r.area] = []);
        list.push(r);
      });

      const blocks: string[] = [];
      Object.keys(grouped)
        .sort()
        .forEach((ac) => {
          const list = grouped[ac] || [];
          let block = `=== Area Code ${ac} (${list.length} numbers) ===\n`;
          list.forEach((row, idx) => {
            const parts: string[] = [];
            if (colVisible.number) parts.push(row.formatted + (row.extension ? ` ext ${row.extension}` : ""));
            if (colVisible.state && showLocation) parts.push(`${row.state} (${row.abbr})`);
            if (colVisible.time) parts.push(row.time);
            if (colVisible.tcpa) parts.push(`[${row.callLabel}]`);
            if (colVisible.name && row.name) parts.push(`Name: ${row.name}`);
            if (colVisible.carrier && row.carrier) parts.push(`Carrier: ${row.carrier}`);
            if (colVisible.feedback && row.feedback) parts.push(`Note: ${row.feedback}`);
            block += `[${idx + 1}] ` + parts.join("  |  ") + "\n";
          });
          blocks.push(block.trim());
        });
      return blocks.join("\n\n");
    }

    // 2. Numbers Only mode
    if (textFormat === "numbers") {
      return displayResults
        .map((r) => r.formatted + (r.extension ? ` ext ${r.extension}` : ""))
        .join("\n");
    }

    // 3. Structured Lead Cards mode (Best for Arabic notes and CRM reviews)
    if (textFormat === "records") {
      return displayResults
        .map((r, idx) => {
          const titleParts = [r.formatted + (r.extension ? ` ext ${r.extension}` : "")];
          if (showLocation && r.state) titleParts.push(`${r.state} (${r.abbr || r.area})`);
          if (r.timezone) titleParts.push(r.timezone);
          if (r.time) titleParts.push(r.time);
          if (r.callLabel) titleParts.push(`[${r.callLabel}]`);

          const details: string[] = [];
          if (colVisible.name && r.name) details.push(`الاسم / Name: ${r.name}`);
          if (colVisible.carrier && r.carrier) details.push(`المشغل / Carrier: ${r.carrier}`);
          if (colVisible.risk && r.risk) details.push(`⚠️ تحذير: رقم احتيال دولي`);

          let card = `[${idx + 1}] ${titleParts.join(" • ")}`;
          if (details.length > 0) {
            card += `\n    ${details.join("  |  ")}`;
          }
          if (colVisible.feedback && r.feedback) {
            card += `\n    الملاحظات / Note: ${r.feedback}`;
          }
          return card;
        })
        .join("\n" + "-".repeat(78) + "\n");
    }

    // Active headers and keys based on selected columns
    const activeHeaders: string[] = [];
    const activeKeys: Array<keyof ExtractedItem> = [];

    if (colVisible.number) { activeHeaders.push("Phone Number"); activeKeys.push("formatted"); }
    if (colVisible.area) { activeHeaders.push("Area"); activeKeys.push("area"); }
    if (colVisible.state) { activeHeaders.push("State"); activeKeys.push("state"); }
    if (colVisible.abbr) { activeHeaders.push("Abbr"); activeKeys.push("abbr"); }
    if (colVisible.timezone) { activeHeaders.push("Timezone"); activeKeys.push("timezone"); }
    if (colVisible.time) { activeHeaders.push("Local Time"); activeKeys.push("time"); }
    if (colVisible.tcpa) { activeHeaders.push("TCPA Status"); activeKeys.push("callLabel"); }
    if (colVisible.carrier) { activeHeaders.push("Carrier"); activeKeys.push("carrier"); }
    if (colVisible.name) { activeHeaders.push("Customer Name"); activeKeys.push("name"); }
    if (colVisible.feedback) { activeHeaders.push("Feedback / Note"); activeKeys.push("feedback"); }

    // 4. Raw TSV mode
    if (textFormat === "tsv") {
      const headerLine = activeHeaders.join("\t");
      const dataLines = displayResults.map((r) =>
        activeKeys.map((k) => String(r[k] ?? "").replace(/[\r\n\t]+/g, " ")).join("\t")
      );
      return [headerLine, ...dataLines].join("\n");
    }

    // 5. Default: Aligned Fixed-Width Table
    const getDisplayWidth = (str: string) => {
      let len = 0;
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if ((code >= 0x0600 && code <= 0x06ff) || (code >= 0x4e00 && code <= 0x9fff)) {
          len += 1.25;
        } else {
          len += 1;
        }
      }
      return Math.ceil(len);
    };

    const colWidths = activeHeaders.map((h, i) => {
      const key = activeKeys[i];
      let maxW = Math.max(h.length, 6);
      if (key) {
        displayResults.forEach((r) => {
          const val = String(r[key] ?? "").replace(/[\r\n]+/g, " ");
          const w = getDisplayWidth(val);
          if (w > maxW) maxW = w;
        });
        if (key === "carrier") maxW = Math.min(maxW, 36);
        if (key === "feedback") maxW = Math.min(maxW, 46);
      }
      return Math.max(maxW, 6);
    });

    const SPACING = "   ";
    const pad = (str: string, width: number) => {
      const sanitized = str.replace(/[\r\n]+/g, " ").trim();
      const currentW = getDisplayWidth(sanitized);
      if (currentW >= width) return sanitized;
      return sanitized + " ".repeat(width - currentW);
    };

    const headerLine = activeHeaders.map((h, i) => pad(h, colWidths[i] || h.length)).join(SPACING);
    const dividerLine = colWidths.map((w) => "-".repeat(w)).join(SPACING);

    const dataLines = displayResults.map((r) =>
      activeKeys
        .map((k, i) => pad(String(r[k] ?? ""), colWidths[i] || 10))
        .join(SPACING)
    );

    return [headerLine, dividerLine, ...dataLines].join("\n");
  }, [displayResults, groupByArea, colVisible, showLocation, textFormat]);

  // Copy selected columns tab-separated (Ready for Excel)
  const copySelectedColumns = async () => {
    const activeHeaders: string[] = [];
    const activeKeys: Array<keyof ExtractedItem> = [];

    if (colVisible.number) { activeHeaders.push("Phone Number"); activeKeys.push("formatted"); }
    if (colVisible.area) { activeHeaders.push("Area Code"); activeKeys.push("area"); }
    if (colVisible.state) { activeHeaders.push("State"); activeKeys.push("state"); }
    if (colVisible.abbr) { activeHeaders.push("State Abbr"); activeKeys.push("abbr"); }
    if (colVisible.timezone) { activeHeaders.push("Timezone"); activeKeys.push("timezone"); }
    if (colVisible.time) { activeHeaders.push("Local Time"); activeKeys.push("time"); }
    if (colVisible.tcpa) { activeHeaders.push("TCPA Status"); activeKeys.push("callLabel"); }
    if (colVisible.carrier) { activeHeaders.push("Carrier"); activeKeys.push("carrier"); }
    if (colVisible.name) { activeHeaders.push("Customer Name"); activeKeys.push("name"); }
    if (colVisible.feedback) { activeHeaders.push("Feedback"); activeKeys.push("feedback"); }

    if (activeHeaders.length === 0) {
      triggerToast(isAr ? "يرجى تحديد عمود واحد على الأقل" : "Please select at least one column");
      return;
    }

    let tsv = activeHeaders.join("\t") + EXCEL_ROW_SEP;
    tsv += displayResults
      .map((row) => activeKeys.map((k) => String(row[k] ?? "").replace(/[\r\n\t]+/g, " ")).join("\t"))
      .join(EXCEL_ROW_SEP);

    await navigator.clipboard.writeText(tsv);
    setIsCopied(true);
    triggerToast(
      isAr
        ? `📋 تم نسخ ${activeHeaders.length} أعمدة مهيأة للإكسل!`
        : `📋 Copied ${activeHeaders.length} columns formatted for Excel!`
    );
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Download Handlers
  const downloadJSON = () => {
    const jsonStr = JSON.stringify(displayResults, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entec_leads_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast(isAr ? "تم تنزيل ملف JSON!" : "Exported JSON!");
  };

  const downloadTXT = () => {
    const blob = new Blob([textOutputString], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entec_leads_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast(isAr ? "تم تنزيل ملف النص TXT!" : "Exported TXT!");
  };

  const downloadExcel = () => {
    const excelRows = displayResults.map((r) => ({
      Phone: r.formatted,
      Ext: r.extension,
      Area: r.area,
      State: r.state,
      Abbr: r.abbr,
      Timezone: r.timezone,
      "Local Time": r.time,
      "TCPA Status": r.callLabel,
      Carrier: r.carrier,
      Name: r.name,
      Feedback: r.feedback,
      "Risk Alert": r.risk ? "HIGH RISK" : "Safe",
    }));
    exportXlsx(excelRows, `entec_leads_${Date.now()}.xlsx`);
    triggerToast(isAr ? "تم تصدير ملف Excel بنجاح!" : "Exported Excel file!");
  };

  const downloadCSV = () => {
    const escapeCSV = (v: string) => '"' + (v || "").replace(/"/g, '""') + '"';
    let csv = "\ufeff" + "Phone Number,Extension,Area Code,State,State Abbr,Timezone,Local Time,TCPA Status,Carrier,Customer Name,Feedback,Risk\r\n";
    displayResults.forEach((r) => {
      csv += [
        escapeCSV(r.formatted),
        escapeCSV(r.extension),
        escapeCSV(r.area),
        escapeCSV(r.state),
        escapeCSV(r.abbr),
        escapeCSV(r.timezone),
        escapeCSV(r.time),
        escapeCSV(r.callLabel),
        escapeCSV(r.carrier),
        escapeCSV(r.name),
        escapeCSV(r.feedback),
        escapeCSV(r.risk ? "HIGH RISK" : "Safe"),
      ].join(",") + "\r\n";
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entec_leads_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast(isAr ? "تم تصدير ملف CSV!" : "Exported CSV!");
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-card border border-primary/40 px-4 py-2.5 text-sm font-semibold text-primary shadow-xl glow-ring animate-in fade-in slide-in-from-bottom-3">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="size-4" />
            </div>
            <span>
              {isAr
                ? "أداة استخراج وتنظيف أرقام الهواتف والبيانات بالجملة"
                : "Enterprise Phone Extractor & Bulk Cleanser"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isAr
              ? "استخرج الأرقام من نصوص المكالمات، جداول Excel، مستندات Word، وحدد أسماء العملاء، ساعات TCPA المباشرة، وحظر الاحتيال."
              : "Intelligent auto-detection engine for mixed lead notes, Excel workbooks, Word docs, and area code lists with live TCPA curfews."}
          </p>
        </div>
      </div>

      {/* Main Extractor Card */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-border/80 space-y-4 shadow-sm">
        {/* Top Controls: Drag & Drop Zone + Actions */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border/80 hover:border-primary/50 bg-card/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.log,.xlsx,.xls,.tsv,.tab,.docx,.doc"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
                e.target.value = "";
              }
            }}
          />
          <div className="flex flex-col items-center justify-center gap-1.5 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
              <Upload className="size-5" />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">
              {isAr ? "انقر هنا أو اسحب الملف لرفعه مباشرة" : "Click or Drag & Drop Files to Upload"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {isAr
                ? "يدعم: Excel (.xlsx, .xls) • Word (.docx) • جداول CSV • ملفات TXT (ترميز عربي تلقائي)"
                : "Supports: Excel (.xlsx, .xls) • Word (.docx) • CSV Tables • TXT logs (auto-detects columns)"}
            </div>
          </div>
        </div>

        {/* Text Area Stream */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            <span>{isAr ? "النص الخام للمدخلات" : "Raw Input Stream"}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBulkInput(SAMPLE_TEXT)}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                {isAr ? "تحميل عينة نموذجية" : "Load Sample Lead Log"}
              </button>
              <button
                type="button"
                onClick={() => setBulkInput("")}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 className="size-3" />
                <span>{t("clear")}</span>
              </button>
            </div>
          </div>

          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            rows={7}
            dir="auto"
            placeholder={
              isAr
                ? "الصق سجلات العملاء، ملفات Excel، نصوص الاتصال، أو أرقام الهواتف هنا..."
                : "Paste customer logs, emails, CSV/Excel records with phone numbers here..."
            }
            className="w-full rounded-xl bg-card/70 border border-border/80 p-3.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-y"
          />
        </div>

        {/* Collapsible Processing Options Panel */}
        <div className="rounded-xl border border-border/80 bg-card/40 p-4 space-y-4">
          <button
            type="button"
            onClick={() => setOptionsOpen(!optionsOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-foreground cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              <span>{isAr ? "خيارات المعالجة والفلترة المسبقة" : "Processing & Extraction Options"}</span>
            </div>
            {optionsOpen ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
          </button>

          {optionsOpen && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              {/* Checkbox Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/60 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={removeDupes}
                    onChange={(e) => setRemoveDupes(e.target.checked)}
                    className="size-4 rounded text-primary focus:ring-primary"
                  />
                  <span>{isAr ? "إزالة الأرقام المكررة" : "Remove Duplicates"}</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/60 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={sortResults}
                    onChange={(e) => setSortResults(e.target.checked)}
                    className="size-4 rounded text-primary focus:ring-primary"
                  />
                  <span>{isAr ? "فرز النتائج تصاعدياً" : "Sort Results"}</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/60 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={validateAC}
                    onChange={(e) => setValidateAC(e.target.checked)}
                    className="size-4 rounded text-primary focus:ring-primary"
                  />
                  <span>{isAr ? "التحقق من صحة كود المنطقة (NANP)" : "Validate Area Codes"}</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/60 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={groupByArea}
                    onChange={(e) => setGroupByArea(e.target.checked)}
                    className="size-4 rounded text-primary focus:ring-primary"
                  />
                  <span>{isAr ? "تجميع النتائج حسب الكود" : "Group by Area Code"}</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/60 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={showLocation}
                    onChange={(e) => setShowLocation(e.target.checked)}
                    className="size-4 rounded text-primary focus:ring-primary"
                  />
                  <span>{isAr ? "إظهار بيانات الموقع والولاية" : "Show Location Info"}</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/60 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={removeInvalid}
                    onChange={(e) => setRemoveInvalid(e.target.checked)}
                    className="size-4 rounded text-primary focus:ring-primary"
                  />
                  <span>{isAr ? "استبعاد الأرقام غير الصالحة" : "Remove Invalid"}</span>
                </label>
              </div>

              {/* Data Components to Extract */}
              <div className="pt-2 border-t border-border/50">
                <span className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  {isAr ? "البيانات المراد استخراجها:" : "Data Components to Extract:"}
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNumbers}
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                      className="size-3.5 rounded text-primary"
                    />
                    <Phone className="size-3.5 text-primary" />
                    <span>{isAr ? "أرقام الهواتف" : "Phone Numbers"}</span>
                  </label>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNames}
                      onChange={(e) => setIncludeNames(e.target.checked)}
                      className="size-3.5 rounded text-primary"
                    />
                    <User className="size-3.5 text-blue-400" />
                    <span>{isAr ? "أسماء العملاء" : "Customer Names"}</span>
                  </label>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeFeedback}
                      onChange={(e) => setIncludeFeedback(e.target.checked)}
                      className="size-3.5 rounded text-primary"
                    />
                    <MessageSquare className="size-3.5 text-amber-400" />
                    <span>{isAr ? "الملاحظات والتعليقات" : "Feedback / Notes"}</span>
                  </label>
                </div>
              </div>

              {/* Format & Region Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/50">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    {isAr ? "تنسيق الرقم الناتج:" : "Number Format:"}
                  </label>
                  <select
                    value={extFormat}
                    onChange={(e) => setExtFormat(e.target.value as NumberFormat)}
                    className="w-full text-xs p-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="national">National Format ((212) 555-0123)</option>
                    <option value="e164">E.164 Format (+12125550123)</option>
                    <option value="dash">Dashed (212-555-0123)</option>
                    <option value="dot">Dotted (212.555.0123)</option>
                    <option value="space">Spaced (212 555 0123)</option>
                    <option value="digits">Digits Only (2125550123)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    {isAr ? "أسلوب العرض:" : "Display Format:"}
                  </label>
                  <select
                    value={displayFormat}
                    onChange={(e) => setDisplayFormat(e.target.value as "both" | "number" | "location")}
                    className="w-full text-xs p-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="both">Number + Location</option>
                    <option value="number">Number Only</option>
                    <option value="location">Location Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    {isAr ? "فلترة حسب المنطقة الزمنية:" : "Filter by Region / Timezone:"}
                  </label>
                  <select
                    value={tzFilter}
                    onChange={(e) => setTzFilter(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">{isAr ? "كافة المناطق والدول" : "All Regions"}</option>
                    <option value="US">{isAr ? "الولايات المتحدة فقط (USA)" : "USA Only"}</option>
                    <option value="CA">{isAr ? "كندا فقط (Canada)" : "Canada Only"}</option>
                    <option value="America/New_York">Eastern Time (EST/EDT)</option>
                    <option value="America/Chicago">Central Time (CST/CDT)</option>
                    <option value="America/Denver">Mountain Time (MST/MDT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                    <option value="America/Anchorage">Alaska Time (AKST/AKDT)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button & Progress */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-muted-foreground">
            {isAr
              ? "يدعم صيغ +1 الدولية، الأقواس، الشُرط، التحويلات الداخلية (ext)، والأرقام المدمجة."
              : "Supports +1 international, brackets, dashes, extensions (ext), and raw digit blocks."}
          </span>

          <button
            type="button"
            disabled={isProcessing}
            onClick={processExtraction}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="size-4" />
            <span>{isProcessing ? (isAr ? "جارٍ المعالجة..." : "Processing...") : (isAr ? "استخراج وفحص البيانات الآن" : "Extract & Process Numbers")}</span>
          </button>
        </div>

        {/* Live Progress Bar for large batches */}
        {isProcessing && (
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-ping" />
                <span>{isAr ? "جارٍ تحليل واستخراج السجلات..." : "Extracting and analyzing contact records..."}</span>
              </span>
              <span className="font-mono text-primary">{progressText}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {bulkProcessed && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Animated Statistics Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="glass-panel rounded-xl p-3.5 text-center border border-border/80">
              <div className="font-display text-2xl font-bold text-foreground">{stats.valid}</div>
              <div className="text-[11px] text-muted-foreground">{isAr ? "الأرقام الصالحة" : "Valid Numbers"}</div>
            </div>

            <div className="glass-panel rounded-xl p-3.5 text-center border border-border/80">
              <div className="font-display text-2xl font-bold text-emerald-400">
                {bulkResults.filter((r) => r.callStatus === "good").length}
              </div>
              <div className="text-[11px] text-muted-foreground">{isAr ? "مسموح بالاتصال (TCPA)" : "Safe to Call"}</div>
            </div>

            <div className="glass-panel rounded-xl p-3.5 text-center border border-border/80">
              <div className="font-display text-2xl font-bold text-rose-500 flex items-center justify-center gap-1">
                <ShieldAlert className="size-4" />
                <span>{bulkResults.filter((r) => r.risk).length}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">{isAr ? "أرقام احتيال / دولية" : "Fraud / Offshore"}</div>
            </div>

            <div className="glass-panel rounded-xl p-3.5 text-center border border-border/80">
              <div className="font-display text-2xl font-bold text-primary">{stats.uniqueAreas}</div>
              <div className="text-[11px] text-muted-foreground">{isAr ? "أكواد مناطق فريدة" : "Unique Area Codes"}</div>
            </div>

            <div className="glass-panel rounded-xl p-3.5 text-center border border-border/80">
              <div className="font-display text-2xl font-bold text-amber-500">{stats.dupes}</div>
              <div className="text-[11px] text-muted-foreground">{isAr ? "مكررات تم استبعادها" : "Duplicates Removed"}</div>
            </div>

            <div className="glass-panel rounded-xl p-3.5 text-center border border-border/80">
              <div className="font-display text-2xl font-bold text-muted-foreground">{stats.invalid}</div>
              <div className="text-[11px] text-muted-foreground">{isAr ? "أرقام غير صالحة" : "Invalid Skipped"}</div>
            </div>
          </div>

          {/* Results Toolbar: Filter Tabs + Search + View Toggle + Exports */}
          <div className="glass-panel p-4 rounded-2xl border border-border/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-card/70 p-1 rounded-xl border border-border/70 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                    filterTab === "all" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isAr ? "الكل" : "All"} ({bulkResults.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("safe")}
                  className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                    filterTab === "safe" ? "bg-emerald-500 text-white font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isAr ? "آمن للاتصال" : "Safe"} ({bulkResults.filter((r) => r.callStatus === "good").length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("caution")}
                  className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                    filterTab === "caution" ? "bg-amber-500 text-white font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isAr ? "خارج النطاق" : "Caution"} ({bulkResults.filter((r) => r.callStatus !== "good").length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("risk")}
                  className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                    filterTab === "risk" ? "bg-rose-500 text-white font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isAr ? "مخاطر احتيال" : "Scam Risk"} ({bulkResults.filter((r) => r.risk).length})
                </button>
              </div>

              {/* View Toggle (Table ⊞ vs Text ☰) */}
              <div className="flex items-center gap-1 bg-card/80 p-1 rounded-xl border border-border/80 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                    viewMode === "table"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <LayoutGrid className="size-3.5" />
                  <span>{isAr ? "عرض كجدول" : "Table View"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("text")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                    viewMode === "text"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <FileText className="size-3.5" />
                  <span>{isAr ? "عرض نصي منسق" : "Text View"}</span>
                </button>
              </div>
            </div>

            {/* In-Results Live Search + Column Toggles + Export Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
              {/* Search input in results */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={resultsSearchQuery}
                  onChange={(e) => setResultsSearchQuery(e.target.value)}
                  placeholder={isAr ? "ابحث في النتائج المستخرجة..." : "Search in extracted results..."}
                  className="w-full text-xs pl-9 pr-8 py-2 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
                {resultsSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setResultsSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Action Buttons: Copy Selected Columns + Exports */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={copySelectedColumns}
                  className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  title={isAr ? "نسخ الأعمدة المحددة للصقها مباشرة في Excel" : "Copy Selected Columns formatted for Excel"}
                >
                  {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  <span>{isAr ? "نسخ الأعمدة المختارة" : "Copy Selected"}</span>
                </button>

                <button
                  type="button"
                  onClick={downloadExcel}
                  className="px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-1.5 text-foreground cursor-pointer"
                  title="Download Excel (.xlsx)"
                >
                  <FileSpreadsheet className="size-3.5 text-emerald-500" />
                  <span>Excel</span>
                </button>

                <button
                  type="button"
                  onClick={downloadCSV}
                  className="px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-1.5 text-foreground cursor-pointer"
                  title="Download CSV"
                >
                  <Download className="size-3.5 text-blue-400" />
                  <span>CSV</span>
                </button>

                <button
                  type="button"
                  onClick={downloadJSON}
                  className="px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-1.5 text-foreground cursor-pointer"
                  title="Download JSON"
                >
                  <FileText className="size-3.5 text-purple-400" />
                  <span>JSON</span>
                </button>

                <button
                  type="button"
                  onClick={downloadTXT}
                  className="px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-1.5 text-foreground cursor-pointer"
                  title="Download TXT"
                >
                  <Download className="size-3.5 text-muted-foreground" />
                  <span>TXT</span>
                </button>
              </div>
            </div>

            {/* Interactive Column Toggles Bar */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Filter className="size-3 text-primary" />
                  <span>{isAr ? "الأعمدة:" : "Columns:"}</span>
                </span>

                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={colVisible.number}
                    onChange={(e) => setColVisible({ ...colVisible, number: e.target.checked })}
                    className="size-3 rounded"
                  />
                  <span>{isAr ? "رقم الهاتف" : "Phone Number"}</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={colVisible.area}
                    onChange={(e) => setColVisible({ ...colVisible, area: e.target.checked })}
                    className="size-3 rounded"
                  />
                  <span>{isAr ? "كود المنطقة" : "Area Code"}</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={colVisible.state}
                    onChange={(e) => setColVisible({ ...colVisible, state: e.target.checked })}
                    className="size-3 rounded"
                  />
                  <span>{isAr ? "الولاية" : "State"}</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={colVisible.abbr}
                    onChange={(e) => setColVisible({ ...colVisible, abbr: e.target.checked })}
                    className="size-3 rounded"
                  />
                  <span>{isAr ? "الرمز" : "Abbr"}</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={colVisible.time}
                    onChange={(e) => setColVisible({ ...colVisible, time: e.target.checked })}
                    className="size-3 rounded"
                  />
                  <span>{isAr ? "التوقيت المحلي" : "Local Time"}</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={colVisible.tcpa}
                    onChange={(e) => setColVisible({ ...colVisible, tcpa: e.target.checked })}
                    className="size-3 rounded"
                  />
                  <span>{isAr ? "ساعات TCPA" : "TCPA Status"}</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={colVisible.carrier}
                    onChange={(e) => setColVisible({ ...colVisible, carrier: e.target.checked })}
                    className="size-3 rounded"
                  />
                  <span>{isAr ? "الشبكة" : "Carrier"}</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={colVisible.name}
                    onChange={(e) => setColVisible({ ...colVisible, name: e.target.checked })}
                    className="size-3 rounded"
                  />
                  <span>{isAr ? "اسم العميل" : "Customer Name"}</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={colVisible.feedback}
                    onChange={(e) => setColVisible({ ...colVisible, feedback: e.target.checked })}
                    className="size-3 rounded"
                  />
                  <span>{isAr ? "الملاحظات" : "Feedback"}</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={colVisible.risk}
                    onChange={(e) => setColVisible({ ...colVisible, risk: e.target.checked })}
                    className="size-3 rounded"
                  />
                  <span>{isAr ? "فحص الاحتيال" : "Fraud Check"}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Results Display View: Table or Monospace Text */}
          {viewMode === "table" ? (
            <div className="glass-panel rounded-2xl overflow-hidden border border-border/80 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/80 bg-card/80 text-muted-foreground uppercase tracking-wider text-[10px]">
                      {colVisible.number && <th className="py-3 px-4">{isAr ? "رقم الهاتف" : "Phone Number"}</th>}
                      {colVisible.area && <th className="py-3 px-4">{isAr ? "الكود" : "NPA"}</th>}
                      {colVisible.state && <th className="py-3 px-4">{isAr ? "الولاية / المنطقة" : "State / Region"}</th>}
                      {colVisible.abbr && <th className="py-3 px-4">{isAr ? "الرمز" : "Abbr"}</th>}
                      {colVisible.timezone && <th className="py-3 px-4">{isAr ? "المنطقة الزمنية" : "Timezone"}</th>}
                      {colVisible.time && <th className="py-3 px-4">{isAr ? "التوقيت المحلي" : "Local Time"}</th>}
                      {colVisible.tcpa && <th className="py-3 px-4">{isAr ? "حالة TCPA" : "TCPA Curfew"}</th>}
                      {colVisible.carrier && <th className="py-3 px-4">{isAr ? "المشغل" : "Carrier"}</th>}
                      {colVisible.name && <th className="py-3 px-4">{isAr ? "اسم العميل" : "Customer Name"}</th>}
                      {colVisible.feedback && <th className="py-3 px-4">{isAr ? "الملاحظات" : "Feedback"}</th>}
                      {colVisible.risk && <th className="py-3 px-4">{isAr ? "مؤشر الخطر" : "Risk Alert"}</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-medium">
                    {displayResults.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-8 text-center text-muted-foreground text-xs">
                          {isAr ? "لا توجد نتائج تطابق معايير الفلترة الحالية" : "No results match your current search/filters."}
                        </td>
                      </tr>
                    ) : (
                      displayResults.map((item, idx) => (
                        <tr key={idx} className="hover:bg-card/40 transition-colors">
                          {colVisible.number && (
                            <td className="py-2.5 px-4 font-mono font-bold text-foreground" dir="ltr">
                              <span>{item.formatted}</span>
                              {item.extension && (
                                <span className="ml-1.5 text-[11px] text-primary font-normal">
                                  ext {item.extension}
                                </span>
                              )}
                            </td>
                          )}
                          {colVisible.area && (
                            <td className="py-2.5 px-4 font-mono text-primary font-semibold">
                              {item.area}
                            </td>
                          )}
                          {colVisible.state && <td className="py-2.5 px-4 text-foreground">{item.state}</td>}
                          {colVisible.abbr && <td className="py-2.5 px-4 font-mono text-muted-foreground">{item.abbr}</td>}
                          {colVisible.timezone && <td className="py-2.5 px-4 text-[11px] text-muted-foreground">{item.timezone}</td>}
                          {colVisible.time && (
                            <td className="py-2.5 px-4 font-mono text-foreground" dir="ltr">
                              {item.time}
                            </td>
                          )}
                          {colVisible.tcpa && (
                            <td className="py-2.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  item.callStatus === "good"
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : item.callStatus === "caution"
                                    ? "bg-amber-500/15 text-amber-400"
                                    : "bg-rose-500/15 text-rose-400"
                                }`}
                              >
                                {item.callLabel}
                              </span>
                            </td>
                          )}
                          {colVisible.carrier && (
                            <td className="py-2.5 px-4 font-mono text-[11px] text-muted-foreground max-w-[140px] truncate" title={item.carrier}>
                              {item.carrier}
                            </td>
                          )}
                          {colVisible.name && (
                            <td className="py-2.5 px-4 font-medium text-foreground">
                              {item.name || <span className="text-muted-foreground/50">--</span>}
                            </td>
                          )}
                          {colVisible.feedback && (
                            <td className="py-2.5 px-4 text-[11px] text-muted-foreground max-w-[180px] truncate" title={item.feedback}>
                              {item.feedback || <span className="text-muted-foreground/50">--</span>}
                            </td>
                          )}
                          {colVisible.risk && (
                            <td className="py-2.5 px-4">
                              {item.risk ? (
                                <span className="inline-flex items-center gap-1 text-destructive font-bold text-[11px]">
                                  <ShieldAlert className="size-3.5" />
                                  <span>HIGH RISK</span>
                                </span>
                              ) : (
                                <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-medium">
                                  <CheckCircle2 className="size-3.5" />
                                  <span>Safe</span>
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-border/80 space-y-3.5 shadow-sm">
              {/* Text View Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/70">
                {/* Format Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <SlidersHorizontal className="size-3.5 text-primary" />
                    <span>{isAr ? "تنسيق المخرجات:" : "Text Layout:"}</span>
                  </span>
                  <div className="flex items-center bg-card/80 p-1 rounded-xl border border-border/80 text-xs">
                    <button
                      type="button"
                      onClick={() => setTextFormat("table")}
                      className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                        textFormat === "table"
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isAr ? "جدول محاذى الأعمدة" : "Aligned Table"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextFormat("records")}
                      className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                        textFormat === "records"
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isAr ? "بطاقات سجلات الليدات" : "Lead Dossiers"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextFormat("numbers")}
                      className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                        textFormat === "numbers"
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isAr ? "أرقام فقط للاتصال" : "Numbers Only"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextFormat("tsv")}
                      className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                        textFormat === "tsv"
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isAr ? "مفصول بجدولة (Excel)" : "TSV (Excel)"}
                    </button>
                  </div>
                </div>

                {/* Right Actions: Wrap Toggle + Quick Copy */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setWrapText(!wrapText)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      wrapText
                        ? "border-primary/60 bg-primary/10 text-primary font-medium"
                        : "border-border/80 bg-card/60 text-muted-foreground hover:text-foreground"
                    }`}
                    title={isAr ? "تبديل التفاف الأسطر" : "Toggle Line Wrap"}
                  >
                    <WrapText className="size-3.5" />
                    <span>{wrapText ? (isAr ? "التفاف مفعل" : "Wrap: On") : (isAr ? "سطر واحد (تمرير)" : "Single Line")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(textOutputString);
                      triggerToast(isAr ? "تم نسخ المخرجات النصية بالكامل!" : "All text output copied to clipboard!");
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Copy className="size-3.5" />
                    <span>{isAr ? "نسخ النص كاملاً" : "Copy Output"}</span>
                  </button>
                </div>
              </div>

              {/* Textarea Viewport */}
              <div className="relative">
                <textarea
                  readOnly
                  wrap={wrapText ? "soft" : "off"}
                  value={textOutputString}
                  rows={15}
                  dir="ltr"
                  spellCheck={false}
                  className="w-full bg-slate-950 text-slate-100 dark:bg-slate-950 p-4 rounded-xl font-mono text-xs border border-border/80 focus:outline-none resize-y overflow-x-auto whitespace-pre leading-relaxed shadow-inner selection:bg-primary/30"
                />
                <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-400/90 pointer-events-none bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700/50 shadow-xs">
                  {displayResults.length} {isAr ? "سجل" : "records"}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
