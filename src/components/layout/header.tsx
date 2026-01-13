"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Briefcase, Settings, LayoutGrid, PieChart } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { LogoutButton } from "./logout-button";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="w-full max-w-5xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href={isAuthenticated ? "/applications" : "/"}
          className="flex items-center gap-3 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 shadow-sm group-hover:shadow-md transition-shadow">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-bold text-base leading-tight tracking-tight">
              JobTrack
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Job Application Manager
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link href="/applications">
                <Button
                  variant={
                    pathname.startsWith("/applications") ? "secondary" : "ghost"
                  }
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Dashboard"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/analytics">
                <Button
                  variant={
                    pathname.startsWith("/analytics") ? "secondary" : "ghost"
                  }
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Analytics"
                >
                  <PieChart className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant={pathname === "/settings" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
