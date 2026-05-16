import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client. Bypasses RLS — only use in trusted server
 * contexts (cron jobs, internal background workers). Never import from
 * client/browser code or RSC that runs on the user's behalf.
 */
let cached: ReturnType<typeof createClient<Database>> | null = null;
export function createAdminClient() {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "createAdminClient: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing",
    );
  }
  cached = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
