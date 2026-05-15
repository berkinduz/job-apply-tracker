import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JtAppShell } from "@/components/jt/app-shell";

/**
 * Server wrapper: ensures the visitor is authenticated, fetches the user
 * for header display, and mounts the client-side JtAppShell.
 *
 * Use as the layout for any logged-in route group.
 */
export async function JtAuthShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <JtAppShell
      user={{
        email: user.email,
        user_metadata: user.user_metadata as { full_name?: string },
      }}
    >
      {children}
    </JtAppShell>
  );
}
