import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { COMPANY } from "@/data/company";

const cols = [
  {
    titleEn: "Product & Intelligence",
    titleAr: "المنتجات والأدوات",
    links: [
      { to: "/", labelEn: "Lookup Hub", labelAr: "مركز الاستعلام الرئيسي" },
      { to: "/methodology", labelEn: "Data Methodology", labelAr: "منهجية البيانات" },
      { to: "/analytics", labelEn: "Telemetry & Analytics", labelAr: "التحليلات والمؤشرات" },
    ],
  },
  {
    titleEn: "Company",
    titleAr: "الشركة",
    links: [
      { to: "/about", labelEn: "About ENTEC", labelAr: "عن المنصة" },
      { to: "/blog", labelEn: "Engineering Blog", labelAr: "المدونة التقنية" },
      { to: "/contact", labelEn: "Contact Enterprise", labelAr: "تواصل مع الإدارة" },
    ],
  },
  {
    titleEn: "Governance & Legal",
    titleAr: "الحوكمة والامتثال",
    links: [
      { to: "/faq", labelEn: "Cited Regulatory FAQ", labelAr: "الأسئلة التنظيمية الشائعة" },
      { to: "/privacy", labelEn: "Privacy Policy", labelAr: "سياسة الخصوصية" },
      { to: "/terms", labelEn: "Terms of Service", labelAr: "شروط الخدمة" },
    ],
  },
] as const;

export function Footer() {
  const { t, lang } = useI18n();

  return (
    <footer className="mt-24 border-t border-slate-800 bg-[#090e17] text-slate-300 relative overflow-hidden">
      {/* Ambient top light beam & mesh glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-36 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand & Corporate Column */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl overflow-hidden p-0.5 bg-slate-900 border border-blue-400/40 shadow-[0_0_15px_rgba(59,130,246,0.25)] shrink-0">
              <img
                src="/entec-logo.jpg"
                alt="ENTEC Logo"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div>
              <span className="font-display text-xl font-extrabold text-white tracking-tight block leading-none">
                ENTEC
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-blue-400 block mt-1">
                {lang === "ar" ? "منصة ذكاء الاتصالات الموحدة" : "Phone Intelligence Hub"}
              </span>
            </div>
          </div>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            {t("tagline")} — {lang === "ar" 
              ? "بيانات موثوقة ومباشرة من خطة الترقيم لأمريكا الشمالية (NANPA)، وهيئة الاتصالات الفيدرالية (FCC)، ولجنة التجارة الفيدرالية (FTC)."
              : "authoritative NANP intelligence sourced from NANPA, the FCC, CRTC, and FTC consumer advisories."}
          </p>

          <ul className="mt-5 space-y-2.5 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-blue-400" />
              <span className="text-slate-300">{COMPANY.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-blue-400" />
              <a href={`tel:${COMPANY.phoneRaw}`} className="text-slate-300 hover:text-white transition-colors">
                {COMPANY.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-blue-400" />
              <a href={`mailto:${COMPANY.email}`} className="text-slate-300 hover:text-white transition-colors">
                {COMPANY.email}
              </a>
            </li>
          </ul>
        </div>

        {/* Navigation & Link Columns */}
        {cols.map((c) => (
          <div key={c.titleEn}>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white flex items-center gap-2">
              <span className="inline-block size-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              {lang === "ar" ? c.titleAr : c.titleEn}
            </h3>
            <ul className="mt-4 space-y-3">
              {c.links.map((l) => (
                <li key={l.labelEn}>
                  <Link
                    to={l.to as any}
                    className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-blue-300"
                  >
                    <span>{lang === "ar" ? l.labelAr : l.labelEn}</span>
                    <ArrowUpRight className="size-3 text-slate-600 opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-blue-400 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Legal & Telemetry Bar */}
      <div className="border-t border-slate-800/80 bg-[#060a12] px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-slate-400 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <p className="text-slate-400">
              © {new Date().getFullYear()} {COMPANY.name}. {t("footer_rights")}
            </p>
            <span className="hidden sm:inline text-slate-700">|</span>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{lang === "ar" ? "المزامنة اللحظية مع NANPA نشطة" : "NANP Registry Sync Active"}</span>
            </div>
          </div>

          <p className="text-slate-500 text-center sm:text-end">
            {lang === "ar"
              ? "بيانات مستخلصة من إيداعات NANPA و CNA و FCC العامة. غير تابعة لأي جهة تنظيمية حكومية."
              : "Data compiled from public NANPA, CNA and FCC filings. Not affiliated with any regulator."}
          </p>
        </div>
      </div>
    </footer>
  );
}
