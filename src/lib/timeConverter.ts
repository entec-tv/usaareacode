/**
 * Precision Cross-Timezone Conversion Engine for ENTEC Hub.
 * Handles exact calendar daylight saving time (DST) math, relative day offsets,
 * hour differentials, business hour overlaps, and TCPA telemarketing compliance.
 */

export interface TimezonePoint {
  time12: string; // e.g. "06:00 AM"
  time24: string; // e.g. "06:00"
  hour: number; // 0..23
  minute: number; // 0..59
  isAm: boolean;
  dateStr: string; // YYYY-MM-DD
  formattedDateEn: string; // e.g. "Friday, Sep 4, 2026"
  formattedDateAr: string; // e.g. "الجمعة، 4 سبتمبر 2026"
  tzName: string; // e.g. "EDT" or "GMT+3"
  utcOffsetHours: number; // e.g. -4 or +3
  offsetLabel: string; // e.g. "UTC-4"
  isBusinessHours: boolean; // 9 AM to 5 PM
  isDaytime: boolean; // 6 AM to 8 PM
}

export interface ConversionResult {
  source: TimezonePoint;
  target: TimezonePoint;
  dayOffset: number; // -1 = yesterday, 0 = same day, +1 = tomorrow
  hourDiff: number; // target relative to source (e.g. -7 means target is 7 hours behind source)
  diffSummaryEn: string;
  diffSummaryAr: string;
  tcpaStatus: "good" | "caution" | "blocked";
  tcpaLabelEn: string;
  tcpaLabelAr: string;
  tcpaDetailEn: string;
  tcpaDetailAr: string;
}

export interface TimelineHourSlot {
  sourceHour: number;
  sourceTime12: string;
  sourceTime24: string;
  targetHour: number;
  targetTime12: string;
  targetTime24: string;
  targetDayOffset: number;
  isMutualBusiness: boolean;
  isTargetTcpaSafe: boolean;
  sourcePeriod: "night" | "morning" | "afternoon" | "evening";
  targetPeriod: "night" | "morning" | "afternoon" | "evening";
}

/**
 * Calculates the exact UTC Date corresponding to a specific local date and time in a timezone.
 */
export function getUtcDateForLocalTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const initialUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(initialUtc);
    const map: Record<string, number> = {};
    for (const p of parts) {
      if (p.type !== "literal") {
        map[p.type] = parseInt(p.value, 10);
      }
    }

    const y = map["year"] ?? year;
    const m = (map["month"] ?? month) - 1;
    const d = map["day"] ?? day;
    const rawH = map["hour"] ?? hour;
    const h = rawH === 24 ? 0 : rawH;
    const min = map["minute"] ?? minute;
    const sec = map["second"] ?? 0;

    const formattedAsUtc = Date.UTC(y, m, d, h, min, sec);

    const offsetMs = formattedAsUtc - initialUtc.getTime();
    return new Date(initialUtc.getTime() - offsetMs);
  } catch {
    return initialUtc;
  }
}

/**
 * Formats a UTC Date into detailed components for a specific timezone.
 */
export function formatTimezonePoint(date: Date, timeZone: string): TimezonePoint {
  const options: Intl.DateTimeFormatOptions = {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  };

  const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(date);
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") {
      map[p.type] = parseInt(p.value, 10);
    }
  }

  const rawHour = map["hour"] ?? 0;
  const hour = rawHour === 24 ? 0 : rawHour;
  const minute = map["minute"] ?? 0;
  const year = map["year"] ?? date.getUTCFullYear();
  const month = map["month"] ?? date.getUTCMonth() + 1;
  const day = map["day"] ?? date.getUTCDate();
  const second = map["second"] ?? 0;

  const isAm = hour < 12;
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const time12 = `${String(h12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${isAm ? "AM" : "PM"}`;
  const time24 = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const formattedDateEn = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const formattedDateAr = new Intl.DateTimeFormat("ar-EG", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  let tzName = "UTC";
  try {
    const tzParts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(date);
    const tzPart = tzParts.find((p) => p.type === "timeZoneName");
    if (tzPart) tzName = tzPart.value;
  } catch {
    // fallback
  }

  // Calculate UTC offset
  const utcDate = new Date(date.toISOString());
  const localDateFromParts = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second)
  );
  const diffMinutes = Math.round((localDateFromParts.getTime() - utcDate.getTime()) / 60000);
  const utcOffsetHours = Math.round((diffMinutes / 60) * 10) / 10;
  const sign = utcOffsetHours >= 0 ? "+" : "-";
  const absHours = Math.abs(utcOffsetHours);
  const offsetLabel = `UTC${sign}${absHours}`;

  return {
    time12,
    time24,
    hour,
    minute,
    isAm,
    dateStr,
    formattedDateEn,
    formattedDateAr,
    tzName,
    utcOffsetHours,
    offsetLabel,
    isBusinessHours: hour >= 9 && hour < 17,
    isDaytime: hour >= 6 && hour < 20,
  };
}

/**
 * Main cross-timezone converter.
 */
export function convertCrossTimezone(
  sourceTz: string,
  targetTz: string,
  dateStr: string, // YYYY-MM-DD
  timeStr: string // HH:mm
): ConversionResult {
  const [year = 2026, month = 1, day = 1] = dateStr.split("-").map((v) => parseInt(v, 10));
  const [hour = 0, minute = 0] = timeStr.split(":").map((v) => parseInt(v, 10));

  const utcDate = getUtcDateForLocalTime(year, month, day, hour, minute, sourceTz);

  const sourcePoint = formatTimezonePoint(utcDate, sourceTz);
  const targetPoint = formatTimezonePoint(utcDate, targetTz);

  // Day offset calculation
  const sourceEpochDay = Math.floor(
    new Date(sourcePoint.dateStr + "T00:00:00Z").getTime() / (86400 * 1000)
  );
  const targetEpochDay = Math.floor(
    new Date(targetPoint.dateStr + "T00:00:00Z").getTime() / (86400 * 1000)
  );
  const dayOffset = targetEpochDay - sourceEpochDay;

  // Hour differential
  const hourDiff = Math.round((targetPoint.utcOffsetHours - sourcePoint.utcOffsetHours) * 10) / 10;

  // Summary strings
  let diffSummaryEn = "";
  let diffSummaryAr = "";
  if (hourDiff === 0) {
    diffSummaryEn = "Both locations are in the same time offset";
    diffSummaryAr = "المدينتان تقعان في نفس المنطقة الزمنية";
  } else if (hourDiff > 0) {
    diffSummaryEn = `Target is ${hourDiff} hour${Math.abs(hourDiff) === 1 ? "" : "s"} ahead`;
    diffSummaryAr = `المدينة الهدف تسبق بـ ${hourDiff} ساعة`;
  } else {
    diffSummaryEn = `Target is ${Math.abs(hourDiff)} hour${Math.abs(hourDiff) === 1 ? "" : "s"} behind`;
    diffSummaryAr = `المدينة الهدف تتأخر بـ ${Math.abs(hourDiff)} ساعة`;
  }

  // TCPA calling window check on target
  let tcpaStatus: "good" | "caution" | "blocked" = "blocked";
  let tcpaLabelEn = "Calling Curfew (Do Not Call)";
  let tcpaLabelAr = "وقت محظور للاتصال (Curfew)";
  let tcpaDetailEn = "Outside legal TCPA 8:00 AM – 9:00 PM local calling window.";
  let tcpaDetailAr = "خارج نافذة الاتصال القانونية المسموحة (8:00 ص – 9:00 م).";

  if (targetPoint.hour >= 8 && targetPoint.hour < 21) {
    tcpaStatus = "good";
    tcpaLabelEn = "TCPA Compliant (Safe to Call)";
    tcpaLabelAr = "وقت اتصال قانوني مسموح (TCPA)";
    tcpaDetailEn = "Within legal 8:00 AM – 9:00 PM local customer contact window.";
    tcpaDetailAr = "ضمن الأوقات القانونية المسموحة لمكالمات العملاء وخدمة المشتركين.";
  } else if (targetPoint.hour === 7 || targetPoint.hour === 21) {
    tcpaStatus = "caution";
    tcpaLabelEn = "Curfew Boundary (High Caution)";
    tcpaLabelAr = "على حدود الحظر (توخي الحذر)";
    tcpaDetailEn = "Approaching or adjacent to the legal 8:00 AM / 9:00 PM curfew boundary.";
    tcpaDetailAr = "ملاصق لحدود الحظر الصباحي أو المسائي (خطر الشكاوى التنظيمية).";
  }

  return {
    source: sourcePoint,
    target: targetPoint,
    dayOffset,
    hourDiff,
    diffSummaryEn,
    diffSummaryAr,
    tcpaStatus,
    tcpaLabelEn,
    tcpaLabelAr,
    tcpaDetailEn,
    tcpaDetailAr,
  };
}

/**
 * Generates an interactive 24-hour comparative timeline between two timezones.
 */
export function generate24HourTimeline(
  sourceTz: string,
  targetTz: string,
  dateStr: string
): TimelineHourSlot[] {
  const [year = 2026, month = 1, day = 1] = dateStr.split("-").map((v) => parseInt(v, 10));
  const slots: TimelineHourSlot[] = [];

  for (let h = 0; h < 24; h++) {
    const utcDate = getUtcDateForLocalTime(year, month, day, h, 0, sourceTz);
    const src = formatTimezonePoint(utcDate, sourceTz);
    const tgt = formatTimezonePoint(utcDate, targetTz);

    const srcDay = Math.floor(new Date(src.dateStr + "T00:00:00Z").getTime() / 86400000);
    const tgtDay = Math.floor(new Date(tgt.dateStr + "T00:00:00Z").getTime() / 86400000);
    const targetDayOffset = tgtDay - srcDay;

    const getPeriod = (hour: number): "night" | "morning" | "afternoon" | "evening" => {
      if (hour >= 6 && hour < 12) return "morning";
      if (hour >= 12 && hour < 17) return "afternoon";
      if (hour >= 17 && hour < 22) return "evening";
      return "night";
    };

    slots.push({
      sourceHour: src.hour,
      sourceTime12: src.time12,
      sourceTime24: src.time24,
      targetHour: tgt.hour,
      targetTime12: tgt.time12,
      targetTime24: tgt.time24,
      targetDayOffset,
      isMutualBusiness: src.isBusinessHours && tgt.isBusinessHours,
      isTargetTcpaSafe: tgt.hour >= 8 && tgt.hour < 21,
      sourcePeriod: getPeriod(src.hour),
      targetPeriod: getPeriod(tgt.hour),
    });
  }

  return slots;
}
