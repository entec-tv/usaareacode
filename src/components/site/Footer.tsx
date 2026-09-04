import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Radio } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { COMPANY } from "@/data/company";

const cols = [
  {
    title: "Product",
    links: [
      { to: "/", label: "Lookup Hub" },
      { to: "/methodology", label: "Data Methodology" },
      { to: "/analytics", label: "Analytics" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About ENTEC" },
      { to: "/blog", label: "Blog" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/faq", label: "Cited FAQ" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms of Service" },
    ],
  },
] as const;

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-cyan-500/30 via-primary/20 to-indigo-600/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0">
              <img
                src="/entec-logo.jpg"
                alt="ENTEC Logo"
                className="w-full h-full object-cover rounded-[9px]"
              />
            </div>
            <div>
              <span className="font-display text-xl font-extrabold text-gradient block leading-none">
                ENTEC
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-cyan-400/90 block mt-1">
                Phone Intelligence Hub
              </span>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t("tagline")} — authoritative NANP intelligence sourced from NANPA, the FCC, the
            CRTC and FTC consumer advisories.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              {COMPANY.address}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-primary" />
              <a href={`tel:${COMPANY.phoneRaw}`} className="hover:text-foreground">
                {COMPANY.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-primary" />
              <a href={`mailto:${COMPANY.email}`} className="hover:text-foreground">
                {COMPANY.email}
              </a>
            </li>
          </ul>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              {c.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to as any}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border/60 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. {t("footer_rights")}
          </p>
          <p>
            Data compiled from public NANPA, CNA and FCC filings. Not affiliated with any
            regulator.
          </p>
        </div>
      </div>
    </footer>
  );
}
