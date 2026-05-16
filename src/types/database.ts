export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          company_location: string;
          company_industry: string;
          company_salary_range: string | null;
          position: string;
          skills: string[] | null;
          application_date: string;
          cover_letter: string | null;
          salary_expectation: string | null;
          resume_path: string | null;
          job_posting_url: string | null;
          job_posting_content: string | null;
          source: string;
          work_type: "remote" | "hybrid" | "onsite";
          notes: string | null;
          contacts: Json;
          status: string;
          is_pinned: boolean;
          follow_up_date: string | null;
          follow_up_sent_at: string | null;
          follow_up_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["applications"]["Row"],
          | "id"
          | "created_at"
          | "updated_at"
          | "is_pinned"
          | "follow_up_date"
          | "follow_up_sent_at"
          | "follow_up_completed_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          is_pinned?: boolean;
          follow_up_date?: string | null;
          follow_up_sent_at?: string | null;
          follow_up_completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Row"]>;
        Relationships: [];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          hide_rejected: boolean;
          custom_sources: string[];
          custom_industries: string[];
          follow_up_emails: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          hide_rejected?: boolean;
          custom_sources?: string[];
          custom_industries?: string[];
          follow_up_emails?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          hide_rejected?: boolean;
          custom_sources?: string[];
          custom_industries?: string[];
          follow_up_emails?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
