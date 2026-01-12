"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "jobtrack_auth_toast";

export function AuthToastListener() {
  const t = useTranslations("auth");

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
            if (event === "SIGNED_IN" && session) {
        const isResetFlow =
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/reset-password");
        if (!isResetFlow && sessionStorage.getItem(STORAGE_KEY) != "signed_in") {
          toast.success(t("loginSuccess"));
          sessionStorage.setItem(STORAGE_KEY, "signed_in");
        }
      }
      if (event === "SIGNED_OUT") {
        toast.success(t("logoutSuccess"));
        sessionStorage.removeItem(STORAGE_KEY);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [t]);

  return null;
}
