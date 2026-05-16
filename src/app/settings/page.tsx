import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JtSettings } from "@/components/jt/settings";
import { createClient } from "@/lib/supabase/server";
import { getOwnPublicProfileSettings } from "@/app/settings/public-profile-actions";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your JobTrack preferences — theme, language, customization, and data.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const publicProfile = (await getOwnPublicProfileSettings()) || {
    enabled: false,
    handle: null,
    showCompanies: false,
    displayName: null,
  };
  return (
    <JtSettings userEmail={user.email} publicProfileInitial={publicProfile} />
  );
}
