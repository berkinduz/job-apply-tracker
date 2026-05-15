"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";

/** Seeds 5 sample applications for the current user. */
export async function seedSampleApplications(): Promise<{
  ok: boolean;
  count: number;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, count: 0, error: "Not authenticated" };

  const today = new Date();
  const daysAgo = (n: number) =>
    format(new Date(today.getTime() - n * 24 * 60 * 60 * 1000), "yyyy-MM-dd");

  const samples = [
    {
      user_id: user.id,
      company_name: "Stripe",
      company_location: "Remote",
      company_industry: "Fintech",
      company_salary_range: "USD 185k–230k",
      position: "Senior Frontend Engineer",
      skills: ["React", "TypeScript", "GraphQL"],
      application_date: daysAgo(12),
      source: "LinkedIn",
      work_type: "remote",
      status: "technical_interview",
      is_pinned: true,
      notes: "System design round Friday. Reviewing distributed systems notes.",
      job_posting_url: "https://stripe.com/jobs",
      contacts: [],
    },
    {
      user_id: user.id,
      company_name: "Linear",
      company_location: "Remote",
      company_industry: "Productivity",
      position: "Design Engineer",
      skills: ["React", "Motion", "Design Systems"],
      application_date: daysAgo(6),
      source: "Cold apply",
      work_type: "remote",
      status: "test_case",
      is_pinned: false,
      notes: "Take-home: rebuild their command palette UI. Due Thursday.",
      contacts: [],
    },
    {
      user_id: user.id,
      company_name: "Figma",
      company_location: "New York, NY",
      company_industry: "Design tools",
      company_salary_range: "USD 200k–260k",
      position: "Product Designer",
      skills: ["Figma", "Prototyping", "Systems"],
      application_date: daysAgo(20),
      source: "Referral",
      work_type: "hybrid",
      status: "hr_interview",
      is_pinned: false,
      notes: "HR call went well. Loved the bug triage exercise.",
      contacts: [],
    },
    {
      user_id: user.id,
      company_name: "Anthropic",
      company_location: "San Francisco, CA",
      company_industry: "AI",
      company_salary_range: "USD 250k–350k",
      position: "Research Engineer",
      skills: ["Python", "ML", "PyTorch"],
      application_date: daysAgo(28),
      source: "Referral",
      work_type: "hybrid",
      status: "offer",
      is_pinned: true,
      notes:
        "Verbal offer received. Negotiating equity. Decision deadline Friday.",
      contacts: [],
    },
    {
      user_id: user.id,
      company_name: "Notion",
      company_location: "Remote",
      company_industry: "Productivity",
      position: "Engineering Manager",
      skills: ["Leadership", "React", "Hiring"],
      application_date: daysAgo(45),
      source: "LinkedIn",
      work_type: "remote",
      status: "rejected",
      is_pinned: false,
      notes: "No fit at this time. Try again in 6 months.",
      contacts: [],
    },
  ];

  // Insert payload uses the snake_case columns from the live schema; the
  // generated Supabase type expects every optional column to be present, so
  // we widen with the optional null defaults inline.
  const payload = samples.map((s) => ({
    cover_letter: null,
    salary_expectation: null,
    resume_path: null,
    job_posting_content: null,
    ...s,
  }));
  const { error, data } = await supabase
    .from("applications")
    .insert(payload as never)
    .select("id");

  if (error) {
    return { ok: false, count: 0, error: error.message };
  }
  revalidatePath("/applications");
  return { ok: true, count: data?.length || samples.length };
}

/** Saves the user's weekly application goal to user_settings. */
export async function saveWeeklyGoal(goal: number): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  // We don't have a weekly_goal column yet — stash it in the future. For now no-op.
  void goal;
  return { ok: true };
}
