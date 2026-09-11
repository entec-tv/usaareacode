import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { TimeConverterTab } from "@/components/tools/TimeConverterTab";
import { useI18n } from "@/lib/i18n";
import { COMPANY } from "@/data/company";

export const Route = createFileRoute("/converter")({
  component: ConverterPage,
  head: () => ({
    meta: [
      { title: `Timezone Converter | ${COMPANY.name}` },
      { 
        name: "description", 
        content: "US & Global Cross-Timezone Converter for accurate meeting planning and TCPA curfew alignment." 
      },
    ]
  }),
});

function ConverterPage() {
  const { lang, t } = useI18n();
  const isAr = lang === "ar";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/25 selection:text-primary">
      <Header />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-12 md:py-20 animate-in fade-in duration-500">
        <TimeConverterTab
          t={t}
          isAr={isAr}
          onNavigateLookup={(code) => {
            navigate({ to: "/", search: { tab: "lookup" } });
            // In a real implementation we would pass the code somehow, maybe via state or another route parameter.
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
