"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type DangerResult = { ok: true } | { ok: false; error: string };

/**
 * Hard-deletes every application + resume + activity event + user_settings
 * row for the current user. The auth user itself is preserved so they can
 * sign back in. Activity events cascade from applications already; we wipe
 * settings separately.
 */
export async function clearAllData(): Promise<DangerResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const admin = createAdminClient();

  // 1) Best-effort: remove resume files from storage. We list under the
  //    user's folder and bulk-delete; missing folder is fine.
  try {
    const { data: list } = await admin.storage
      .from("resumes")
      .list(user.id, { limit: 1000 });
    if (list && list.length > 0) {
      const paths = list.map((f) => `${user.id}/${f.name}`);
      await admin.storage.from("resumes").remove(paths);
    }
  } catch {
    // Storage hiccups shouldn't block the row delete.
  }

  // 2) Applications → cascades to activity_events via FK.
  const { error: appsErr } = await admin
    .from("applications")
    .delete()
    .eq("user_id", user.id);
  if (appsErr) return { ok: false, error: appsErr.message };

  // 3) Reset user_settings to defaults (preserve the row so re-onboarding
  //    doesn't break — just zero out user content).
  const { error: settingsErr } = await admin
    .from("user_settings")
    .update({
      custom_sources: [],
      custom_industries: [],
      hide_rejected: false,
      public_handle: null,
      public_enabled: false,
      public_show_companies: false,
      public_display_name: null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("user_id", user.id);
  if (settingsErr) return { ok: false, error: settingsErr.message };

  return { ok: true };
}

/**
 * Permanently deletes the user's auth.users row. FK cascades wipe
 * applications, activity_events, and user_settings automatically. Also
 * removes uploaded resumes from storage. Caller should sign out after.
 */
export async function deleteAccount(): Promise<DangerResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const admin = createAdminClient();

  // Wipe storage first — auth-user delete won't touch storage objects.
  try {
    const { data: list } = await admin.storage
      .from("resumes")
      .list(user.id, { limit: 1000 });
    if (list && list.length > 0) {
      const paths = list.map((f) => `${user.id}/${f.name}`);
      await admin.storage.from("resumes").remove(paths);
    }
  } catch {
    // Move on — auth delete is the real cleanup.
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { ok: false, error: error.message };

  // Sign out the cookie session so the next request doesn't see a stale user.
  await supabase.auth.signOut();
  return { ok: true };
}
