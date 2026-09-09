import React from "react";
import {
  Building2,
  CheckCircle2,
  Quote,
  ShieldCheck,
  Headphones,
  Database,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface EnterpriseTestimonialsProps {
  onNavigateToBulk: () => void;
  isAr: boolean;
}

export const EnterpriseTestimonials: React.FC<EnterpriseTestimonialsProps> = ({
  onNavigateToBulk,
  isAr,
}) => {
  const caseStudies = [
    {
      sectorEn: "Outbound Contact Centers & BPO",
      sectorAr: "مراكز الاتصال ومزودو خدمة BPO",
      roleEn: "VP of Contact Center Compliance",
      roleAr: "نائب رئيس الامتثال التشغيلي",
      companyEn: "OmniDial Enterprise BPO",
      quoteEn:
        "“Sequencing our 80,000 daily outbound dials by ENTEC’s recipient rate-center timezone completely eliminated our risk of TCPA curfew violations. It paid for itself on day one.”",
      quoteAr:
        "«جدولة أكثر من 80,000 مكالمة صادرة يومياً بالاعتماد على رادار إنتك للتوقيت المحلي للمستلم قضت تماماً على مخاطر مخالفة أوقات حظر الاتصال. المنظومة أثبتت قيمتها من اليوم الأول.»",
      metricEn: "Zero TCPA Citations",
      metricAr: "صفر مخالفات TCPA في 12 شهراً",
      icon: Headphones,
    },
    {
      sectorEn: "CRM & B2B Sales Platforms",
      sectorAr: "منصات إدارة علاقات العملاء والمبيعات",
      roleEn: "Director of Revenue Operations",
      roleAr: "مدير العمليات وسلاسل الإيرادات",
      companyEn: "Apex Revenue Engine",
      quoteEn:
        "“ENTEC’s bulk normalization strips deceptive +1 Caribbean numbers before our reps call. It stopped hundreds of toll-fraud charges and cleaned up our entire database.”",
      quoteAr:
        "«محرك التنظيف بالجملة يكشف أرقام +1 الكاريبية المخادعة قبل أن يتصل بها مندوبو المبيعات. حمى شركتنا من فواتير احتيال باهظة ونظم قاعدة بياناتنا بالكامل.»",
      metricEn: "100% Toll Trap Cleansed",
      metricAr: "تطهير 100% من مصائد الاحتيال",
      icon: Database,
    },
    {
      sectorEn: "Enterprise VoIP & Carrier Routing",
      sectorAr: "البنية التحتية لشبكات الاتصالات و VoIP",
      roleEn: "Chief Telephony Architect",
      roleAr: "رئيس مهندسي شبكات الاتصال",
      companyEn: "NorthStar Telecom Systems",
      quoteEn:
        "“The millisecond query speed of ENTEC’s NANPA database enables our routing servers to perform instant rate-center validation without adding even 1ms of audio latency.”",
      quoteAr:
        "«السرعة الفائقة لقاعدة بيانات نانبا لدى إنتك تتيح لخوادم التوجيه لدينا فحص المقسم المركزي فورياً دون إضافة أي تأخير صوتي يذكر على المكالمات.»",
      metricEn: "< 1ms Gateway Resolution",
      metricAr: "استعلام في أقل من 1 ميلي ثانية",
      icon: Building2,
    },
  ];

  return (
    <section className="space-y-10 sm:space-y-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-1">
            <ShieldCheck className="size-3.5" />
            <span>{isAr ? "موثوقية تشغيلية على مستوى الشركات" : "Operational Case Studies"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground tracking-tight">
            {isAr ? "كيف تعتمد المؤسسات الكبرى على ذكاء إنتك" : "How Enterprise Teams Rely on ENTEC"}
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed font-normal">
          {isAr
            ? "حلول مثبتة ميدانياً في حماية الميزانيات، منع الاحتيال، وضمان الالتزام القانوني الصارم."
            : "Field-tested operational workflows for contact centers, sales platforms, and telecom carriers."}
        </p>
      </div>

      {/* 3 Case Study Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {caseStudies.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-3xl bg-white dark:bg-card/90 border border-slate-200/90 dark:border-white/10 border-t-2 border-t-primary/70 dark:border-t-primary hover:border-primary/50 p-6 sm:p-7 space-y-5 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              {/* Subtle Ambient Watermark Quotation Icon in Background */}
              <Quote className="absolute -top-1 -right-1 size-20 text-primary/[0.06] dark:text-primary/[0.10] pointer-events-none transform -rotate-12 group-hover:scale-110 transition-transform duration-500" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="size-10 rounded-2xl bg-primary/10 dark:bg-primary/15 text-primary flex items-center justify-center border border-primary/20">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    {isAr ? item.metricAr : item.metricEn}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    {isAr ? item.sectorAr : item.sectorEn}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed italic font-normal">
                    {isAr ? item.quoteAr : item.quoteEn}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs relative z-10">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">{isAr ? item.roleAr : item.roleEn}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{item.companyEn}</div>
                </div>
                <Quote className="size-4 text-primary/40 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Conversion CTA Strip */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50/70 via-white to-slate-50/70 dark:from-primary/10 dark:via-card dark:to-indigo-500/10 border border-slate-200/90 dark:border-primary/25 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/25">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {isAr ? "هل لديك قائمة عملاء أو ملف CSV يحتاج إلى تنظيف وفحص؟" : "Have a phone list or CSV that needs TCPA & fraud cleansing?"}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {isAr ? "استخرج الأرقام الصالحة، حدد المناطق الزمنية، وافرز الأرقام المشبوهة مجاناً." : "Extract valid E.164 records, map rate centers, and isolate high-risk Caribbean codes instantly."}
            </div>
          </div>
        </div>

        <button
          onClick={onNavigateToBulk}
          className="btn-primary shrink-0"
        >
          <span>{isAr ? "تنظيف الأرقام مجاناً" : "Try Bulk Cleanser Free"}</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </section>
  );
};
