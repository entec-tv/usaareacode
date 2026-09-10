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
  ShieldAlert,
  Sun,
  Moon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ScamReportModal } from "./ScamReportModal";
import { logEngagementEvent } from "@/lib/collections";

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

// Primary desktop direct nav tools (clean & concise)
const CORE_NAV_TOOLS = [
  { id: "browse" as const, key: "tool_browse", icon: Layers },
  { id: "map" as const, key: "tool_map", icon: Globe2 },
] as const;

// Secondary utility tools grouped into a sleek Tools dropdown
const UTILITY_TOOLS = [
  {
    id: "bulk" as const,
    key: "tool_bulk",
    icon: FileSpreadsheet,
    descEn: "Batch validate & extract area codes",
    descAr: "استخراج وفحص أرقام متعددة دفعة واحدة",
  },
  {
    id: "converter" as const,
    key: "tool_converter",
    icon: Clock,
    descEn: "Meeting planner & timezone calculator",
    descAr: "حساب فروق التوقيت وجدولة الاتصالات",
  },
  {
    id: "compare" as const,
    key: "tool_compare",
    icon: ArrowRightLeft,
    descEn: "Side-by-side NPA comparison",
    descAr: "مقارنة مباشرة بين كودين متزامنين",
  },
  {
    id: "saved" as const,
    key: "tool_saved",
    icon: Star,
    descEn: "Bookmarked codes & search history",
    descAr: "الأكواد المفضلة وسجل عمليات البحث",
  },
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
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [scamModalOpen, setScamModalOpen] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Read current pathname
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isHomePage = currentPath === "/";
  const isUtilityTabActive =
    isHomePage && ["bulk", "converter", "compare", "saved"].includes(activeTab || "");

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setMoreDropdownOpen(false);
      }
      if (
        toolsDropdownRef.current &&
        !toolsDropdownRef.current.contains(event.target as Node)
      ) {
        setToolsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMoreDropdownOpen(false);
        setToolsDropdownOpen(false);
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

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
    logEngagementEvent({ action: "theme_toggle", target: nextTheme });
  };

  const handleToolClick = (toolId: HeaderTabType) => {
    if (isHomePage && onSelectTab) {
      onSelectTab(toolId);
    }
    setToolsDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/90 dark:border-white/[0.08] shadow-[0_4px_20px_rgba(15,23,42,0.05)] dark:shadow-black/25 transition-all">
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
          <div className="relative size-9 rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-blue-500/20 via-primary/10 to-indigo-500/20 border border-blue-400/30 shadow-xs group-hover:border-blue-500/60 transition-all shrink-0">
            <img
              src="/entec-logo.webp"
              alt="ENTEC Logo"
              className="w-full h-full object-cover rounded-[8px]"
            />
          </div>
          {/* Mobile: short brand name only */}
          <span className="sm:hidden font-display text-sm font-extrabold tracking-tight text-gradient">
            ENTEC
          </span>
          {/* sm+: full brand with subtitle */}
          <span className="leading-tight hidden sm:block">
            <span className="block font-display text-sm font-extrabold tracking-tight text-gradient">
              ENTEC
            </span>
            <span className="block text-[9px] uppercase tracking-[0.16em] font-semibold text-primary/80">
              Phone Intelligence
            </span>
          </span>
        </Link>

        {/* Primary Desktop Navigation: Clean Streamlined 5-Item Bar */}
        <nav className="hidden lg:flex items-center gap-1.5 py-1">
          {/* Home Link */}
          <Link
            to="/"
            onClick={() => {
              if (isHomePage && onSelectTab) onSelectTab("lookup");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              isHomePage && activeTab === "lookup"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-card/70"
            }`}
          >
            <Home className="size-3.5" />
            <span>{t("nav_home")}</span>
          </Link>

          {/* Direct Core Tools */}
          {CORE_NAV_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = isHomePage && activeTab === tool.id;

            if (isHomePage && onSelectTab) {
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
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

            return (
              <Link
                key={tool.id}
                to="/"
                search={{ tab: tool.id }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border border-transparent text-muted-foreground hover:text-foreground hover:bg-card/70 hover:border-border/60"
              >
                <Icon className="size-3.5" />
                <span>{t(tool.key)}</span>
              </Link>
            );
          })}

          {/* "الأدوات / Tools" Dropdown Menu */}
          <div className="relative" ref={toolsDropdownRef}>
            <button
              onClick={() => {
                setToolsDropdownOpen((prev) => !prev);
                setMoreDropdownOpen(false);
              }}
              aria-expanded={toolsDropdownOpen}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                isUtilityTabActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                  : toolsDropdownOpen
                    ? "bg-card border-primary/40 text-foreground shadow-sm"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/70 hover:border-border/60"
              }`}
            >
              <Sliders className="size-3.5" />
              <span>{t("nav_tools")}</span>
              <ChevronDown
                className={`size-3.5 transition-transform duration-200 ${
                  toolsDropdownOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                }`}
              />
            </button>

            {/* Tools Dropdown Card */}
            {toolsDropdownOpen && (
              <div
                className={`absolute top-full mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-primary/30 p-2 shadow-2xl shadow-black/20 dark:shadow-black/70 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                  isAr ? "right-0" : "left-0"
                }`}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-primary">
                    {isAr ? "أدوات إضافية" : "Advanced Tools"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">4 Tools</span>
                </div>

                <div className="space-y-0.5">
                  {UTILITY_TOOLS.map((tool) => {
                    const ToolIcon = tool.icon;
                    const isActive = isHomePage && activeTab === tool.id;

                    const content = (
                      <>
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-primary"
                          }`}
                        >
                          <ToolIcon className="size-3.5" />
                        </div>
                        <div className="leading-tight flex-1">
                          <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                            <span>{t(tool.key)}</span>
                            {isActive && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-mono font-bold">
                                {isAr ? "نشط" : "Active"}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                            {isAr ? tool.descAr : tool.descEn}
                          </div>
                        </div>
                      </>
                    );

                    if (isHomePage && onSelectTab) {
                      return (
                        <button
                          key={tool.id}
                          onClick={() => handleToolClick(tool.id)}
                          className={`w-full flex items-start gap-2.5 p-2 rounded-xl transition-all text-left rtl:text-right cursor-pointer ${
                            isActive
                              ? "bg-primary/15 text-primary font-semibold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800/70 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {content}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={tool.id}
                        to="/"
                        search={{ tab: tool.id }}
                        onClick={() => setToolsDropdownOpen(false)}
                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                          isActive
                            ? "bg-primary/15 text-primary font-semibold"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800/70 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* "المزيد / More" Dropdown Menu */}
          <div className="relative ml-1 rtl:mr-1 rtl:ml-0" ref={moreDropdownRef}>
            <button
              onClick={() => {
                setMoreDropdownOpen((prev) => !prev);
                setToolsDropdownOpen(false);
              }}
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
                className={`absolute top-full mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-primary/30 p-2 shadow-2xl shadow-black/20 dark:shadow-black/70 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                  isAr ? "left-0" : "right-0"
                }`}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
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
                            : "hover:bg-slate-100 dark:hover:bg-slate-800/70 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            isCurrent
                              ? "bg-primary text-primary-foreground"
                              : "bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-primary"
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

        {/* Right Section: Quick Favorites, Report Scam, Language Toggle & Mobile Hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Access to Bookmarks / Saved */}
          <button
            onClick={() => handleToolClick("saved")}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isHomePage && activeTab === "saved"
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/20"
                : "border-border/60 bg-card/40 text-muted-foreground hover:text-amber-300 hover:border-amber-400/30"
            }`}
            title={isAr ? "المفضلة والسجل" : "Favorites & Recents"}
            aria-label="Favorites & Recents"
          >
            <Star
              className={`size-4 ${
                isHomePage && activeTab === "saved" ? "fill-amber-400 text-amber-400" : ""
              }`}
            />
          </button>

          <button
            onClick={() => {
              setScamModalOpen(true);
              logEngagementEvent({ action: "report_modal_open" });
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all cursor-pointer shadow-xs"
            title={isAr ? "الإبلاغ عن رقم احتيالي" : "Report Phone Scam"}
            aria-label={isAr ? "الإبلاغ عن رقم احتيالي" : "Report Phone Scam"}
          >
            <ShieldAlert className="size-3.5" />
            <span className="hidden sm:inline">{isAr ? "إبلاغ عن احتيال" : "Report Scam"}</span>
          </button>

          <button
            onClick={() => {
              const nextLang = lang === "en" ? "ar" : "en";
              toggle();
              logEngagementEvent({ action: "lang_toggle", target: nextLang });
            }}
            aria-label="Toggle language"
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-card/70 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-white dark:hover:bg-card hover:border-primary/50 cursor-pointer shadow-xs"
          >
            <Languages className="size-3.5 text-primary" />
            <span>{lang === "en" ? "العربية" : "English"}</span>
          </button>

          {/* Apple Style Light / Dark Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-card/70 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-all cursor-pointer shadow-xs backdrop-blur-md"
            title={
              isDark
                ? isAr
                  ? "تفعيل الوضع الفاتح"
                  : "Switch to Light Mode"
                : isAr
                  ? "تفعيل الوضع الداكن"
                  : "Switch to Dark Mode"
            }
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="size-4 text-amber-400" />
            ) : (
              <Moon className="size-4 text-slate-700" />
            )}
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
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 lg:hidden shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
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

          {/* Mobile Scam Report Trigger */}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setScamModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-500/40 bg-red-500/15 text-red-400 font-semibold text-xs hover:bg-red-500/25 transition cursor-pointer"
            >
              <ShieldAlert className="size-4" />
              <span>{isAr ? "الإبلاغ عن مكالمة أو رقم احتيالي" : "Report a Phone Scam or Robocall"}</span>
            </button>
          </div>
        </div>
      )}

      <ScamReportModal
        isOpen={scamModalOpen}
        onClose={() => setScamModalOpen(false)}
      />
    </header>
  );
}
