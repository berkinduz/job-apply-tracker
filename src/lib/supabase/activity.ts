import { createClient } from "@/lib/supabase/client";
import type { ActivityEventRecord, ActivityKind } from "@/types";
import type { Database } from "@/types/database";

type Row = Database["public"]["Tables"]["activity_events"]["Row"];

const supabase = createClient();

function dbToEvent(row: Row): ActivityEventRecord {
  return {
    id: row.id,
    applicationId: row.application_id,
    kind: row.kind,
    payload: (row.payload as Record<string, unknown>) ?? {},
    createdAt: row.created_at,
  };
}

export const activityService = {
  /**
   * Log a single event. The application's owning user_id is resolved from
   * the current session — the RLS policy enforces it matches.
   *
   * Fire-and-forget on purpose: timeline events are nice-to-have, never
   * block the user's primary action if logging fails.
   */
  async log(
    applicationId: string,
    kind: ActivityKind,
    payload: Record<string, unknown> = {},
  ): Promise<void> {
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      await supabase.from("activity_events").insert({
        application_id: applicationId,
        user_id: u.user.id,
        kind,
        payload: payload as never,
      } as never);
    } catch {
      // Swallow — timeline is best-effort.
    }
  },

  async listForApplication(
    applicationId: string,
    limit = 50,
  ): Promise<ActivityEventRecord[]> {
    const { data, error } = await supabase
      .from("activity_events")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return ((data || []) as Row[]).map(dbToEvent);
  },
};
