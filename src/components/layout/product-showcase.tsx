import Image from "next/image";
import { useTranslations } from "next-intl";

export default function ProductShowcase() {
  const t = useTranslations();
  return (
    <section className="hidden lg:block py-24 bg-background/80 lg:bg-muted/30 relative overflow-hidden border-t border-border rounded-2xl">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        {/* 1. Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
            {t("auth.previewTitle")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("auth.previewDesc")}
          </p>
        </div>

        {/* 2. Dashboard Preview (Browser Mockup - Dark/Light Compatible) */}
        <div className="hidden lg:block relative mx-auto max-w-6xl mb-24">
          {/* Frame: Adapts border and bg color based on theme */}
          <div className="rounded-xl border border-border bg-background shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
            {/* Safari Header Bar */}
            <div className="h-11 border-b border-border bg-muted/50 flex items-center px-4 space-x-2">
              {/* Traffic Lights */}
              <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]" />

              {/* URL Bar: Dark in dark mode, white in light mode */}
              <div className="ml-4 h-6 w-full max-w-[300px] bg-white dark:bg-zinc-800 rounded-md text-[10px] text-muted-foreground flex items-center px-2 border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-200">
                <span className="opacity-50 mr-1">🔒</span>{" "}
                jobapplytracker.com/dashboard
              </div>
            </div>

            {/* Image Container */}
            <div className="relative aspect-video w-full bg-background">
              {/* LIGHT THEME IMAGE */}
              {/* dark:hidden -> Hide this when dark mode is active */}
              <div className="block dark:hidden relative w-full h-full">
                <Image
                  src="/dashboard-preview_light.png"
                  alt="JobTrack Dashboard Light Mode"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>

              {/* DARK THEME IMAGE */}
              {/* hidden dark:block -> Show this only in dark mode */}
              <div className="hidden dark:block relative w-full h-full">
                <Image
                  src="/dashboard-preview_dark.png"
                  alt="JobTrack Dashboard Dark Mode"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Background Glow Effect */}
          <div className="absolute -inset-4 bg-primary/20 blur-2xl -z-10 rounded-[2rem] opacity-50 dark:opacity-30" />
        </div>
      </div>
    </section>
  );
}
