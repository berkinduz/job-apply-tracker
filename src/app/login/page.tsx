import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { JtLogin } from "@/components/jt/login";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to JobTrack — track every job application, follow up on time, and see what's actually working.",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/applications");
  return (
    <Suspense fallback={null}>
      <JtLogin />
    </Suspense>
  );
}
