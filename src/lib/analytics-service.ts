import { createClient } from "@/lib/supabase/server";

export type FunnelStage = {
  key: string;
  label: string;
  count: number;
  /** Percentage relative to total applications. */
  pct: number;
  color: string;
};

export type SourcePerf = {
  source: string;
  total: number;
  responses: number;
  rate: number; // percent
};

export type WeeklyPoint = { name: string; applications: number; iso: string };
export type Slice = { name: string; value: number; color: string };

export type Insight = { kind: "info" | "warn" | "good"; text: string };

export type AnalyticsData = {
  totalApplications: number;
  activeApplications: number;
  totalInterviews: number;
  totalOffers: number;
  responseRate: number; // percent
  avgResponseDays: number | null;
  funnel: FunnelStage[];
  sourcePerf: SourcePerf[];
  statusDistribution: Slice[];
  workTypeDistribution: Slice[];
  weeklyActivity: WeeklyPoint[];
  insights: Insight[];
};

const PIPELINE_KEYS = [
  "applied",
  "test_case",
  "hr_interview",
  "technical_interview",
  "management_interview",
  "offer",
  "accepted",
];

const INTERVIEW_STAGES = new Set([
  "hr_interview",
  "technical_interview",
  "management_interview",
  "offer",
  "accepted",
]);

const PIPELINE_COLORS: Record<string, string> = {
  applied: "#94A2B8",
  test_case: "#9B7AE5",
  hr_interview: "#5AC4D2",
  technical_interview: "#5158D6",
  management_interview: "#B860D9",
  offer: "#F5B842",
  accepted: "#43C18B",
  rejected: "#E07A6B",
};

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  test_case: "Test case",
  hr_interview: "HR interview",
  technical_interview: "Technical",
  management_interview: "Management",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
};

const WORK_TYPE_COLORS: Record<string, string> = {
  Remote: "#5A5DE8",
  Hybrid: "#B860D9",
  Onsite: "#94A2B8",
};

type AppRow = {
  id: string;
  status: string;
  work_type: string;
  source: string | null;
  application_date: string | null;
  created_at: string;
  updated_at: string;
};

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, status, work_type, source, application_date, created_at, updated_at",
    );

  if (error || !data) {
    return EMPTY;
  }

  const apps = data as unknown as AppRow[];
  const total = apps.length;
  if (total === 0) return EMPTY;

  const active = apps.filter(
    (a) => a.status !== "accepted" && a.status !== "rejected",
  ).length;
  const interviews = apps.filter((a) => INTERVIEW_STAGES.has(a.status)).length;
  const offers = apps.filter(
    (a) => a.status === "offer" || a.status === "accepted",
  ).length;

  // Response rate = (anything beyond pure "applied" / "test_case") / total
  const positiveResponses = apps.filter((a) =>
    INTERVIEW_STAGES.has(a.status),
  ).length;
  const responseRate =
    total > 0 ? Math.round((positiveResponses / total) * 100) : 0;

  // Avg response time: for apps with status beyond "applied", measure
  // application_date → updated_at as a rough proxy.
  const responseTimes: number[] = [];
  for (const a of apps) {
    if (
      a.status !== "applied" &&
      a.status !== "rejected" &&
      a.application_date &&
      a.updated_at
    ) {
      const start = new Date(a.application_date).getTime();
      const end = new Date(a.updated_at).getTime();
      if (end > start) {
        const days = (end - start) / (1000 * 60 * 60 * 24);
        if (days < 180) responseTimes.push(days);
      }
    }
  }
  const avgResponseDays =
    responseTimes.length > 0
      ? Math.round(
          responseTimes.reduce((s, d) => s + d, 0) / responseTimes.length,
        )
      : null;

  // Funnel: each pipeline stage count is "apps that ever reached at-or-beyond this stage"
  // Approximation since we don't track stage history yet: use stage-or-later.
  const stageOrLater = (key: string) => {
    const idx = PIPELINE_KEYS.indexOf(key);
    return apps.filter((a) => {
      const i = PIPELINE_KEYS.indexOf(a.status);
      return i >= idx; // also counts accepted as having passed offer
    }).length;
  };

  const funnel: FunnelStage[] = PIPELINE_KEYS.map((k) => {
    const count = stageOrLater(k);
    return {
      key: k,
      label: STATUS_LABELS[k],
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
      color: PIPELINE_COLORS[k],
    };
  });

  // Source performance: per source, total / response rate
  const bySource = new Map<string, { total: number; resp: number }>();
  for (const a of apps) {
    const src = a.source || "Unknown";
    const entry = bySource.get(src) || { total: 0, resp: 0 };
    entry.total++;
    if (INTERVIEW_STAGES.has(a.status)) entry.resp++;
    bySource.set(src, entry);
  }
  const sourcePerf: SourcePerf[] = Array.from(bySource.entries())
    .map(([source, v]) => ({
      source,
      total: v.total,
      responses: v.resp,
      rate: v.total > 0 ? Math.round((v.resp / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.rate - a.rate || b.total - a.total)
    .slice(0, 8);

  // Status distribution (donut)
  const statusCounts = new Map<string, number>();
  for (const a of apps) {
    statusCounts.set(a.status, (statusCounts.get(a.status) || 0) + 1);
  }
  const statusDistribution: Slice[] = Array.from(statusCounts.entries())
    .map(([k, value]) => ({
      name: STATUS_LABELS[k] || k,
      value,
      color: PIPELINE_COLORS[k] || "#94A2B8",
    }))
    .sort((a, b) => b.value - a.value);

  // Work type distribution
  const wtCounts = new Map<string, number>();
  for (const a of apps) {
    if (!a.work_type) continue;
    const name = a.work_type.charAt(0).toUpperCase() + a.work_type.slice(1);
    wtCounts.set(name, (wtCounts.get(name) || 0) + 1);
  }
  const workTypeDistribution: Slice[] = Array.from(wtCounts.entries()).map(
    ([name, value]) => ({
      name,
      value,
      color: WORK_TYPE_COLORS[name] || "#94A2B8",
    }),
  );

  // Weekly activity — last 8 weeks
  const weeklyActivity: WeeklyPoint[] = [];
  const now = new Date();
  const weeklyMap = new Map<string, number>();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i * 7);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d);
    mon.setDate(diff);
    const iso = mon.toISOString().slice(0, 10);
    const label = `${mon.getDate()}/${mon.getMonth() + 1}`;
    weeklyMap.set(iso, 0);
    weeklyActivity.push({ name: label, applications: 0, iso });
  }
  for (const a of apps) {
    const dateStr = a.application_date || a.created_at;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) continue;
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d);
    mon.setDate(diff);
    mon.setHours(0, 0, 0, 0);
    const iso = mon.toISOString().slice(0, 10);
    if (weeklyMap.has(iso)) {
      weeklyMap.set(iso, (weeklyMap.get(iso) || 0) + 1);
    }
  }
  weeklyActivity.forEach((w) => {
    w.applications = weeklyMap.get(w.iso) || 0;
  });

  // Insights
  const insights: Insight[] = [];
  if (responseRate >= 30) {
    insights.push({
      kind: "good",
      text: `Your response rate is ${responseRate}% — that's strong. Whatever you're doing, keep doing it.`,
    });
  } else if (responseRate >= 15) {
    insights.push({
      kind: "info",
      text: `Response rate sits at ${responseRate}%. Consider doubling down on the sources that are converting best.`,
    });
  } else if (total >= 5) {
    insights.push({
      kind: "warn",
      text: `Your response rate is ${responseRate}%. Try referrals and tighten your resume against the top-converting roles.`,
    });
  }
  if (sourcePerf.length > 0 && sourcePerf[0].total >= 2) {
    insights.push({
      kind: "good",
      text: `${sourcePerf[0].source} converts at ${sourcePerf[0].rate}% across ${sourcePerf[0].total} apps — your strongest channel right now.`,
    });
  }
  const staleCount = apps.filter((a) => {
    if (a.status === "rejected" || a.status === "accepted") return false;
    const ms = Date.now() - new Date(a.updated_at).getTime();
    return ms > 14 * 24 * 60 * 60 * 1000;
  }).length;
  if (staleCount > 0) {
    insights.push({
      kind: "warn",
      text: `${staleCount} application${staleCount === 1 ? "" : "s"} ${staleCount === 1 ? "is" : "are"} stale — no movement in 14+ days. Want to follow up?`,
    });
  }
  if (avgResponseDays !== null) {
    insights.push({
      kind: "info",
      text: `Average response time is ${avgResponseDays} day${avgResponseDays === 1 ? "" : "s"}. Most companies move within 7 days when they're interested.`,
    });
  }

  return {
    totalApplications: total,
    activeApplications: active,
    totalInterviews: interviews,
    totalOffers: offers,
    responseRate,
    avgResponseDays,
    funnel,
    sourcePerf,
    statusDistribution,
    workTypeDistribution,
    weeklyActivity,
    insights,
  };
}

const EMPTY: AnalyticsData = {
  totalApplications: 0,
  activeApplications: 0,
  totalInterviews: 0,
  totalOffers: 0,
  responseRate: 0,
  avgResponseDays: null,
  funnel: [],
  sourcePerf: [],
  statusDistribution: [],
  workTypeDistribution: [],
  weeklyActivity: [],
  insights: [],
};
