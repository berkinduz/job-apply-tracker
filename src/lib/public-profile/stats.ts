import { createAdminClient } from "@/lib/supabase/admin";
import type { ApplicationStatus } from "@/types";

export type FunnelStep = {
  key: ApplicationStatus | "applied";
  label: string;
  count: number;
  ratePercent: number;
};

export type CompanyHighlight = {
  companyName: string;
  position: string;
  status: ApplicationStatus;
  applicationDate: string;
};

export type PublicProfile = {
  handle: string;
  displayName: string;
  showCompanies: boolean;
  totalApplications: number;
  responseRatePercent: number; // applied → anything-past-applied
  offerCount: number;
  acceptedCount: number;
  rejectedCount: number;
  funnel: FunnelStep[];
  topSources: { source: string; count: number }[];
  highlights: CompanyHighlight[]; // only populated when showCompanies = true
  weeklyApplied: number; // last 7 days
  streakWeeks: number; // consecutive weeks with at least 1 application
  joinedAt: string;
  lastActiveAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  test_case: "Test",
  hr_interview: "HR Interview",
  technical_interview: "Technical",
  management_interview: "Management",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
};

/**
 * Looks up a public profile by handle and aggregates stats. Returns null if
 * the handle doesn't exist or the user has disabled public sharing.
 *
 * Uses the service-role admin client to bypass RLS — we expose only the
 * derived stats, never raw row IDs, so per-row policies aren't needed.
 */
export async function getPublicProfile(
  rawHandle: string,
): Promise<PublicProfile | null> {
  const handle = rawHandle.trim().toLowerCase();
  if (!handle) return null;

  const supabase = createAdminClient();

  const { data: settings } = await supabase
    .from("user_settings")
    .select(
      "user_id, public_handle, public_enabled, public_show_companies, public_display_name, created_at",
    )
    .eq("public_handle", handle)
    .eq("public_enabled", true)
    .maybeSingle();

  if (!settings) return null;

  const { data: apps } = await supabase
    .from("applications")
    .select(
      "company_name, position, status, source, application_date, created_at",
    )
    .eq("user_id", settings.user_id);

  const rows = apps || [];
  const total = rows.length;

  // Status counts.
  const byStatus = new Map<string, number>();
  for (const r of rows) {
    byStatus.set(r.status, (byStatus.get(r.status) || 0) + 1);
  }

  // Funnel — applied is the base; each downstream step counts apps that
  // reached at-or-past that step. Since status is the final state, we count
  // anything ≥ that ordinal as "reached".
  const ordinal: ApplicationStatus[] = [
    "applied",
    "test_case",
    "hr_interview",
    "technical_interview",
    "management_interview",
    "offer",
    "accepted",
  ];
  const reachedAtOrBeyond = (target: ApplicationStatus) => {
    const idx = ordinal.indexOf(target);
    if (idx === -1) return 0;
    return rows.filter((r) => {
      const i = ordinal.indexOf(r.status as ApplicationStatus);
      return i >= idx;
    }).length;
  };

  const funnelSteps: ApplicationStatus[] = [
    "applied",
    "test_case",
    "hr_interview",
    "technical_interview",
    "management_interview",
    "offer",
  ];
  const baseApplied = total; // applied is everyone (terminal status doesn't matter — they all started here)
  const funnel: FunnelStep[] = funnelSteps.map((step) => {
    const count = reachedAtOrBeyond(step);
    const rate = baseApplied > 0 ? Math.round((count / baseApplied) * 100) : 0;
    return {
      key: step,
      label: STATUS_LABELS[step],
      count,
      ratePercent: rate,
    };
  });

  const offerCount = byStatus.get("offer") || 0;
  const acceptedCount = byStatus.get("accepted") || 0;
  const rejectedCount = byStatus.get("rejected") || 0;
  const responseCount = reachedAtOrBeyond("test_case");
  const responseRate =
    total > 0 ? Math.round((responseCount / total) * 100) : 0;

  // Sources — top 5, ignore empties.
  const sourceCounts = new Map<string, number>();
  for (const r of rows) {
    if (!r.source) continue;
    sourceCounts.set(r.source, (sourceCounts.get(r.source) || 0) + 1);
  }
  const topSources = Array.from(sourceCounts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent week activity + streak.
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weeklyApplied = rows.filter(
    (r) => now - new Date(r.application_date).getTime() <= weekMs,
  ).length;

  const weeksWithActivity = new Set<string>();
  for (const r of rows) {
    const d = new Date(r.application_date);
    weeksWithActivity.add(`${d.getUTCFullYear()}-${weekKey(d)}`);
  }
  let streak = 0;
  let cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < 52; i++) {
    const key = `${cursor.getUTCFullYear()}-${weekKey(cursor)}`;
    if (weeksWithActivity.has(key)) {
      streak++;
      cursor = new Date(cursor.getTime() - weekMs);
    } else {
      break;
    }
  }

  // Highlights — show notable wins: offers, accepted; fall back to most recent.
  let highlights: CompanyHighlight[] = [];
  if (settings.public_show_companies) {
    const ranked = [...rows].sort((a, b) => {
      const weight = (s: string) =>
        s === "accepted" ? 3 : s === "offer" ? 2 : s === "management_interview" ? 1 : 0;
      const wd = weight(b.status) - weight(a.status);
      if (wd !== 0) return wd;
      return (
        new Date(b.application_date).getTime() -
        new Date(a.application_date).getTime()
      );
    });
    highlights = ranked.slice(0, 8).map((r) => ({
      companyName: r.company_name,
      position: r.position,
      status: r.status as ApplicationStatus,
      applicationDate: r.application_date,
    }));
  }

  const lastActiveAt = rows
    .map((r) => r.application_date)
    .sort()
    .pop();

  return {
    handle: settings.public_handle as string,
    displayName: settings.public_display_name || handle,
    showCompanies: settings.public_show_companies,
    totalApplications: total,
    responseRatePercent: responseRate,
    offerCount,
    acceptedCount,
    rejectedCount,
    funnel,
    topSources,
    highlights,
    weeklyApplied,
    streakWeeks: streak,
    joinedAt: settings.created_at,
    lastActiveAt: lastActiveAt || settings.created_at,
  };
}

function weekKey(d: Date): string {
  // ISO-ish week key: year + week-of-year, padded.
  const target = new Date(d.getTime());
  target.setUTCDate(target.getUTCDate() + 3 - ((target.getUTCDay() + 6) % 7));
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff =
    (target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7);
  const week = 1 + Math.floor(diff / 7);
  return String(week).padStart(2, "0");
}
