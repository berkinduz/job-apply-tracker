import Papa from "papaparse";
import type {
  ApplicationFormData,
  ApplicationStatus,
  WorkType,
} from "@/types";

/**
 * Parse a CSV string into rows of strings. Header row is required; subsequent
 * rows are returned with column values keyed by the original header text.
 */
export function parseCsv(input: string): { headers: string[]; rows: Record<string, string>[] } {
  const result = Papa.parse<Record<string, string>>(input, {
    header: true,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
    transformHeader: (h) => h.trim(),
  });
  return {
    headers: result.meta.fields || [],
    rows: result.data.filter((r) => Object.values(r).some((v) => v?.trim())),
  };
}

/* ---------- header auto-detection ---------- */

const FIELD_SYNONYMS: Record<keyof ColumnMapping, string[]> = {
  companyName: [
    "company",
    "company name",
    "companyname",
    "şirket",
    "sirket",
    "employer",
    "organization",
    "org",
  ],
  position: [
    "position",
    "role",
    "title",
    "job title",
    "job",
    "pozisyon",
    "rol",
  ],
  status: ["status", "stage", "phase", "durum"],
  applicationDate: [
    "date",
    "application date",
    "applied",
    "applied on",
    "applied at",
    "applieddate",
    "başvuru tarihi",
    "tarih",
  ],
  companyLocation: ["location", "city", "where", "lokasyon", "şehir", "sehir"],
  companyIndustry: ["industry", "sector", "sektör", "sektor"],
  source: ["source", "via", "channel", "kaynak"],
  workType: [
    "work type",
    "worktype",
    "remote",
    "type",
    "mode",
    "çalışma tipi",
    "calisma tipi",
  ],
  jobPostingUrl: ["url", "link", "job url", "posting", "ilan linki"],
  notes: ["notes", "note", "comments", "comment", "not", "notlar"],
  salaryExpectation: [
    "salary",
    "comp",
    "compensation",
    "pay",
    "maaş",
    "maas",
  ],
  skills: ["skills", "tags", "keywords", "yetenekler"],
};

export type ColumnMapping = {
  companyName?: string;
  position?: string;
  status?: string;
  applicationDate?: string;
  companyLocation?: string;
  companyIndustry?: string;
  source?: string;
  workType?: string;
  jobPostingUrl?: string;
  notes?: string;
  salaryExpectation?: string;
  skills?: string;
};

/** Best-effort guess of which CSV column maps to which JobApplication field. */
export function detectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const normalized = headers.map((h) => ({
    raw: h,
    key: h.toLowerCase().replace(/[_\-]/g, " ").trim(),
  }));
  for (const [field, synonyms] of Object.entries(FIELD_SYNONYMS) as [
    keyof ColumnMapping,
    string[],
  ][]) {
    const match = normalized.find((n) =>
      synonyms.some((s) => n.key === s || n.key.includes(s)),
    );
    if (match) mapping[field] = match.raw;
  }
  return mapping;
}

/* ---------- row → ApplicationFormData ---------- */

const STATUS_ALIASES: Record<string, ApplicationStatus> = {
  applied: "applied",
  application: "applied",
  submitted: "applied",
  "test case": "test_case",
  test: "test_case",
  assessment: "test_case",
  "code test": "test_case",
  "hr interview": "hr_interview",
  hr: "hr_interview",
  recruiter: "hr_interview",
  "phone screen": "hr_interview",
  screen: "hr_interview",
  technical: "technical_interview",
  "technical interview": "technical_interview",
  tech: "technical_interview",
  onsite: "technical_interview",
  loop: "technical_interview",
  management: "management_interview",
  "management interview": "management_interview",
  final: "management_interview",
  "hiring manager": "management_interview",
  offer: "offer",
  accepted: "accepted",
  hired: "accepted",
  signed: "accepted",
  rejected: "rejected",
  reject: "rejected",
  declined: "rejected",
  passed: "rejected",
  ghosted: "rejected",
  withdrew: "rejected",
};

const WORK_TYPE_ALIASES: Record<string, WorkType> = {
  remote: "remote",
  "fully remote": "remote",
  wfh: "remote",
  hybrid: "hybrid",
  flexible: "hybrid",
  onsite: "onsite",
  "on-site": "onsite",
  "in-office": "onsite",
  inoffice: "onsite",
  office: "onsite",
};

export type RowResult =
  | { ok: true; data: ApplicationFormData }
  | { ok: false; row: number; errors: string[] };

export function rowToApplication(
  row: Record<string, string>,
  mapping: ColumnMapping,
  index: number,
): RowResult {
  const errors: string[] = [];
  const get = (key: keyof ColumnMapping) =>
    mapping[key] ? (row[mapping[key]!] || "").trim() : "";

  const companyName = get("companyName");
  const position = get("position");
  if (!companyName) errors.push("Missing company name");
  if (!position) errors.push("Missing role / position");

  const status = parseStatus(get("status"));
  const workType = parseWorkType(get("workType"));
  const applicationDate = parseDate(get("applicationDate"));
  const skills = parseList(get("skills"));

  if (errors.length > 0) return { ok: false, row: index + 2, errors };

  return {
    ok: true,
    data: {
      companyName,
      position,
      companyLocation: get("companyLocation") || "",
      companyIndustry: get("companyIndustry") || "",
      source: get("source") || "Other",
      jobPostingUrl: get("jobPostingUrl") || undefined,
      notes: get("notes") || undefined,
      salaryExpectation: get("salaryExpectation") || undefined,
      skills: skills.length ? skills : undefined,
      status,
      workType,
      applicationDate,
      contacts: [],
    },
  };
}

function parseStatus(raw: string): ApplicationStatus {
  if (!raw) return "applied";
  const key = raw.toLowerCase().replace(/[_\-]+/g, " ").trim();
  return STATUS_ALIASES[key] || "applied";
}

function parseWorkType(raw: string): WorkType {
  if (!raw) return "remote";
  const key = raw.toLowerCase().replace(/[_\-]+/g, " ").trim();
  return WORK_TYPE_ALIASES[key] || "remote";
}

function parseDate(raw: string): string {
  if (!raw) return new Date().toISOString().slice(0, 10);
  // Try native Date parse first — handles ISO + most common formats.
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  // DD/MM/YYYY or DD.MM.YYYY (Turkish/European common).
  const m = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    let year = parseInt(m[3], 10);
    if (year < 100) year += 2000;
    const guess = new Date(Date.UTC(year, month - 1, day));
    if (!isNaN(guess.getTime())) return guess.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function parseList(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Sample CSV the user can download to see the expected shape. */
export const SAMPLE_CSV =
  "Company,Role,Status,Applied,Location,Source,Work Type,URL,Notes\n" +
  "Stripe,Senior Frontend Engineer,applied,2026-05-12,Remote,LinkedIn,remote,https://example.com/jobs/1,Referred by Maya\n" +
  "Figma,Product Designer,hr interview,2026-05-08,San Francisco,Referral,hybrid,,\"Loved the brand guidelines they shared\"\n" +
  "Anthropic,Software Engineer,offer,2026-04-30,Remote,Company site,remote,,Decision by Friday\n";
