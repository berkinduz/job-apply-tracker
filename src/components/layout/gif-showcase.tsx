"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type ShowcaseLabel = "kanban" | "detail";

interface GifShowcaseProps {
  labels: Record<ShowcaseLabel, string>;
  alts: Record<ShowcaseLabel, string>;
}

const SLIDES: Array<{
  id: ShowcaseLabel;
  light: string;
  dark: string;
}> = [
  {
    id: "kanban",
    light: "/kanban_light.webm",
    dark: "/kanban_dark.webm",
  },
  {
    id: "detail",
    light: "/apply_detail_light.webm",
    dark: "/apply_detail_dark.webm",
  },
];

export function GifShowcase({ labels, alts }: GifShowcaseProps) {
  const [active, setActive] = useState<ShowcaseLabel>(SLIDES[0].id);

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full bg-muted/60 p-1">
          {SLIDES.map((slide) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActive(slide.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                active === slide.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {labels[slide.id]}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border bg-background shadow-xl">
        <div className="h-11 border-b border-border bg-muted/50 flex items-center px-4 space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]" />
          <div className="ml-4 h-6 w-full max-w-[260px] bg-white dark:bg-zinc-800 rounded-md text-[10px] text-muted-foreground flex items-center px-2 border border-black/5 dark:border-white/5 shadow-sm">
            <span className="opacity-50 mr-1">🔒</span> jobapplytracker.com
          </div>
        </div>

        <div className="relative aspect-[16/9] bg-background">
          {SLIDES.map((slide) => (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                active === slide.id ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="absolute inset-0 dark:hidden">
                <video
                  className="h-full w-full object-contain"
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label={alts[slide.id]}
                >
                  <source src={slide.light} type="video/webm" />
                </video>
              </div>
              <div className="absolute inset-0 hidden dark:block">
                <video
                  className="h-full w-full object-contain"
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label={alts[slide.id]}
                >
                  <source src={slide.dark} type="video/webm" />
                </video>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
