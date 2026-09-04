import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

const D: Dict = {
  brand: { en: "ENTEC Phone Intelligence", ar: "إنتك لذكاء الاتصالات" },
  tagline: {
    en: "USA Area Code Lookup & Phone Intelligence Hub",
    ar: "منصة البحث عن مفاتيح المناطق الأمريكية وذكاء الأرقام",
  },
  nav_home: { en: "Home", ar: "الرئيسية" },
  nav_about: { en: "About", ar: "من نحن" },
  nav_methodology: { en: "Methodology", ar: "المنهجية" },
  nav_faq: { en: "FAQ", ar: "الأسئلة" },
  nav_blog: { en: "Blog", ar: "المدونة" },
  nav_contact: { en: "Contact", ar: "اتصل بنا" },
  nav_analytics: { en: "Analytics", ar: "التحليلات" },
  nav_privacy: { en: "Privacy", ar: "الخصوصية" },
  nav_terms: { en: "Terms", ar: "الشروط" },
  nav_more: { en: "More", ar: "المزيد" },
  nav_tools: { en: "Tools", ar: "الأدوات" },
  hero_title: {
    en: "Every North American area code, decoded in real time.",
    ar: "كل مفاتيح المناطق في أمريكا الشمالية، مفكّكة في الوقت الحقيقي.",
  },
  hero_sub: {
    en: "Instant NPA lookup, live local clocks, TCPA calling windows, bulk number cleansing and toll-fraud alerts — engineered by ENTEC for call centers, sales teams and analysts.",
    ar: "بحث فوري عن المفاتيح، ساعات محلية حية، نوافذ الاتصال القانونية، تنظيف الأرقام بالجملة، وتنبيهات الاحتيال الهاتفي — من تطوير إنتك لمراكز الاتصال وفرق المبيعات.",
  },
  search_ph: {
    en: "Enter area code, phone number, city or state…",
    ar: "أدخل مفتاح المنطقة أو رقم الهاتف أو المدينة أو الولاية…",
  },
  search_btn: { en: "Analyze", ar: "تحليل" },
  tool_lookup: { en: "Instant Lookup", ar: "بحث فوري" },
  tool_browse: { en: "Browse Database", ar: "قاعدة البيانات" },
  tool_bulk: { en: "Bulk Extractor", ar: "استخراج بالجملة" },
  tool_map: { en: "Timezone Map", ar: "خريطة المناطق الزمنية" },
  tool_compare: { en: "Compare Codes", ar: "مقارنة المفاتيح" },
  tool_converter: { en: "Time Converter", ar: "محول التوقيت" },
  tool_saved: { en: "Recents & Favorites", ar: "السجل والمفضلة" },
  swap_locations: { en: "Swap Locations", ar: "تبديل المدينتين" },
  source_city: { en: "Origin City", ar: "المدينة المصدر" },
  target_city: { en: "Target Destination", ar: "المدينة الهدف" },
  state: { en: "State / Province", ar: "الولاية / المقاطعة" },
  city: { en: "Primary Cities", ar: "المدن الرئيسية" },
  carrier: { en: "Dominant Carrier", ar: "المشغّل الرئيسي" },
  timezone: { en: "Timezone", ar: "المنطقة الزمنية" },
  localtime: { en: "Live Local Time", ar: "التوقيت المحلي الحي" },
  map: { en: "Open Map", ar: "افتح الخريطة" },
  callwindow: { en: "Calling Window", ar: "نافذة الاتصال" },
  risk_title: { en: "High-Risk Toll Fraud Code", ar: "مفتاح عالي الخطورة للاحتيال" },
  risk_body: {
    en: "This NPA is inside the Caribbean numbering plan. One-ring (Wangiri) scams use it to trigger premium international billing. Never return missed calls from this code.",
    ar: "هذا المفتاح ضمن خطة الترقيم الكاريبية، ويُستخدم في احتيال الرنة الواحدة لتحصيل رسوم دولية باهظة. لا تعاود الاتصال بأي مكالمة فائتة من هذا المفتاح.",
  },
  stats_codes: { en: "Area codes tracked", ar: "مفاتيح مُتتبعة" },
  stats_regions: { en: "States & provinces", ar: "ولاية ومقاطعة" },
  stats_risk: { en: "Fraud-flagged NPAs", ar: "مفاتيح مُعلّمة كاحتيال" },
  stats_sync: { en: "Clock sync", ar: "مزامنة الساعة" },
  export_xlsx: { en: "Export Excel", ar: "تصدير إكسل" },
  export_csv: { en: "Export CSV", ar: "تصدير CSV" },
  export_json: { en: "Export JSON", ar: "تصدير JSON" },
  copy: { en: "Copy", ar: "نسخ" },
  all: { en: "All", ar: "الكل" },
  favorites: { en: "Favorites", ar: "المفضلة" },
  recents: { en: "Recent searches", ar: "عمليات البحث الأخيرة" },
  clear: { en: "Clear", ar: "مسح" },
  no_results: { en: "No matching records found.", ar: "لا توجد نتائج مطابقة." },
  footer_rights: { en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },
};

interface Ctx {
  lang: Lang;
  dir: "ltr" | "rtl";
  t: (k: keyof typeof D | string) => string;
  toggle: () => void;
}

const I18nContext = createContext<Ctx>({
  lang: "en",
  dir: "ltr",
  t: (k) => D[k]?.en ?? String(k),
  toggle: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("entec:lang") as Lang | null;
    if (stored === "ar" || stored === "en") setLang(stored);
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("entec:lang", lang);
  }, [lang]);

  const toggle = useCallback(() => setLang((l) => (l === "en" ? "ar" : "en")), []);
  const t = useCallback((k: string) => D[k]?.[lang] ?? D[k]?.en ?? k, [lang]);

  const value = useMemo(
    () => ({ lang, dir: (lang === "ar" ? "rtl" : "ltr") as "ltr" | "rtl", t, toggle }),
    [lang, t, toggle],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
