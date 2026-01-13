"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Settings, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const navItems = [
    { href: "/", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/analytics", label: "Analytics", icon: PieChart },
    { href: "/applications/new", label: t("newApplication"), icon: Plus },
    { href: "/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-full flex flex-col gap-1 rounded-none",
                  isActive && "bg-secondary"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
