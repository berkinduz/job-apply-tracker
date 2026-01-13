import { createClient } from "@/lib/supabase/server";

export type AnalyticsData = {
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
  responseRate: number;
  statusDistribution: { name: string; value: number; color: string }[];
  weeklyActivity: { name: string; applications: number }[];
  workTypeDistribution: { name: string; value: number; color: string }[];
};

const COLORS = {
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444",
  purple: "#a855f7",
  orange: "#f97316",
  yellow: "#eab308",
  gray: "#6b7280",
  teal: "#14b8a6",
};

const STATUS_COLORS: Record<string, string> = {
  Applied: COLORS.blue,
  "Test Case": COLORS.purple,
  "HR Interview": COLORS.orange,
  "Technical Interview": COLORS.yellow,
  "Management Interview": COLORS.teal,
  Offer: COLORS.green,
  Rejected: COLORS.red,
  Accepted: COLORS.green,
  Withdrawn: COLORS.gray,
};

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = await createClient();

  // Fetch raw data from Supabase - explicitly typing the response would be ideal,
  // but for now we know the shape matches the DB schema.
  const { data: applications, error } = await supabase
    .from("applications")
    .select("id, status, work_type, application_date, created_at");

  if (error || !applications) {
    console.error("Error fetching analytics data:", error);
    return {
      totalApplications: 0,
      totalInterviews: 0,
      totalOffers: 0,
      responseRate: 0,
      statusDistribution: [],
      weeklyActivity: [],
      workTypeDistribution: [],
    };
  }

  // 1. Summary Stats
  const totalApplications = applications.length;

  // Normalize stats to match what we display in UI usually but keep it flexible
  const interviewStatuses = [
    "HR Interview",
    "Technical Interview",
    "Management Interview",
    "hr_interview",
    "technical_interview",
    "management_interview",
  ];
  // Cast to any because TS doesn't know the exact string literal union from DB without full types
  const totalInterviews = applications.filter((app: any) =>
    interviewStatuses.includes(app.status)
  ).length;

  const offerStatuses = ["Offer", "Accepted", "offer", "accepted"];
  const totalOffers = applications.filter((app: any) =>
    offerStatuses.includes(app.status)
  ).length;

  // Calculate Response Rate (Interviews + Offers)
  const positiveResponseConfig = [...interviewStatuses, ...offerStatuses];
  const totalResponses = applications.filter((app: any) =>
    positiveResponseConfig.includes(app.status)
  ).length;

  const responseRate =
    totalApplications > 0
      ? Math.round((totalResponses / totalApplications) * 100)
      : 0;

  // 2. Status Distribution
  const statusCounts = applications.reduce((acc: any, app: any) => {
    // Format status label to be Title Case for display if it's snake_case
    const statusLabel = app.status.includes("_")
      ? app.status
          .split("_")
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : app.status;

    acc[statusLabel] = (acc[statusLabel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusDistribution = Object.entries(statusCounts)
    .map(([status, count]) => ({
      name: status,
      value: count as number,
      color: STATUS_COLORS[status] || COLORS.gray,
    }))
    .sort((a, b) => b.value - a.value);

  // 3. Weekly Activity (Last 12 Weeks)
  const weeklyMap = new Map<string, number>();
  const now = new Date();

  // Initialize last 12 weeks with 0
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i * 7);
    // Get start of week (Monday)
    const day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const weekLabel = `${monday.getDate()}/${monday.getMonth() + 1}`;
    weeklyMap.set(weekLabel, 0);
  }

  applications.forEach((app: any) => {
    const dateStr = app.application_date || app.created_at;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      // Find closest Monday
      const day = date.getDay(),
        diff = date.getDate() - day + (day == 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      const weekLabel = `${monday.getDate()}/${monday.getMonth() + 1}`;

      if (weeklyMap.has(weekLabel)) {
        weeklyMap.set(weekLabel, weeklyMap.get(weekLabel)! + 1);
      }
    }
  });

  const weeklyActivity = Array.from(weeklyMap.entries()).map(
    ([name, applications]) => ({
      name,
      applications,
    })
  );

  // 4. Work Type Distribution
  const workTypeCounts = applications.reduce((acc: any, app: any) => {
    if (!app.work_type) return acc;
    const type = app.work_type.charAt(0).toUpperCase() + app.work_type.slice(1);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const workTypeColors: Record<string, string> = {
    Remote: COLORS.blue,
    Hypbrid: COLORS.purple, // Typo handle?
    Hybrid: COLORS.purple,
    Onsite: COLORS.orange,
  };

  const workTypeDistribution = Object.entries(workTypeCounts).map(
    ([type, count]) => ({
      name: type,
      value: count as number,
      color: workTypeColors[type] || COLORS.gray,
    })
  );

  return {
    totalApplications,
    totalInterviews,
    totalOffers,
    responseRate,
    statusDistribution,
    weeklyActivity,
    workTypeDistribution,
  };
}
