"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const HANDLE_RE = /^[a-z0-9][a-z0-9_-]{1,31}$/;

// Reserved namespaces and routes — keep public handles from shadowing app
// surfaces or impersonating roles. Lowercase, exact match.
const RESERVED = new Set([
  "admin",
  "administrator",
  "root",
  "support",
  "help",
  "api",
  "auth",
  "login",
  "logout",
  "signup",
  "signin",
  "settings",
  "applications",
  "analytics",
  "onboarding",
  "privacy",
  "terms",
  "u",
  "user",
  "users",
  "system",
  "jobtrack",
  "billing",
  "pricing",
  "about",
  "team",
  "staff",
  "moderator",
  "anonymous",
  "null",
  "undefined",
]);

function normalizeHandle(input: string): string {
  return input.trim().toLowerCase();
}

export type HandleCheckResult =
  | { ok: true; available: true; handle: string }
  | { ok: true; available: false; reason: "taken" | "yours" }
  | { ok: false; reason: "invalid" | "reserved" | "unauthenticated" };

export async function checkHandle(input: string): Promise<HandleCheckResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  const handle = normalizeHandle(input);
  if (!HANDLE_RE.test(handle)) return { ok: false, reason: "invalid" };
  if (RESERVED.has(handle)) return { ok: false, reason: "reserved" };

  const admin = createAdminClient();
  const { data } = await admin
    .from("user_settings")
    .select("user_id")
    .eq("public_handle", handle)
    .maybeSingle();

  if (!data) return { ok: true, available: true, handle };
  if (data.user_id === user.id) {
    return { ok: true, available: false, reason: "yours" };
  }
  return { ok: true, available: false, reason: "taken" };
}

export type SaveProfileInput = {
  enabled: boolean;
  handle?: string | null;
  showCompanies: boolean;
  displayName?: string | null;
};

export type SaveProfileResult =
  | { ok: true }
  | { ok: false; error: string };

export async function savePublicProfile(
  input: SaveProfileInput,
): Promise<SaveProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  // If enabling, a valid handle is mandatory; if disabling, we still preserve
  // whatever handle they had so re-enabling doesn't lose the URL.
  let handleToWrite: string | null | undefined = undefined;
  if (input.handle !== undefined) {
    if (input.handle === null || input.handle === "") {
      handleToWrite = null;
    } else {
      const handle = normalizeHandle(input.handle);
      if (!HANDLE_RE.test(handle)) {
        return { ok: false, error: "Handle must be 2–32 chars: a–z, 0–9, _, -" };
      }
      if (RESERVED.has(handle)) {
        return { ok: false, error: "That handle is reserved." };
      }
      // Verify ownership / availability via admin client so RLS doesn't block.
      const admin = createAdminClient();
      const { data: clash } = await admin
        .from("user_settings")
        .select("user_id")
        .eq("public_handle", handle)
        .maybeSingle();
      if (clash && clash.user_id !== user.id) {
        return { ok: false, error: "That handle is taken." };
      }
      handleToWrite = handle;
    }
  }

  if (input.enabled && handleToWrite === null) {
    return { ok: false, error: "Pick a handle before going public." };
  }

  const adminWrite = createAdminClient();
  const payload: Record<string, unknown> = {
    user_id: user.id,
    public_enabled: input.enabled,
    public_show_companies: input.showCompanies,
    updated_at: new Date().toISOString(),
  };
  if (handleToWrite !== undefined) payload.public_handle = handleToWrite;
  if (input.displayName !== undefined) {
    payload.public_display_name = input.displayName?.trim() || null;
  }

  const { error } = await adminWrite
    .from("user_settings")
    .upsert(payload as never, { onConflict: "user_id" });

  if (error) return { ok: false, error: error.message };

  if (handleToWrite) revalidatePath(`/u/${handleToWrite}`);
  return { ok: true };
}

export async function getOwnPublicProfileSettings(): Promise<{
  enabled: boolean;
  handle: string | null;
  showCompanies: boolean;
  displayName: string | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("user_settings")
    .select(
      "public_enabled, public_handle, public_show_companies, public_display_name",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    enabled: data?.public_enabled ?? false,
    handle: data?.public_handle ?? null,
    showCompanies: data?.public_show_companies ?? false,
    displayName: data?.public_display_name ?? null,
  };
}
