// Application Status Types
export type ApplicationStatus =
  | "applied"
  | "test_case"
  | "hr_interview"
  | "technical_interview"
  | "management_interview"
  | "offer"
  | "accepted"
  | "rejected";

// Work Type
export type WorkType = "remote" | "hybrid" | "onsite";

// Contact Person
export interface ContactPerson {
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  notes?: string;
}

// Job Application
export interface JobApplication {
  id: string;
  companyName: string;
  companyLocation: string;
  companyIndustry: string;
  companySalaryRange?: string;
  position: string;
  skills?: string[]; // Required skills like React, TypeScript
  applicationDate: string; // ISO date string
  coverLetter?: string;
  salaryExpectation?: string;
  resumePath?: string;
  jobPostingUrl?: string;
  jobPostingContent?: string;
  source: string;
  workType: WorkType;
  notes?: string;
  contacts: ContactPerson[];
  status: ApplicationStatus;
  isPinned: boolean;
  followUpDate?: string;
  followUpSentAt?: string;
  followUpCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Form data for creating/editing application
export interface ApplicationFormData {
  companyName: string;
  companyLocation: string;
  companyIndustry: string;
  companySalaryRange?: string;
  position: string;
  skills?: string[];
  applicationDate: string;
  coverLetter?: string;
  salaryExpectation?: string;
  resumePath?: string;
  jobPostingUrl?: string;
  jobPostingContent?: string;
  source: string;
  workType: WorkType;
  notes?: string;
  contacts: ContactPerson[];
  status: ApplicationStatus;
  followUpDate?: string;
}

// Filter options
export interface FilterOptions {
  status?: ApplicationStatus[];
  source?: string[];
  workType?: WorkType[];
  industry?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
  isPinned?: boolean;
  hideRejected?: boolean;
}

// Sort options
export type SortField =
  | "applicationDate"
  | "companyName"
  | "status"
  | "createdAt"
  | "updatedAt";
export type SortOrder = "asc" | "desc";

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

// Settings
export interface AppSettings {
  theme: "light" | "dark" | "system";
  language: "en" | "tr";
  customSources: string[];
  customIndustries: string[];
  followUpEmails: boolean;
}
