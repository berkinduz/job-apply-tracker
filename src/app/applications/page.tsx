import type { Metadata } from "next";
import { JtApplicationsPage } from "@/components/jt/applications-page";

export const metadata: Metadata = {
  title: "Applications",
  description: "Your active pipeline at a glance — quick-add, kanban, follow-up reminders.",
};

export default function ApplicationsPage() {
  return <JtApplicationsPage />;
}
