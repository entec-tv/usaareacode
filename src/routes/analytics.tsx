import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Globe,
  HardDrive,
  Laptop,
  Server,
  ShieldAlert,
  Smartphone,
  Tablet,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/data/company";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const { telemetry } = COMPANY;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4 tracking-wide uppercase">
            <Activity className="size-3.5 animate-pulse text-primary" />
            {isAr ? "بيانات المراقبة اللحظية لشركة ENTEC" : "ENTEC Real-Time Telemetry"}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gradient mb-4">
            {isAr ? "لوحة مؤشرات وتحليلات الاتصالات" : "Telecommunications Intelligence & Analytics"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {isAr
              ? "متابعة حية لحجم استعلامات الأرقام، ونوافذ الاتصال الذكية، ورصد فخاخ الاحتيال عبر البنية التحتية لمنصة ENTEC في أمريكا الشمالية."
              : "Live platform telemetry, query throughput, TCPA calling window distribution, and Caribbean fraud trap flagging across ENTEC's North American infrastructure."}
          </p>
        </div>

        {/* Live System Health Badge */}
        <div className="mb-8 rounded-2xl border border-border/80 bg-card/50 backdrop-blur-md p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex size-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-3 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                {isAr ? "عقدة المعالجة المركزية (ENTEC Malvern Node)" : "ENTEC Core Node (Malvern, PA)"}
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                  {telemetry.uptime} Uptime
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {isAr ? "متصل مباشرة بسجلات NANPA و CRTC" : "Synchronized with live NANPA & CRTC registry feeds"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground font-mono">
            <div>
              <span className="block text-[10px] uppercase text-muted-foreground/70">
                {isAr ? "متوسط الاستجابة" : "Avg Latency"}
              </span>
              <span className="text-foreground font-semibold flex items-center gap-1">
                <Zap className="size-3 text-amber-400" />
                {telemetry.averageLatencyMs} ms
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-muted-foreground/70">
                {isAr ? "المفاتيح النشطة" : "Active NPAs"}
              </span>
              <span className="text-foreground font-semibold">{telemetry.activeCodesTracked} Codes</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-muted-foreground/70">
                {isAr ? "المناطق المشمولة" : "Coverage"}
              </span>
              <span className="text-foreground font-semibold">{telemetry.regionsCovered} Regions</span>
            </div>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isAr ? "إجمالي الاستعلامات" : "Total Lookups"}
              </span>
              <span className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Database className="size-5" />
              </span>
            </div>
            <div className="text-3xl font-black text-foreground mb-1">
              {telemetry.totalLookupsFormatted}
            </div>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <TrendingUp className="size-3.5" /> +14.8% {isAr ? "هذا الشهر" : "vs last month"}
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isAr ? "الأرقام المستخرجة" : "Bulk Extracted"}
              </span>
              <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <HardDrive className="size-5" />
              </span>
            </div>
            <div className="text-3xl font-black text-foreground mb-1">
              {telemetry.bulkExtractedFormatted}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              {isAr ? "معالجة محلية آمنة 100%" : "Client-side encrypted"}
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isAr ? "البحث العكسي المباشر" : "Reverse Dips"}
              </span>
              <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                <Server className="size-5" />
              </span>
            </div>
            <div className="text-3xl font-black text-foreground mb-1">
              {telemetry.reverseDipsFormatted}
            </div>
            <p className="text-xs text-muted-foreground">
              {isAr ? "ربط فوري بالمشغل والمدينة" : "Carrier OCN & LRN resolved"}
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 relative overflow-hidden group hover:border-rose-500/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                {isAr ? "تحذيرات الاحتيال المرصودة" : "Fraud Traps Flagged"}
              </span>
              <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
                <ShieldAlert className="size-5" />
              </span>
            </div>
            <div className="text-3xl font-black text-rose-400 mb-1">
              {telemetry.fraudTrapsFormatted}
            </div>
            <p className="text-xs text-rose-300/80">
              {isAr ? "رصد تلقائي لمكالمات الرنة الواحدة" : "Wangiri scam blocks active"}
            </p>
          </div>
        </div>

        {/* Charts & Behavioral Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Peak Usage Calling Windows */}
          <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Clock className="size-5 text-primary" />
                  {isAr ? "توزيع أوقات الاتصال وساعات الذروة" : "Peak Calling Hours & TCPA Window Usage"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAr
                    ? "نسبة الاستعلامات بحسب نوافذ التوقيت للاتصالات القانونية والتسويقية."
                    : "Hourly lookup density aligned with permissible sales outreach windows."}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-muted-foreground font-mono">
                EST / CST / MST / PST
              </span>
            </div>

            <div className="space-y-4">
              {telemetry.peakHours.map((slot) => (
                <div key={slot.window}>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-foreground">{slot.window} — <span className="font-normal text-muted-foreground">{slot.label}</span></span>
                    <span className="text-primary font-mono">{slot.usage}%</span>
                  </div>
                  <div className="h-3 w-full bg-accent/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-1000"
                      style={{ width: `${slot.usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device & Client Breakdown */}
          <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                <BarChart3 className="size-5 text-primary" />
                {isAr ? "توزيع الأجهزة والمستخدمين" : "Device & Access Traffic"}
              </h2>
              <p className="text-xs text-muted-foreground mb-6">
                {isAr ? "تحليل بيئة تصفح الزوار والأدوات البرمجية." : "Visitor endpoints querying ENTEC lookup utilities."}
              </p>

              <div className="space-y-4">
                {telemetry.deviceBreakdown.map((dev) => {
                  const Icon =
                    dev.name === "Desktop" ? Laptop : dev.name === "Mobile" ? Smartphone : Tablet;
                  return (
                    <div key={dev.name} className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-accent text-primary">
                        <Icon className="size-4" />
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-foreground">{dev.name}</span>
                          <span className="text-muted-foreground font-mono">{dev.percentage}% ({dev.count})</span>
                        </div>
                        <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${dev.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Geographic Share */}
            <div className="mt-6 pt-6 border-t border-border/60">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Globe className="size-3.5 text-primary" />
                {isAr ? "التوزيع الجغرافي للاستعلامات" : "Geographic Query Split"}
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                {telemetry.geoDistribution.map((geo) => (
                  <div key={geo.region} className="p-2 rounded-xl bg-accent/40 border border-border/40">
                    <span className="block text-sm font-bold text-foreground font-mono">{geo.share}</span>
                    <span className="block text-[10px] text-muted-foreground truncate">{geo.region}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Searched Area Codes Table */}
        <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isAr ? "أكثر 8 مفاتيح مناطق طلباً" : "Top 8 Most Queried Area Codes"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "المناطق الحضرية والمراكز التجارية الأكثر استعلاماً خلال الـ 30 يوماً الماضية."
                  : "High-volume metropolitan exchanges and flagged jurisdictions over the last 30 days."}
              </p>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Live Data · Source: {COMPANY.name} Engine
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60 bg-accent/20">
                <tr>
                  <th className="px-4 py-3 font-semibold">{isAr ? "المفتاح" : "Area Code"}</th>
                  <th className="px-4 py-3 font-semibold">{isAr ? "المدينة الرئيسية" : "Primary City"}</th>
                  <th className="px-4 py-3 font-semibold">{isAr ? "الولاية" : "State"}</th>
                  <th className="px-4 py-3 font-semibold">{isAr ? "المنطقة الزمنية" : "Timezone"}</th>
                  <th className="px-4 py-3 font-semibold text-right">{isAr ? "الاستعلامات" : "Volume (30d)"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {telemetry.topSearchedCodes.map((row) => (
                  <tr key={row.code} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary">
                      {row.code}
                      {row.code === "473" && (
                        <span className="ml-2 inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-sans font-medium">
                          Scam Warning
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground font-medium">{row.city}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">{row.state}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.tz}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                      {row.queries}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
