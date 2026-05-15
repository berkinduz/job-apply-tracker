import type { Metadata } from "next";
import { getAnalyticsData } from "@/lib/analytics-service";
import { JtAnalytics } from "@/components/jt/analytics";

export const metadata: Metadata = {
  title: "Analytics",
  description: "See where your applications are landing — funnel, response rate, and source performance.",
};

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  return <JtAnalytics data={data} />;
}
