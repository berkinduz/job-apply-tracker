import { ApplicationStatus, WorkType } from "@/types";

/**
 * Status configuration — colors map to the JobTrack design system
 * (see globals.css for the underlying CSS variables).
 *
 * NOTE: `color` and `bgColor` keep the Tailwind class format that some
 * legacy components still consume, but UI redesigned with the new
 * JT primitives reads from STATUS_TOKENS in `@/components/jt/primitives`.
 */
export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bgColor: string }
> = {
  applied: {
    label: "Applied",
    color: "text-slate-700 dark:text-slate-300",
    bgColor: "bg-slate-100 dark:bg-slate-900",
  },
  test_case: {
    label: "Test Case",
    color: "text-violet-700 dark:text-violet-300",
    bgColor: "bg-violet-100 dark:bg-violet-950",
  },
  hr_interview: {
    label: "HR Interview",
    color: "text-cyan-700 dark:text-cyan-300",
    bgColor: "bg-cyan-100 dark:bg-cyan-950",
  },
  technical_interview: {
    label: "Technical Interview",
    color: "text-indigo-700 dark:text-indigo-300",
    bgColor: "bg-indigo-100 dark:bg-indigo-950",
  },
  management_interview: {
    label: "Management Interview",
    color: "text-fuchsia-700 dark:text-fuchsia-300",
    bgColor: "bg-fuchsia-100 dark:bg-fuchsia-950",
  },
  offer: {
    label: "Offer",
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-100 dark:bg-amber-950",
  },
  accepted: {
    label: "Accepted",
    color: "text-emerald-700 dark:text-emerald-300",
    bgColor: "bg-emerald-100 dark:bg-emerald-950",
  },
  rejected: {
    label: "Rejected",
    color: "text-rose-700 dark:text-rose-300",
    bgColor: "bg-rose-100 dark:bg-rose-950",
  },
};

// Status order for sorting
export const STATUS_ORDER: ApplicationStatus[] = [
  "applied",
  "test_case",
  "hr_interview",
  "technical_interview",
  "management_interview",
  "offer",
  "accepted",
  "rejected",
];

// Work type configuration
export const WORK_TYPE_CONFIG: Record<
  WorkType,
  { label: string; icon: string }
> = {
  remote: { label: "Remote", icon: "🏠" },
  hybrid: { label: "Hybrid", icon: "🔄" },
  onsite: { label: "On-site", icon: "🏢" },
};

// Default sources
export const DEFAULT_SOURCES = [
  "LinkedIn",
  "Indeed",
  "Glassdoor",
  "Kariyer.net",
  "Company Website",
  "Referral",
  "AngelList",
  "WeWorkRemotely",
  "Remote.co",
  "Other",
];

// Default industries
export const DEFAULT_INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "E-commerce",
  "Education",
  "Gaming",
  "Consulting",
  "Media & Entertainment",
  "Telecommunications",
  "Manufacturing",
  "Real Estate",
  "Travel & Hospitality",
  "Automotive",
  "Energy",
  "Food & Beverage",
  "Other",
];

// Local storage keys
export const STORAGE_KEYS = {
  APPLICATIONS: "job-apply-track-applications",
  SETTINGS: "job-apply-track-settings",
};
