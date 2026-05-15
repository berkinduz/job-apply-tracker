import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JtOnboarding } from "@/components/jt/onboarding";

export const metadata = {
  title: "Welcome to JobTrack",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <JtOnboarding />;
}
