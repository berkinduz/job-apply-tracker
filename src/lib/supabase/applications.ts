import { createClient } from "@/lib/supabase/client";
import { JobApplication, ApplicationFormData, ContactPerson } from "@/types";
import { Database } from "@/types/database";

type DbApplication = Database["public"]["Tables"]["applications"]["Row"];
type DbInsert = Database["public"]["Tables"]["applications"]["Insert"];

// Convert database row to JobApplication
export function dbToApplication(row: DbApplication): JobApplication {
  return {
    id: row.id,
    companyName: row.company_name,
    companyLocation: row.company_location,
    companyIndustry: row.company_industry,
    companySalaryRange: row.company_salary_range || undefined,
    position: row.position,
    skills: row.skills || undefined,
    applicationDate: row.application_date,
    coverLetter: row.cover_letter || undefined,
    salaryExpectation: row.salary_expectation || undefined,
    resumePath: row.resume_path || undefined,
    jobPostingUrl: row.job_posting_url || undefined,
    jobPostingContent: row.job_posting_content || undefined,
    source: row.source,
    workType: row.work_type,
    notes: row.notes || undefined,
    contacts: (row.contacts as unknown as ContactPerson[]) || [],
    status: row.status as JobApplication["status"],
    isPinned: row.is_pinned,
    followUpDate: row.follow_up_date || undefined,
    followUpSentAt: row.follow_up_sent_at || undefined,
    followUpCompletedAt: row.follow_up_completed_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert JobApplication to database insert format
export function applicationToDb(
  app: ApplicationFormData,
  userId: string
): DbInsert {
  return {
    user_id: userId,
    company_name: app.companyName,
    company_location: app.companyLocation,
    company_industry: app.companyIndustry,
    company_salary_range: app.companySalaryRange || null,
    position: app.position,
    skills: app.skills || null,
    application_date: app.applicationDate,
    cover_letter: app.coverLetter || null,
    salary_expectation: app.salaryExpectation || null,
    resume_path: app.resumePath || null,
    job_posting_url: app.jobPostingUrl || null,
    job_posting_content: app.jobPostingContent || null,
    source: app.source,
    work_type: app.workType,
    notes: app.notes || null,
    contacts:
      app.contacts as unknown as Database["public"]["Tables"]["applications"]["Insert"]["contacts"],
    status: app.status,
    is_pinned: false,
    follow_up_date: app.followUpDate || null,
  };
}

const supabase = createClient();

export const applicationService = {
  async getAll(): Promise<JobApplication[]> {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ((data || []) as DbApplication[]).map(dbToApplication);
  },

  async getById(id: string): Promise<JobApplication | null> {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return dbToApplication(data as DbApplication);
  },

  async create(
    data: ApplicationFormData,
    userId: string
  ): Promise<JobApplication> {
    const { data: newApp, error } = await supabase
      .from("applications")
      .insert(applicationToDb(data, userId) as never)
      .select()
      .single();

    if (error) throw error;
    return dbToApplication(newApp as DbApplication);
  },

  async update(
    id: string,
    data: Partial<ApplicationFormData>
  ): Promise<JobApplication> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.companyName !== undefined)
      updateData.company_name = data.companyName;
    if (data.companyLocation !== undefined)
      updateData.company_location = data.companyLocation;
    if (data.companyIndustry !== undefined)
      updateData.company_industry = data.companyIndustry;
    if (data.companySalaryRange !== undefined)
      updateData.company_salary_range = data.companySalaryRange || null;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.skills !== undefined) updateData.skills = data.skills || null;
    if (data.applicationDate !== undefined)
      updateData.application_date = data.applicationDate;
    if (data.coverLetter !== undefined)
      updateData.cover_letter = data.coverLetter || null;
    if (data.salaryExpectation !== undefined)
      updateData.salary_expectation = data.salaryExpectation || null;
    if (data.resumePath !== undefined)
      updateData.resume_path = data.resumePath || null;
    if (data.jobPostingUrl !== undefined)
      updateData.job_posting_url = data.jobPostingUrl || null;
    if (data.jobPostingContent !== undefined)
      updateData.job_posting_content = data.jobPostingContent || null;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.workType !== undefined) updateData.work_type = data.workType;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.contacts !== undefined) updateData.contacts = data.contacts;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.followUpDate !== undefined) {
      updateData.follow_up_date = data.followUpDate || null;
      // Re-arming a follow-up clears prior delivery + completion bookkeeping
      // so the cron picks it up again.
      updateData.follow_up_sent_at = null;
      updateData.follow_up_completed_at = null;
    }

    const { data: updated, error } = await supabase
      .from("applications")
      .update(updateData as never)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return dbToApplication(updated as DbApplication);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) throw error;
  },

  async togglePin(id: string, isPinned: boolean): Promise<void> {
    const { error } = await supabase
      .from("applications")
      .update({ is_pinned: !isPinned, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async setFollowUp(id: string, date: string): Promise<void> {
    const { error } = await supabase
      .from("applications")
      .update({
        follow_up_date: date,
        follow_up_sent_at: null,
        follow_up_completed_at: null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", id);
    if (error) throw error;
  },

  async clearFollowUp(id: string): Promise<void> {
    const { error } = await supabase
      .from("applications")
      .update({
        follow_up_date: null,
        follow_up_sent_at: null,
        follow_up_completed_at: null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", id);
    if (error) throw error;
  },

  async completeFollowUp(id: string): Promise<void> {
    const { error } = await supabase
      .from("applications")
      .update({
        follow_up_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", id);
    if (error) throw error;
  },
};
