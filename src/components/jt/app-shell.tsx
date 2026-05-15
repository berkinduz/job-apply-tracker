"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Plus,
  List,
  PieChart,
  Settings as SettingsIcon,
  LogOut,
  User,
  Sun,
  Moon,
  Monitor,
  Languages,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { useRouter as useNextRouter } from "next/navigation";

import { JtButton, JtLogo } from "@/components/jt/primitives";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

/**
 * JtAppShell — the header + content wrapper for logged-in routes.
 *
 *   <JtAppShell>
 *     ... page content ...
 *   </JtAppShell>
 *
 * Provides:
 *   - sticky branded header with tab nav + search trigger + avatar
 *   - bottom navigation on mobile
 *   - container max-width 1280 (mirrors the design)
 *
 * The page is responsible for its own title row / body padding.
 */
export function JtAppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: { email?: string | null; user_metadata?: { full_name?: string } } | null;
}) {
  return (
    <div
      data-jt-shell
      style={{ background: "var(--jt-bg)", color: "var(--jt-text)", minHeight: "100vh" }}
    >
      <JtAppHeader user={user} />
      <div className="jt-app-body">{children}</div>
      <MobileBottomNav />
    </div>
  );
}

function JtAppHeader({
  user,
}: {
  user?: { email?: string | null; user_metadata?: { full_name?: string } } | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const tabs: { href: string; label: string; icon: React.ReactNode; matcher: (p: string) => boolean }[] =
    [
      { href: "/applications", label: "Applications", icon: <List size={14} />, matcher: (p) => p.startsWith("/applications") },
      { href: "/analytics", label: "Analytics", icon: <PieChart size={14} />, matcher: (p) => p.startsWith("/analytics") },
      { href: "/settings", label: "Settings", icon: <SettingsIcon size={14} />, matcher: (p) => p.startsWith("/settings") },
    ];

  return (
    <header
      style={{
        borderBottom: "1px solid var(--jt-border-2)",
        background: "color-mix(in oklab, var(--jt-bg) 92%, transparent)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
        className="sm:px-8"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24, minWidth: 0 }}>
          <Link href="/applications" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <JtLogo size={22} />
            <span
              className="hidden sm:inline"
              style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}
            >
              jobtrack
            </span>
          </Link>
          <nav className="hidden md:flex" style={{ gap: 4 }}>
            {tabs.map((t) => {
              const active = t.matcher(pathname || "");
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    background: active ? "var(--jt-bg-sunk)" : "transparent",
                    color: active ? "var(--jt-text)" : "var(--jt-text-2)",
                    border: "none",
                    borderRadius: "var(--r-md)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {t.icon}
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SearchTrigger />
          <Link href="/applications/new" className="hidden sm:block">
            <JtButton size="sm" icon={<Plus size={14} />}>
              New
            </JtButton>
          </Link>
          <Link href="/applications/new" className="sm:hidden">
            <JtButton size="sm" aria-label="New application">
              <Plus size={16} />
            </JtButton>
          </Link>
          <AvatarMenu user={user} onSignOut={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/");
            router.refresh();
          }} />
        </div>
      </div>
    </header>
  );
}

function SearchTrigger() {
  // Placeholder — Cmd+K palette comes in a follow-up.
  return (
    <button
      type="button"
      className="focus-ring hidden md:inline-flex"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 12px 7px 10px",
        background: "var(--jt-bg-sunk)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-md)",
        fontSize: 13,
        color: "var(--jt-text-2)",
        cursor: "pointer",
        minWidth: 220,
        whiteSpace: "nowrap",
      }}
      onClick={() => {
        // TODO: open command palette
      }}
    >
      <Search size={14} />
      <span style={{ flex: 1, textAlign: "left" }}>Search anything…</span>
      <span style={{ display: "flex", gap: 3 }}>
        <span className="kbd">⌘</span>
        <span className="kbd">K</span>
      </span>
    </button>
  );
}

function AvatarMenu({
  user,
  onSignOut,
}: {
  user?: { email?: string | null; user_metadata?: { full_name?: string } } | null;
  onSignOut: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useNextRouter();

  const setLocale = (next: "en" | "tr") => {
    document.cookie = `locale=${next};path=/;max-age=31536000`;
    router.refresh();
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account";
  const initial = (displayName || "U").trim()[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus-ring"
          aria-label="Account menu"
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            background: "linear-gradient(135deg, var(--p-400), var(--a-500))",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            border: "1px solid var(--jt-border)",
          }}
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div style={{ fontSize: 12, color: "var(--jt-text-3)" }}>Signed in as</div>
          <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{user?.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <SettingsIcon className="mr-2 h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {theme === "dark" ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : theme === "light" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Monitor className="mr-2 h-4 w-4" />
            )}
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" /> System
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages className="mr-2 h-4 w-4" /> Language
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setLocale("en")}>
              {locale === "en" ? "✓ " : ""}English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocale("tr")}>
              {locale === "tr" ? "✓ " : ""}Türkçe
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/applications", label: "List", icon: <List size={20} /> },
    { href: "/analytics", label: "Insights", icon: <PieChart size={20} /> },
    { href: "/settings", label: "Settings", icon: <User size={20} /> },
  ];
  return (
    <nav
      className="jt-mobile-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--jt-bg-elev)",
        borderTop: "1px solid var(--jt-border-2)",
        justifyContent: "space-around",
        padding: "8px 4px 14px",
        zIndex: 20,
        backdropFilter: "blur(12px)",
      }}
    >
      {items.map((i) => {
        const active = pathname?.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 8px",
              color: active ? "var(--p-500)" : "var(--jt-text-3)",
              fontSize: 10,
              fontWeight: 500,
            }}
          >
            {i.icon}
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
