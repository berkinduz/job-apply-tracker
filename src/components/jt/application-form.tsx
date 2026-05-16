"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { format } from "date-fns";
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  X,
  Trash2,
  Loader2,
  CalendarIcon,
  Upload,
  FileText,
  Link as LinkIcon,
  Sparkles,
  Check,
} from "lucide-react";
import { v4 as uuid } from "uuid";
import { toast } from "sonner";

import {
  JtButton,
  JtDot,
  STATUS_TOKENS,
  STATUS_ORDER,
  type JtStatusKey,
} from "@/components/jt/primitives";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { useApplicationStore, useSettingsStore } from "@/store";
import { createClient } from "@/lib/supabase/client";
import type {
  ApplicationFormData,
  JobApplication,
  WorkType,
  ApplicationStatus,
} from "@/types";
import { fetchSkillSuggestions } from "@/lib/supabase/skills";

const CURRENCIES = ["USD", "EUR", "GBP", "TRY", "CAD", "AUD", "CHF", "JPY", "INR"];
const MAX_RESUME = 2 * 1024 * 1024;

interface JtApplicationFormProps {
  application?: JobApplication;
  isEditing?: boolean;
}

export function JtApplicationForm({ application, isEditing }: JtApplicationFormProps) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const { addApplication, updateApplication } = useApplicationStore();
  const { getAllSources, getAllIndustries } = useSettingsStore();

  const today = format(new Date(), "yyyy-MM-dd");
  const sources = getAllSources();
  const industries = getAllIndustries();

  // Parse existing salary into currency + amount
  const initSalary = parseSalary(application?.salaryExpectation);
  const [salaryCurrency, setSalaryCurrency] = React.useState(initSalary.currency);
  const [salaryAmount, setSalaryAmount] = React.useState(initSalary.amount);

  const [date, setDate] = React.useState<Date>(
    application?.applicationDate ? new Date(application.applicationDate) : new Date(),
  );
  const [followUpDate, setFollowUpDate] = React.useState<Date | undefined>(
    application?.followUpDate ? new Date(application.followUpDate) : undefined,
  );
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [resumePath, setResumePath] = React.useState(application?.resumePath || "");
  const [resumeBusy, setResumeBusy] = React.useState(false);
  const [skillInput, setSkillInput] = React.useState("");
  const [skillSuggestions, setSkillSuggestions] = React.useState<string[]>([]);
  const [showSkillSuggestions, setShowSkillSuggestions] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const { register, handleSubmit, control, setValue, watch } =
    useForm<ApplicationFormData>({
      defaultValues: application
        ? {
            companyName: application.companyName,
            companyLocation: application.companyLocation || "",
            companyIndustry: application.companyIndustry || "",
            companySalaryRange: application.companySalaryRange,
            position: application.position,
            skills: application.skills || [],
            applicationDate: application.applicationDate,
            coverLetter: application.coverLetter,
            salaryExpectation: application.salaryExpectation,
            jobPostingUrl: application.jobPostingUrl,
            jobPostingContent: application.jobPostingContent,
            source: application.source || "LinkedIn",
            workType: application.workType,
            notes: application.notes,
            contacts: application.contacts,
            status: application.status,
            followUpDate: application.followUpDate,
          }
        : {
            companyName: "",
            companyLocation: "",
            companyIndustry: "",
            position: "",
            skills: [],
            applicationDate: today,
            source: "LinkedIn",
            workType: "remote",
            status: "applied",
            contacts: [],
          },
    });

  const { fields, append, remove } = useFieldArray({ control, name: "contacts" });

  const watchStatus = watch("status") || "applied";
  const watchSource = watch("source");
  const watchIndustry = watch("companyIndustry");
  const watchWorkType = watch("workType");
  const watchSkillsValue = useWatch({ control, name: "skills" });
  const watchSkills = React.useMemo(() => watchSkillsValue ?? [], [watchSkillsValue]);

  React.useEffect(() => {
    const composed = salaryAmount ? `${salaryCurrency} ${salaryAmount}` : "";
    setValue("salaryExpectation", composed);
  }, [salaryCurrency, salaryAmount, setValue]);

  React.useEffect(() => {
    const q = skillInput.trim();
    if (!q) {
      setSkillSuggestions([]);
      return;
    }
    const handler = setTimeout(async () => {
      const results = await fetchSkillSuggestions(q, "en");
      setSkillSuggestions(
        results.map((r) => r.label).filter((s) => !watchSkills.includes(s)),
      );
    }, 250);
    return () => clearTimeout(handler);
  }, [skillInput, watchSkills]);

  const addSkill = (skill: string) => {
    const normalized = skill.trim();
    if (!normalized || watchSkills.includes(normalized)) {
      setSkillInput("");
      return;
    }
    setValue("skills", [...watchSkills, normalized]);
    setSkillInput("");
    setShowSkillSuggestions(false);
  };

  const handleResumePick = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (file.size > MAX_RESUME) {
      toast.error("Resume must be 2 MB or smaller.");
      return;
    }
    setResumeFile(file);
  };

  const uploadResume = async (applicationId: string): Promise<string | undefined> => {
    if (!resumeFile) return resumePath || undefined;
    setResumeBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not authenticated");
      const path = `${u.user.id}/${applicationId}/resume.pdf`;
      const { error } = await supabase.storage
        .from("resumes")
        .upload(path, resumeFile, {
          contentType: "application/pdf",
          upsert: true,
        });
      if (error) throw error;
      setResumePath(path);
      setResumeFile(null);
      return path;
    } finally {
      setResumeBusy(false);
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setSubmitting(true);
    try {
      if (isEditing && application) {
        const path = await uploadResume(application.id);
        await updateApplication(application.id, {
          ...data,
          resumePath: path || resumePath || undefined,
        });
        toast.success("Updated");
        router.push(`/applications/${application.id}`);
      } else {
        const id = await addApplication(data);
        const path = await uploadResume(id);
        if (path) await updateApplication(id, { resumePath: path });
        toast.success(`Added ${data.companyName} — ${data.position}`);
        router.push(`/applications/${id}`);
      }
    } catch (err) {
      toast.error((err as Error).message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const statusToken = STATUS_TOKENS[watchStatus as JtStatusKey];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        background: "var(--jt-bg)",
        color: "var(--jt-text)",
        minHeight: "100vh",
        paddingBottom: 96,
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid var(--jt-border-2)",
          background: "var(--jt-bg)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            maxWidth: 880,
            margin: "0 auto",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "space-between",
          }}
        >
          <Link
            href={
              isEditing && application
                ? `/applications/${application.id}`
                : "/applications"
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              padding: "6px 10px 6px 8px",
              border: "1px solid var(--jt-border)",
              borderRadius: "var(--r-md)",
              color: "var(--jt-text-2)",
            }}
          >
            <ArrowLeft size={14} /> {isEditing ? "Back" : "Applications"}
          </Link>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: 0,
              textAlign: "center",
              flex: 1,
            }}
          >
            {isEditing ? "Edit application" : "New application"}
          </h1>
          {/* Status pill (dropdown) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="focus-ring"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: statusToken.bg,
                  color: statusToken.dot,
                  border: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <JtDot color={statusToken.dot} size={7} />
                {statusToken.label}
                <ChevronDown size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div style={{ padding: 4, minWidth: 200 }}>
                {STATUS_ORDER.map((st) => {
                  const t = STATUS_TOKENS[st];
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setValue("status", st as ApplicationStatus)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "8px 10px",
                        background: "transparent",
                        border: "none",
                        borderRadius: "var(--r-sm)",
                        fontSize: 13,
                        color: "var(--jt-text)",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "var(--jt-bg-sunk)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <JtDot color={t.dot} size={8} />
                      <span style={{ flex: 1 }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "32px 16px",
        }}
      >
        {/* Paste link → autofill. Lives above Essentials because pasting before
            you start typing is the cheapest path to a complete record. */}
        {!isEditing && (
          <JobUrlPaste
            onParsed={(d) => {
              if (d.companyName) setValue("companyName", d.companyName);
              if (d.position) setValue("position", d.position);
              if (d.location) setValue("companyLocation", d.location);
              if (d.jobPostingContent)
                setValue("jobPostingContent", d.jobPostingContent);
              if (d.jobPostingUrl) setValue("jobPostingUrl", d.jobPostingUrl);
              if (d.source) setValue("source", d.source);
              if (d.workType) setValue("workType", d.workType);
              if (d.salaryExpectation) {
                const parsed = parseSalary(d.salaryExpectation);
                if (parsed.amount) setSalaryAmount(parsed.amount);
                setSalaryCurrency(parsed.currency);
              }
            }}
          />
        )}

        {/* Essentials */}
        <FormCard title="Essentials" description="Just enough to get started.">
          <Row>
            <Field label="Company name" required>
              <input
                {...register("companyName", { required: true })}
                placeholder="e.g. Stripe"
                style={inputStyle}
                required
              />
            </Field>
            <Field label="Role" required>
              <input
                {...register("position", { required: true })}
                placeholder="e.g. Senior Frontend Engineer"
                style={inputStyle}
                required
              />
            </Field>
          </Row>
          <Row>
            <Field label="Application date" optional>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    style={{
                      ...inputStyle,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <CalendarIcon size={14} color="var(--jt-text-3)" />
                    {format(date, "PP")}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      if (d) {
                        setDate(d);
                        setValue("applicationDate", format(d, "yyyy-MM-dd"));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </Field>
            <Field label="Source" optional>
              <select
                {...register("source")}
                style={selectStyle}
                value={watchSource}
                onChange={(e) => setValue("source", e.target.value)}
              >
                {sources.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </Row>
        </FormCard>

        {/* Job details */}
        <FormCard title="Job details" description="Helpful, not required.">
          <Row>
            <Field label="Location" optional>
              <input
                {...register("companyLocation")}
                placeholder="e.g. Remote, San Francisco, Berlin"
                style={inputStyle}
              />
            </Field>
            <Field label="Work type" optional>
              <PillToggle
                options={[
                  { value: "remote", label: "Remote" },
                  { value: "hybrid", label: "Hybrid" },
                  { value: "onsite", label: "On-site" },
                ]}
                value={watchWorkType}
                onChange={(v) => setValue("workType", v as WorkType)}
              />
            </Field>
          </Row>
          <Row>
            <Field label="Industry" optional>
              <select
                style={selectStyle}
                value={watchIndustry || ""}
                onChange={(e) => setValue("companyIndustry", e.target.value)}
              >
                <option value="">Pick one (optional)</option>
                {industries.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </Field>
            <Field label="Job posting URL" optional>
              <input
                {...register("jobPostingUrl")}
                type="url"
                placeholder="linkedin.com/jobs/..."
                style={inputStyle}
              />
            </Field>
          </Row>
          <Field label="Salary expectation" optional>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8 }}>
              <select
                style={selectStyle}
                value={salaryCurrency}
                onChange={(e) => setSalaryCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Amount"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                style={inputStyle}
              />
              <input type="hidden" {...register("salaryExpectation")} />
            </div>
          </Field>
        </FormCard>

        {/* Follow-up — nudge the user when this application goes stale. */}
        <FormCard
          title="Stay on it"
          description="Pick a date and we'll email you a reminder so this doesn't slip."
        >
          <Field label="Follow-up date" optional>
            <FollowUpPicker
              value={followUpDate}
              onChange={(d) => {
                setFollowUpDate(d);
                setValue("followUpDate", d ? format(d, "yyyy-MM-dd") : undefined);
              }}
              applicationDate={date}
            />
            <input type="hidden" {...register("followUpDate")} />
          </Field>
        </FormCard>

        {/* Your prep */}
        <FormCard title="Your prep" description="Anything that helps you land the role.">
          <Field label="Skills" optional>
            <div style={{ position: "relative" }}>
              <input
                value={skillInput}
                onChange={(e) => {
                  setSkillInput(e.target.value);
                  setShowSkillSuggestions(true);
                }}
                onFocus={() => setShowSkillSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 120)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                  if (e.key === "Backspace" && !skillInput && watchSkills.length) {
                    setValue("skills", watchSkills.slice(0, -1));
                  }
                }}
                placeholder="Press Enter to add (e.g. React, TypeScript)"
                style={inputStyle}
              />
              {showSkillSuggestions && skillInput && skillSuggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "var(--jt-bg-elev)",
                    border: "1px solid var(--jt-border)",
                    borderRadius: "var(--r-md)",
                    boxShadow: "var(--sh-md)",
                    overflow: "hidden",
                    zIndex: 5,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {skillSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addSkill(s);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 12px",
                        background: "transparent",
                        border: "none",
                        fontSize: 13,
                        color: "var(--jt-text)",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "var(--jt-bg-sunk)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {watchSkills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {watchSkills.map((s) => (
                  <span
                    key={s}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 8px 4px 10px",
                      background: "var(--jt-bg-sunk)",
                      color: "var(--jt-text)",
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() =>
                        setValue("skills", watchSkills.filter((x) => x !== s))
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--jt-text-3)",
                        padding: 0,
                        display: "inline-flex",
                      }}
                      aria-label={`Remove ${s}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Field label="Resume (PDF)" optional>
            <ResumeDrop
              file={resumeFile}
              path={resumePath}
              busy={resumeBusy}
              onPick={handleResumePick}
              onClear={() => {
                setResumeFile(null);
                setResumePath("");
              }}
            />
          </Field>

          <Field label="Notes" optional>
            <textarea
              {...register("notes")}
              rows={4}
              placeholder="Anything worth remembering — referrals, prep ideas, recruiter signals…"
              style={{ ...inputStyle, height: "auto", padding: 12, resize: "vertical", minHeight: 96 }}
            />
          </Field>

          {/* Advanced — cover letter + contacts */}
          <details
            style={{
              border: "1px solid var(--jt-border)",
              borderRadius: "var(--r-md)",
              marginTop: 6,
            }}
          >
            <summary
              style={{
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                listStyle: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Advanced — cover letter and contacts</span>
              <span style={{ color: "var(--jt-text-3)", fontSize: 12 }}>Optional</span>
            </summary>
            <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Cover letter" optional>
                <textarea
                  {...register("coverLetter")}
                  rows={6}
                  placeholder="Paste your cover letter…"
                  style={{ ...inputStyle, height: "auto", padding: 12, resize: "vertical", minHeight: 120 }}
                />
              </Field>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Contacts</span>
                  <JtButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Plus size={12} />}
                    onClick={() =>
                      append({
                        id: uuid(),
                        name: "",
                        role: "",
                        email: "",
                        phone: "",
                        linkedin: "",
                        notes: "",
                      })
                    }
                  >
                    Add contact
                  </JtButton>
                </div>
                {fields.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--jt-text-3)", margin: 0 }}>
                    None yet — add recruiters or interviewers as they appear.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {fields.map((f, idx) => (
                      <div
                        key={f.id}
                        style={{
                          padding: 12,
                          background: "var(--jt-bg-sunk)",
                          borderRadius: "var(--r-md)",
                          border: "1px solid var(--jt-border-2)",
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                        }}
                      >
                        <input
                          {...register(`contacts.${idx}.name`)}
                          placeholder="Name"
                          style={inputStyle}
                        />
                        <input
                          {...register(`contacts.${idx}.role`)}
                          placeholder="Role (recruiter, hiring manager…)"
                          style={inputStyle}
                        />
                        <input
                          {...register(`contacts.${idx}.email`)}
                          type="email"
                          placeholder="Email"
                          style={inputStyle}
                        />
                        <input
                          {...register(`contacts.${idx}.phone`)}
                          placeholder="Phone"
                          style={inputStyle}
                        />
                        <input
                          {...register(`contacts.${idx}.linkedin`)}
                          placeholder="LinkedIn URL"
                          style={{ ...inputStyle, gridColumn: "span 2" }}
                        />
                        <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
                          <JtButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 size={12} />}
                            onClick={() => remove(idx)}
                          >
                            Remove
                          </JtButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </details>
        </FormCard>
      </div>

      {/* Submit bar — sticky banner on mobile, inline footer on desktop */}
      <div className="jt-form-submit-bar">
        <div
          style={{
            maxWidth: 880,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Link
            href={
              isEditing && application
                ? `/applications/${application.id}`
                : "/applications"
            }
          >
            <JtButton variant="ghost" type="button">
              Cancel
            </JtButton>
          </Link>
          <JtButton type="submit" size="md" disabled={submitting} iconRight={submitting ? undefined : undefined}>
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isEditing ? "Saving…" : "Adding…"}
              </>
            ) : isEditing ? (
              "Save changes"
            ) : (
              "Add application"
            )}
          </JtButton>
        </div>
      </div>
    </form>
  );
}

/* ---------- subcomponents ---------- */

type ParsedJobData = {
  companyName?: string;
  position?: string;
  location?: string;
  jobPostingContent?: string;
  jobPostingUrl: string;
  source?: string;
  workType?: "remote" | "hybrid" | "onsite";
  salaryExpectation?: string;
  via: string;
};

function JobUrlPaste({ onParsed }: { onParsed: (data: ParsedJobData) => void }) {
  const [url, setUrl] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<{
    companyName?: string;
    position?: string;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || json.error || "Couldn't read that link.");
      }
      const data = json.data as ParsedJobData;
      onParsed(data);
      setResult({ companyName: data.companyName, position: data.position });
      toast.success(
        data.companyName && data.position
          ? `Filled ${data.companyName} — ${data.position}`
          : "Filled what we could find. Tweak as needed.",
      );
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px dashed color-mix(in oklab, var(--p-500) 35%, var(--jt-border))",
        borderRadius: "var(--r-lg)",
        padding: 18,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 600,
          color: "var(--p-700)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}
      >
        <Sparkles size={12} /> Have a link? We&apos;ll do the rest.
      </div>
      <div style={{ display: "flex", gap: 8, flexDirection: "column" }} className="sm:!flex-row">
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 12px",
            background: "var(--jt-bg)",
            border: "1.5px solid var(--jt-border)",
            borderRadius: "var(--r-md)",
            height: 42,
          }}
        >
          <LinkIcon size={14} color="var(--jt-text-3)" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!busy) submit();
              }
            }}
            placeholder="Paste a Greenhouse / Lever / LinkedIn / Workable URL"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--jt-text)",
              fontSize: 14,
              fontFamily: "var(--font-sans)",
            }}
          />
        </div>
        <JtButton
          type="button"
          onClick={submit}
          disabled={busy || !url.trim()}
          icon={
            busy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )
          }
        >
          {busy ? "Reading…" : "Autofill"}
        </JtButton>
      </div>
      {result && !busy && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "var(--st-accepted)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Check size={12} />
          {result.companyName && result.position
            ? `Prefilled ${result.companyName} — ${result.position}`
            : "Prefilled what we could find."}
        </div>
      )}
      {error && !busy && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--st-rejected)" }}>
          {error} — fill the fields manually below.
        </div>
      )}
    </div>
  );
}

function FollowUpPicker({
  value,
  onChange,
  applicationDate,
}: {
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  applicationDate: Date;
}) {
  const presets: { label: string; days: number }[] = [
    { label: "In 3 days", days: 3 },
    { label: "In 1 week", days: 7 },
    { label: "In 2 weeks", days: 14 },
  ];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {presets.map((p) => {
          const target = new Date(applicationDate);
          target.setDate(target.getDate() + p.days);
          if (target < today) {
            target.setTime(today.getTime());
            target.setDate(target.getDate() + p.days);
          }
          const active =
            value && format(value, "yyyy-MM-dd") === format(target, "yyyy-MM-dd");
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(target)}
              className="focus-ring"
              style={{
                padding: "7px 12px",
                borderRadius: "var(--r-md)",
                border: active ? "1.5px solid var(--p-500)" : "1.5px solid var(--jt-border)",
                background: active ? "var(--p-50)" : "var(--jt-bg-elev)",
                color: active ? "var(--p-700)" : "var(--jt-text)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          );
        })}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="focus-ring"
              style={{
                padding: "7px 12px",
                borderRadius: "var(--r-md)",
                border: "1.5px solid var(--jt-border)",
                background: "var(--jt-bg-elev)",
                color: "var(--jt-text)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <CalendarIcon size={13} />
              {value ? format(value, "PP") : "Pick a date"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(d) => onChange(d || undefined)}
              disabled={(d) => d < today}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            style={{
              padding: "7px 10px",
              borderRadius: "var(--r-md)",
              border: "1.5px solid var(--jt-border)",
              background: "transparent",
              color: "var(--jt-text-3)",
              fontSize: 13,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>
      {value && (
        <div style={{ fontSize: 12, color: "var(--jt-text-2)" }}>
          We&apos;ll email you on{" "}
          <strong style={{ color: "var(--jt-text)" }}>{format(value, "EEEE, MMM d")}</strong>.
        </div>
      )}
    </div>
  );
}

function FormCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-lg)",
        padding: 24,
        marginBottom: 16,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "-0.015em",
            margin: 0,
          }}
        >
          {title}
        </h2>
        {description && (
          <p style={{ fontSize: 13, color: "var(--jt-text-2)", margin: "4px 0 0" }}>
            {description}
          </p>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="jt-form-row"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--jt-text)", letterSpacing: "-0.005em" }}>
          {label}
        </span>
        {required && (
          <span
            aria-hidden="true"
            style={{
              fontSize: 13,
              color: "var(--st-rejected, #e11d48)",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            *
          </span>
        )}
        {optional && (
          <span style={{ fontSize: 11, color: "var(--jt-text-3)" }}>Optional</span>
        )}
      </span>
      {children}
    </label>
  );
}

function PillToggle({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="focus-ring"
            style={{
              padding: "8px 14px",
              borderRadius: "var(--r-md)",
              border: active ? "1.5px solid var(--p-500)" : "1.5px solid var(--jt-border)",
              background: active ? "var(--p-50)" : "var(--jt-bg-elev)",
              color: active ? "var(--p-700)" : "var(--jt-text)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 120ms var(--jt-ease)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ResumeDrop({
  file,
  path,
  busy,
  onPick,
  onClear,
}: {
  file: File | null;
  path: string;
  busy: boolean;
  onPick: (f: File) => void;
  onClear: () => void;
}) {
  const [drag, setDrag] = React.useState(false);
  const ref = React.useRef<HTMLInputElement>(null);
  const handleSelect = () => ref.current?.click();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onPick(f);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onPick(f);
  };
  const hasFile = file || path;
  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        style={{ display: "none" }}
      />
      <div
        onClick={handleSelect}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        style={{
          padding: "20px 16px",
          background: drag ? "var(--p-50)" : "var(--jt-bg-sunk)",
          border: drag ? "1.5px dashed var(--p-500)" : "1.5px dashed var(--jt-border)",
          borderRadius: "var(--r-md)",
          textAlign: "center",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        {hasFile ? (
          <>
            <FileText size={22} color="var(--p-500)" />
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {file ? file.name : "Existing resume attached"}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--jt-text-3)",
                fontSize: 12,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {busy ? "Uploading…" : "Replace"}
            </button>
          </>
        ) : (
          <>
            <Upload size={22} color="var(--jt-text-3)" />
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              Drag a PDF here, or click to upload
            </div>
            <div style={{ fontSize: 12, color: "var(--jt-text-3)" }}>
              PDF only, up to 2 MB
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  height: 40,
  padding: "0 12px",
  background: "var(--jt-bg-elev)",
  border: "1.5px solid var(--jt-border)",
  borderRadius: "var(--r-md)",
  color: "var(--jt-text)",
  fontSize: 14,
  fontFamily: "var(--font-sans)",
  letterSpacing: "-0.005em",
  outline: "none",
  width: "100%",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238E90A8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: 32,
};

/* ---------- Helpers ---------- */

function parseSalary(value?: string): { currency: string; amount: string } {
  const defaults = { currency: "USD", amount: "" };
  if (!value) return defaults;
  const currencyMatch = value.match(/\b(USD|EUR|GBP|TRY|CAD|AUD|CHF|JPY|INR)\b/);
  const numbers = value.match(/\d[\d,.]*/g) || [];
  return {
    currency: currencyMatch?.[1] || defaults.currency,
    amount: numbers[0]?.replace(/,/g, "") || "",
  };
}

