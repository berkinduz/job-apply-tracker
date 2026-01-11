"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    id: "kanban",
    light: "/kanban_light.gif",
    dark: "/kanban_dark.gif",
    alt: "Kanban board preview",
  },
  {
    id: "detail",
    light: "/apply_detail_light.gif",
    dark: "/apply_detail_dark.gif",
    alt: "Application detail preview",
  },
];

export function PreviewCarousel() {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemCount = items.length;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const target = container.children[index] as HTMLElement | undefined;
    target?.scrollIntoView({ behavior: "smooth", inline: "start" });
  }, [index]);

  const handleNext = () => {
    setIndex((current) => (current + 1) % itemCount);
  };

  const handlePrev = () => {
    setIndex((current) => (current - 1 + itemCount) % itemCount);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-2 pb-2 scroll-smooth"
        >
          {items.map((item) => (
            <div key={item.id} className="min-w-[85%] snap-start">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border bg-muted/10 shadow-lg">
                <div className="absolute inset-0 dark:hidden">
                  <Image
                    src={item.light}
                    alt={item.alt}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div className="absolute inset-0 hidden dark:block">
                  <Image
                    src={item.dark}
                    alt={item.alt}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Previous preview"
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-background/90 p-2 shadow-sm transition hover:bg-background"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next preview"
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-background/90 p-2 shadow-sm transition hover:bg-background"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {items.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Show ${item.id} preview`}
            onClick={() => setIndex(itemIndex)}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              itemIndex === index ? "bg-primary" : "bg-muted-foreground/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
