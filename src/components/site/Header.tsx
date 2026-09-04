import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  Languages,
  Zap,
  Layers,
  FileSpreadsheet,
  Globe2,
  ArrowRightLeft,
  Clock,
  Star,
  ChevronDown,
  Info,
  Sliders,
  BarChart3,
  HelpCircle,
  BookOpen,
  PhoneCall,
  Home,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export type HeaderTabType =
  | "lookup"
  | "browse"
  | "bulk"
  | "map"
  | "compare"
  | "converter"
  | "saved";

export interface HeaderProps {
  activeTab?: HeaderTabType;
  onSelectTab?: (tab: HeaderTabType) => void;
}

const TOOLS = [
  { id: "lookup" as const, key: "tool_lookup", icon: Zap },
  { id: "browse" as const, key: "tool_browse", icon: Layers },
  { id: "bulk" as const, key: "tool_bulk", icon: FileSpreadsheet },
  { id: "map" as const, key: "tool_map", icon: Globe2 },
  { id: "compare" as const, key: "tool_compare", icon: ArrowRightLeft },
  { id: "converter" as const, key: "tool_converter", icon: Clock },
  { id: "saved" as const, key: "tool_saved", icon: Star },
] as const;

const COMPANY_LINKS = [
  {
    to: "/about",
    key: "nav_about",
    descEn: "Our mission, data sources & team",
    descAr: "رؤيتنا، مصادر البيانات وفريق العمل",
    icon: Info,
  },
  {
    to: "/methodology",
    key: "nav_methodology",
    descEn: "NANPA, LERG & regulatory rules",
    descAr: "معايير LERG واللوائح التنظيمية",
    icon: Sliders,
  },
  {
    to: "/analytics",
    key: "nav_analytics",
    descEn: "Telecom metrics & distribution",
    descAr: "إحصائيات فورية وتوزيع شبكات الاتصال",
    icon: BarChart3,
  },
  {
    to: "/faq",
    key: "nav_faq",
    descEn: "Common questions regarding area codes",
    descAr: "إجابات على الأسئلة الشائعة والاستفسارات",
    icon: HelpCircle,
  },
  {
    to: "/blog",
    key: "nav_blog",
    descEn: "Telecom intelligence guides & insights",
    descAr: "مقالات وأدلة تقنية حول الاتصالات",
    icon: BookOpen,
  },
  {
    to: "/contact",
    key: "nav_contact",
    descEn: "Enterprise inquiries & API support",
    descAr: "استفسارات الشركات والدعم الفني",
    icon: PhoneCall,
  },
] as const;

export function Header({ activeTab, onSelectTab }: HeaderProps) {
  const { t, lang, toggle } = useI18n();
  const isAr = lang === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Read current pathname
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isHomePage = currentPath === "/";

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setMoreDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMoreDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleToolClick = (toolId: HeaderTabType) => {
    if (isHomePage && onSelectTab) {
      onSelectTab(toolId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/80 shadow-lg shadow-black/10 transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
        {/* Brand Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 shrink-0"
          onClick={() => {
            if (isHomePage && onSelectTab) onSelectTab("lookup");
            setMobileMenuOpen(false);
          }}
        >
          <div className="relative size-9 rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-cyan-500/30 via-primary/20 to-indigo-600/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:border-cyan-400/80 transition-all shrink-0">
            <img
              src="/entec-logo.jpg"
              alt="ENTEC Logo"
              className="w-full h-full object-cover rounded-[8px]"
            />
          </div>
          <span className="leading-tight hidden sm:block">
            <span className="block font-display text-sm font-extrabold tracking-tight text-gradient">
              ENTEC
            </span>
            <span className="block text-[9px] uppercase tracking-[0.16em] font-semibold text-cyan-400/90">
              Phone Intelligence
            </span>
          </span>
        </Link>

        {/* Primary Desktop Navigation: Core Tools Bar */}
        <nav className="hidden lg:flex items-center gap-1 py-1">
          {/* Home Link */}
          <Link
            to="/"
            onClick={() => {
              if (isHomePage && onSelectTab) onSelectTab("lookup");
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              isHomePage && activeTab === "lookup"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-card/70"
            }`}
          >
            <Home className="size-3.5" />
            <span>{t("nav_home")}</span>
          </Link>

          {/* Interactive Tools Tabs */}
          {TOOLS.filter((tool) => tool.id !== "lookup").map((tool) => {
            const Icon = tool.icon;
            const isActive = isHomePage && activeTab === tool.id;

            if (isHomePage && onSelectTab) {
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/70 hover:border-border/60"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{t(tool.key)}</span>
                </button>
              );
            }

            // On other pages, route directly back to homepage with ?tab=
            return (
              <Link
                key={tool.id}
                to="/"
                search={{ tab: tool.id }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border border-transparent text-muted-foreground hover:text-foreground hover:bg-card/70 hover:border-border/60"
              >
                <Icon className="size-3.5" />
                <span>{t(tool.key)}</span>
              </Link>
            );
          })}

          {/* "المزيد / More" Dropdown Menu */}
          <div className="relative ml-1 rtl:mr-1 rtl:ml-0" ref={moreDropdownRef}>
            <button
              onClick={() => setMoreDropdownOpen((prev) => !prev)}
              aria-expanded={moreDropdownOpen}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                moreDropdownOpen || !isHomePage
                  ? "bg-card border-primary/40 text-foreground shadow-sm"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card/70"
              }`}
            >
              <span>{t("nav_more")}</span>
              <ChevronDown
                className={`size-3.5 transition-transform duration-200 ${
                  moreDropdownOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                }`}
              />
            </button>

            {/* Dropdown Card */}
            {moreDropdownOpen && (
              <div
                className={`absolute top-full mt-2 w-72 rounded-2xl bg-card/95 backdrop-blur-2xl border border-primary/30 p-2 shadow-2xl shadow-black/50 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                  isAr ? "left-0" : "right-0"
                }`}
              >
                <div className="px-3 py-1.5 border-b border-border/50 mb-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-primary">
                    {isAr ? "معلومات ومصادر إضافية" : "Company & Resources"}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {COMPANY_LINKS.map((item) => {
                    const ItemIcon = item.icon;
                    const isCurrent = currentPath === item.to;

                    return (
                      <Link
                        key={item.to}
                        to={item.to as any}
                        onClick={() => setMoreDropdownOpen(false)}
                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                          isCurrent
                            ? "bg-primary/15 text-primary font-semibold"
                            : "hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            isCurrent
                              ? "bg-primary text-primary-foreground"
                              : "bg-background border border-border/70 text-primary"
                          }`}
                        >
                          <ItemIcon className="size-3.5" />
                        </div>
                        <div className="leading-tight">
                          <div className="text-xs font-semibold text-foreground">
                            {t(item.key)}
                          </div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                            {isAr ? item.descAr : item.descEn}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Section: Language Toggle & Mobile Hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggle}
            aria-label="Toggle language"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card/70 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-card hover:border-primary/50 cursor-pointer"
          >
            <Languages className="size-3.5 text-primary" />
            <span>{lang === "en" ? "العربية" : "English"}</span>
          </button>

          <button
            className="rounded-xl border border-border/80 bg-card/70 p-2 lg:hidden text-foreground hover:border-primary/50 cursor-pointer"
            aria-label="Menu"
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-border/70 bg-background/98 backdrop-blur-2xl px-4 py-4 lg:hidden shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Core Tools Section */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-primary px-2 mb-1.5">
              {isAr ? "الأدوات الرئيسية" : "Core Telecom Tools"}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isActive = isHomePage && activeTab === tool.id;

                if (isHomePage && onSelectTab) {
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left rtl:text-right border cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card/70 border-border/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      <span className="truncate">{t(tool.key)}</span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={tool.id}
                    to="/"
                    search={{ tab: tool.id }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left rtl:text-right border border-border/60 bg-card/70 text-muted-foreground hover:text-foreground"
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span className="truncate">{t(tool.key)}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Company & Resources Section */}
          <div className="space-y-1 pt-2 border-t border-border/60">
            <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-muted-foreground px-2 mb-1.5">
              {isAr ? "المعلومات والصفحات" : "Company & Resources"}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {COMPANY_LINKS.map((item) => {
                const ItemIcon = item.icon;
                const isCurrent = currentPath === item.to;

                return (
                  <Link
                    key={item.to}
                    to={item.to as any}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent
                        ? "bg-primary/20 text-primary font-bold border border-primary/30"
                        : "bg-card/40 border border-border/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ItemIcon className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{t(item.key)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
