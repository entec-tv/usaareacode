import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, Globe, Mail, MapPin, Phone, Radio, Shield, Users } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/data/company";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/25 selection:text-primary">
      <Header />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="size-24 mx-auto mb-5 rounded-3xl p-1 bg-gradient-to-br from-cyan-500/30 via-primary/20 to-indigo-600/30 border border-cyan-400/40 shadow-[0_0_35px_rgba(6,182,212,0.35)] overflow-hidden">
            <img src="/entec-logo.jpg" alt="ENTEC Logo" className="w-full h-full object-cover rounded-[20px]" />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Building2 className="size-3.5 text-primary" />
            <span>{isAr ? "عن شركة ENTEC" : "About ENTEC"}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient mb-4">
            {isAr ? "بناء المعيار الذهبي لذكاء الاتصالات" : "The Gold Standard for NANP Telecom Intelligence"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {COMPANY.description}
          </p>
        </div>

        {/* Core Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="glass-panel p-6 rounded-2xl border border-border/70">
            <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center mb-4">
              <Shield className="size-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-2">
              {isAr ? "امتثال TCPA و FCC" : "TCPA & FCC Compliance"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "توفير نوافذ اتصال قانونية بدقة الثواني لحماية المؤسسات من الغرامات التنظيمية بموجب المادة 47 من القانون الفيدرالي الأمريكي."
                : "Real-time legal calling window calculations down to the exact second, protecting organizations from costly TCPA regulatory fines."}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border/70">
            <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center mb-4">
              <Radio className="size-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-2">
              {isAr ? "مكافحة احتيال وانجيري" : "Fraud Trap Interception"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "رصد وتحييد أرقام الاحتيال الكاريبية باهظة الرسوم (Wangiri) ومكالمات الرنة الواحدة لمنع استنزاف أموال المستخدمين والشركات."
                : "Continuous surveillance of Caribbean offshore NPAs to intercept one-ring Wangiri billing traps before calls are returned."}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border/70">
            <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center mb-4">
              <Globe className="size-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-2">
              {isAr ? "تغطية شاملة لكل أمريكا الشمالية" : "Complete NANP Coverage"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "تغطية فورية لأكثر من 400 مفتاح منطقة و 50 ولاية ومقاطعة كندية بالربط مع قواعد بيانات NANPA الرسمية."
                : "Direct alignment with official NANPA, CRTC, and FCC databases across 400+ active area codes and 50+ jurisdictions."}
            </p>
          </div>
        </div>

        {/* Corporate Headquarters & Contact */}
        <div className="glass-panel p-8 rounded-3xl border border-primary/30 mb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            {isAr ? "المقر الرئيسي ومعلومات التواصل" : "Corporate Headquarters & Operations"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block mb-1">
                  {isAr ? "العنوان الرئيسي" : "Headquarters"}
                </span>
                <span className="text-muted-foreground text-xs leading-relaxed">
                  {COMPANY.address}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block mb-1">
                  {isAr ? "هاتف العمليات المباشر" : "Direct Operations Desk"}
                </span>
                <a
                  href={`tel:${COMPANY.phoneRaw}`}
                  className="text-muted-foreground hover:text-primary text-xs font-mono"
                >
                  {COMPANY.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block mb-1">
                  {isAr ? "البريد الإلكتروني" : "Corporate Email"}
                </span>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="text-muted-foreground hover:text-primary text-xs font-mono"
                >
                  {COMPANY.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Leadership Team */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
            {isAr ? "القيادة التنفيذية" : "Executive Leadership"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {COMPANY.leadership.map((leader) => (
              <div
                key={leader.name}
                className="glass rounded-2xl p-6 text-center border border-border/70"
              >
                <div className="size-14 rounded-full bg-primary/15 text-primary font-display text-lg font-bold grid place-items-center mx-auto mb-4">
                  {leader.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h4 className="font-semibold text-foreground text-sm">{leader.name}</h4>
                <p className="text-xs text-primary font-medium mt-0.5">{leader.role}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
