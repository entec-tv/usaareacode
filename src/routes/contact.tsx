import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/data/company";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/25 selection:text-primary">
      <Header />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            <MessageSquare className="size-3.5" />
            <span>{isAr ? "تواصل مع فريق ENTEC" : "Contact ENTEC"}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-gradient mb-3">
            {isAr ? "نحن هنا لمساعدتك في استفسارات الاتصالات" : "Get in Touch with our Telecom Team"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isAr
              ? "فريق الدعم الفني وخدمات الشركات متواجد للإجابة على استفسارات قواعد البيانات وخدمات الامتثال."
              : "Our engineering and compliance operations team is available to assist with API integrations, data feeds, and corporate inquiries."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Details Card */}
          <div className="glass-panel p-8 rounded-3xl border border-border/80 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-6">
                {isAr ? "بيانات المقر الرئيسي" : "Corporate Headquarters"}
              </h2>

              <ul className="space-y-6 text-sm">
                <li className="flex items-start gap-3.5">
                  <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block mb-0.5">Physical Address</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      {COMPANY.address}
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block mb-0.5">Phone (Direct Desk)</span>
                    <a
                      href={`tel:${COMPANY.phoneRaw}`}
                      className="text-xs text-primary hover:underline font-mono"
                    >
                      {COMPANY.phone}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block mb-0.5">Official Email</span>
                    <a
                      href={`mailto:${COMPANY.email}`}
                      className="text-xs text-primary hover:underline font-mono"
                    >
                      {COMPANY.email}
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-border/60 text-xs text-muted-foreground">
              Operating hours: Monday – Friday, 8:00 AM – 6:00 PM Eastern Time.
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-panel p-8 rounded-3xl border border-border/80">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="size-14 rounded-full bg-emerald-500/20 text-emerald-400 grid place-items-center mx-auto">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {isAr ? "تم استلام رسالتك بنجاح" : "Message Sent Successfully"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {isAr
                    ? `شكراً لتواصلك مع ENTEC. سيقوم فريقنا بالرد على ${form.email} في أقرب وقت ممكن.`
                    : `Thank you for reaching out to ENTEC. An analyst will review your inquiry and follow up at ${form.email} shortly.`}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">
                  {isAr ? "إرسال رسالة مباشرة" : "Send an Inquiry"}
                </h3>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl bg-card border border-border px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full rounded-xl bg-card border border-border px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Inquiry Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Data feed integration, TCPA compliance, or custom export"
                    className="w-full rounded-xl bg-card border border-border px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your telecom intelligence inquiry..."
                    className="w-full rounded-xl bg-card border border-border px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-y"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  <Send className="size-3.5" />
                  <span>Send Message to ENTEC</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
