"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronDown,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  X,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApplicationStore, useSettingsStore } from "@/store";
import { createClient } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";
import {
  ApplicationFormData,
  WorkType,
  ApplicationStatus,
  JobApplication,
} from "@/types";
import { STATUS_CONFIG, STATUS_ORDER, WORK_TYPE_CONFIG } from "@/config/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { fetchSkillSuggestions } from "@/lib/supabase/skills";

interface ApplicationFormProps {
  application?: JobApplication;
  isEditing?: boolean;
}

const currencyOptions = [
  "USD",
  "EUR",
  "GBP",
  "TRY",
  "CAD",
  "AUD",
  "CHF",
  "JPY",
  "CNY",
  "INR",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "RON",
  "BRL",
  "MXN",
  "SGD",
  "HKD",
  "NZD",
  "ZAR",
  "AED",
  "SAR",
];

const defaultCurrency = "USD";

const MAX_RESUME_SIZE = 2 * 1024 * 1024;

const extractCurrency = (value?: string) => {
  if (!value) return defaultCurrency;
  const match = value.match(new RegExp(`\\b(${currencyOptions.join("|")})\\b`));
  if (match?.[1]) return match[1];
  if (value.includes("$")) return "USD";
  if (value.toLowerCase().includes("tl") || value.toLowerCase().includes("try")) {
    return "TRY";
  }
  return defaultCurrency;
};

const extractNumbers = (value?: string) => {
  if (!value) return [];
  const matches = value.match(/\d[\d,.]*/g) ?? [];
  return matches.map((entry) => entry.replace(/,/g, ""));
};

const parseSalaryExpectation = (value?: string) => {
  const currency = extractCurrency(value);
  const numbers = extractNumbers(value);
  return {
    currency,
    amount: numbers[0] ?? "",
  };
};

const formatSalaryExpectation = (currency: string, amount: string) => {
  if (!amount) return "";
  return `${currency} ${amount}`;
};

export function ApplicationForm({
  application,
  isEditing = false,
}: ApplicationFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { addApplication, updateApplication } = useApplicationStore();
  const { getAllSources, getAllIndustries } = useSettingsStore();
  const t = useTranslations();
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    application?.applicationDate
      ? new Date(application.applicationDate)
      : new Date()
  );
  const salaryExpectationDefaults = parseSalaryExpectation(
    application?.salaryExpectation
  );
  const [salaryExpectationCurrency, setSalaryExpectationCurrency] = useState(
    salaryExpectationDefaults.currency
  );
  const [salaryExpectationAmount, setSalaryExpectationAmount] = useState(
    salaryExpectationDefaults.amount
  );

  const sources = getAllSources();
  const industries = getAllIndustries();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    defaultValues: application
      ? {
          companyName: application.companyName,
          companyLocation: application.companyLocation,
          companyIndustry: application.companyIndustry,
          companySalaryRange: application.companySalaryRange,
          position: application.position,
          skills: application.skills || [],
          applicationDate: application.applicationDate,
          coverLetter: application.coverLetter,
          salaryExpectation: application.salaryExpectation,
          jobPostingUrl: application.jobPostingUrl,
          jobPostingContent: application.jobPostingContent,
          source: application.source,
          workType: application.workType,
          notes: application.notes,
          contacts: application.contacts,
          status: application.status,
        }
      : {
          companyName: "",
          companyLocation: "",
          companyIndustry: "",
          position: "",
          skills: [],
          applicationDate: format(new Date(), "yyyy-MM-dd"),
          source: "LinkedIn",
          workType: "remote",
          status: "applied",
          contacts: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  const watchStatus = watch("status");
  const statusStyles = STATUS_CONFIG[watchStatus || "applied"];
  const watchWorkType = watch("workType");
  const watchSource = watch("source");
  const watchIndustry = watch("companyIndustry");
  const watchSkillsValue = useWatch({ control, name: "skills" });
  const watchSkills = useMemo(() => watchSkillsValue ?? [], [watchSkillsValue]);
  const [skillInput, setSkillInput] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePath, setResumePath] = useState(application?.resumePath || "");
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [isSkillLoading, setIsSkillLoading] = useState(false);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const formattedSalaryExpectation = formatSalaryExpectation(
    salaryExpectationCurrency,
    salaryExpectationAmount
  );

  useEffect(() => {
    setValue("salaryExpectation", formattedSalaryExpectation);
  }, [formattedSalaryExpectation, setValue]);

  const uploadResume = async (applicationId: string) => {
    if (!resumeFile) return resumePath;
    setIsResumeUploading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("Not authenticated");
      }
      const storagePath = `${userData.user.id}/${applicationId}/resume.pdf`;
      const { error } = await supabase.storage
        .from("resumes")
        .upload(storagePath, resumeFile, {
          contentType: "application/pdf",
          upsert: true,
        });
      if (error) throw error;
      setResumePath(storagePath);
      setResumeFile(null);
      return storagePath;
    } finally {
      setIsResumeUploading(false);
    }
  };

  const addSkill = (skill: string) => {
    const normalized = skill.trim();
    if (!normalized) return;
    if (!watchSkills.includes(normalized)) {
      setValue("skills", [...watchSkills, normalized]);
    }
    setSkillInput("");
    setShowSkillSuggestions(false);
  };

  useEffect(() => {
    const query = skillInput.trim();
    if (!query) {
      setSkillSuggestions([]);
      setIsSkillLoading(false);
      return;
    }
    setIsSkillLoading(true);
    const handler = setTimeout(async () => {
      const results = await fetchSkillSuggestions(query, locale === "tr" ? "tr" : "en");
      const labels = results.map((item) => item.label);
      setSkillSuggestions(labels.filter((item) => !watchSkills.includes(item)));
      setIsSkillLoading(false);
    }, 250);
    return () => clearTimeout(handler);
  }, [skillInput, locale, watchSkills]);

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);

    try {
      if (isEditing && application) {
        const uploadedPath = await uploadResume(application.id);
        await updateApplication(application.id, {
          ...data,
          resumePath: uploadedPath || resumePath || undefined,
        });
        toast.success(t("application.updateSuccess"));
        router.push(`/applications/${application.id}`);
      } else {
        const id = await addApplication(data);
        const uploadedPath = await uploadResume(id);
        if (uploadedPath) {
          await updateApplication(id, { resumePath: uploadedPath });
        }
        toast.success(t("application.saveSuccess"));
        router.push(`/applications/${id}`);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateResumeFile = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error(t("application.resumeInvalidType"));
      return false;
    }
    if (file.size > MAX_RESUME_SIZE) {
      toast.error(t("application.resumeTooLarge"));
      return false;
    }
    return true;
  };

  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setResumeFile(null);
      return;
    }
    if (!validateResumeFile(file)) {
      event.target.value = "";
      return;
    }
    setResumeFile(file);
  };

  const handleResumeDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (!validateResumeFile(file)) return;
    setResumeFile(file);
  };

  const addContact = () => {
    append({
      id: uuidv4(),
      name: "",
      role: "",
      email: "",
      phone: "",
      linkedin: "",
      notes: "",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={
              isEditing && application ? `/applications/${application.id}` : "/applications"
            }
          >
            <Button type="button" variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing
                ? t("application.editApplication")
                : t("application.newApplication")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isEditing
                ? "Update the application details"
                : "Track a new job application"}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2 border-2 font-medium justify-between w-full sm:w-[220px]",
                  statusStyles.bgColor,
                  statusStyles.color,
                  "hover:bg-[inherit] hover:text-[inherit] hover:border-[inherit]"
                )}
              >
                {t(`status.${watchStatus}`)}
                <ChevronDown className="h-4 w-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="p-3 bg-background/80 backdrop-blur-lg border shadow-lg rounded-xl"
            >
              <p className="text-xs text-muted-foreground mb-2 px-1">
                {t("application.changeStatus")}
              </p>
              <div className="flex flex-col gap-1.5">
                {STATUS_ORDER.map((status) => {
                  const config = STATUS_CONFIG[status];
                  const isActive = watchStatus === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setValue("status", status)}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer text-left flex items-center gap-2",
                        isActive
                          ? "bg-muted/60 text-foreground"
                          : "text-foreground hover:bg-muted/60"
                      )}
                    >
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full bg-current",
                          STATUS_CONFIG[status].color
                        )}
                      />
                      {t(`status.${status}`)}
                    </button>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-8 max-w-3xl">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">
                {t("application.companyName")} *
              </Label>
              <Input
                id="companyName"
                {...register("companyName", {
                  required: t("validation.required"),
                })}
                placeholder="e.g., Google"
              />
              {errors.companyName && (
                <p className="text-sm text-destructive">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyLocation">
                {t("application.companyLocation")} *
              </Label>
              <Input
                id="companyLocation"
                {...register("companyLocation", {
                  required: t("validation.required"),
                })}
                placeholder="e.g., San Francisco, CA"
              />
              {errors.companyLocation && (
                <p className="text-sm text-destructive">
                  {errors.companyLocation.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyIndustry">
                {t("application.companyIndustry")} *
              </Label>
              <Select
                value={watchIndustry}
                onValueChange={(value) => setValue("companyIndustry", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobPostingUrl">
                {t("application.jobPostingUrl")} ({t("common.optional")})
              </Label>
              <Input
                id="jobPostingUrl"
                {...register("jobPostingUrl")}
                placeholder="linkedin.com/jobs/..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Position Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Position Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="position">{t("application.position")} *</Label>
                <Input
                  id="position"
                  {...register("position", {
                    required: t("validation.required"),
                  })}
                  placeholder="e.g., Senior Frontend Engineer"
                />
                {errors.position && (
                  <p className="text-sm text-destructive">
                    {errors.position.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryExpectation">
                  {t("application.salaryExpectation")} ({t("common.optional")})
                </Label>
                <div className="grid grid-cols-[96px_minmax(0,1fr)_minmax(0,1fr)] gap-2">
                  <Select
                    value={salaryExpectationCurrency}
                    onValueChange={setSalaryExpectationCurrency}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="salaryExpectation"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="Amount"
                    className="min-w-0"
                    value={salaryExpectationAmount}
                    onChange={(event) =>
                      setSalaryExpectationAmount(event.target.value)
                    }
                  />
                </div>
                <input type="hidden" {...register("salaryExpectation")} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("application.applicationDate")} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      {date ? format(date, "PP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate);
                        if (newDate) {
                          setValue(
                            "applicationDate",
                            format(newDate, "yyyy-MM-dd")
                          );
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workType">{t("application.workType")} *</Label>
                <Select
                  value={watchWorkType}
                  onValueChange={(value) =>
                    setValue("workType", value as WorkType)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(WORK_TYPE_CONFIG) as WorkType[]).map(
                      (type) => (
                        <SelectItem key={type} value={type}>
                          {WORK_TYPE_CONFIG[type].icon} {t(`workType.${type}`)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="skills">
                  {t("application.skills")} ({t("common.optional")})
                </Label>
                <Input
                  id="skills"
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setShowSkillSuggestions(true);
                  }}
                  onFocus={() => setShowSkillSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowSkillSuggestions(false), 100);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                  placeholder={t("application.skillsHint")}
                />
                {showSkillSuggestions && skillInput.trim().length > 0 && (
                  <div className="relative">
                    <div className="absolute z-10 mt-2 w-full rounded-lg border bg-background shadow-md">
                      {isSkillLoading ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          {t("common.loading")}
                        </div>
                      ) : skillSuggestions.length > 0 ? (
                        <div className="max-h-48 overflow-auto py-1">
                          {skillSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                addSkill(suggestion);
                              }}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          {t("application.skillNoMatch")}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {watchSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {watchSkills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => {
                            setValue(
                              "skills",
                              watchSkills.filter((_, i) => i !== index)
                            );
                          }}
                          className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">{t("application.source")} *</Label>
                <Select
                  value={watchSource}
                  onValueChange={(value) => setValue("source", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">
                {t("application.resume")} ({t("common.optional")})
              </Label>
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition",
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border/60"
                )}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={handleResumeDrop}
              >
                <input
                  id="resume"
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeChange}
                  disabled={isSubmitting || isResumeUploading}
                  className="hidden"
                />
                <label
                  htmlFor="resume"
                  className="text-sm font-medium cursor-pointer"
                >
                  {resumeFile
                    ? resumeFile.name
                    : resumePath
                      ? t("application.resumeAttached")
                      : t("application.resumeDrop")}
                </label>
                <p className="text-xs text-muted-foreground">
                  {t("application.resumeHint")}
                </p>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("application.notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("notes")}
              placeholder="Any additional notes about this application..."
              rows={4}
            />
          </CardContent>
        </Card>

        <details className="rounded-xl border bg-card">
          <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium">
            <span>{t("application.advanced")}</span>
            <span className="text-xs text-muted-foreground">
              {t("application.advancedHint")}
            </span>
          </summary>
          <div className="px-6 pb-6 pt-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="coverLetter">
                {t("application.coverLetter")} ({t("common.optional")})
              </Label>
              <Textarea
                id="coverLetter"
                {...register("coverLetter")}
                placeholder="Paste your cover letter here..."
                rows={6}
              />
            </div>

            <div className="rounded-lg border bg-background/60 p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium">{t("application.contacts")}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContact}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("application.addContact")}
                </Button>
              </div>
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("application.contactsEmpty")}
                </p>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Contact {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>{t("application.contactName")}</Label>
                          <Input
                            {...register(`contacts.${index}.name`)}
                            placeholder="e.g., John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("application.contactRole")}</Label>
                          <Input
                            {...register(`contacts.${index}.role`)}
                            placeholder="e.g., Recruiter"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("application.contactEmail")}</Label>
                          <Input
                            type="email"
                            {...register(`contacts.${index}.email`)}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("application.contactPhone")}</Label>
                          <Input
                            {...register(`contacts.${index}.phone`)}
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>{t("application.contactLinkedIn")}</Label>
                          <Input
                            {...register(`contacts.${index}.linkedin`)}
                            placeholder="https://linkedin.com/in/..."
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>{t("application.contactNotes")}</Label>
                          <Textarea
                            {...register(`contacts.${index}.notes`)}
                            placeholder="Any notes about this contact..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </details>
      </div>
      {/* Submit */}
      <div className="flex justify-end gap-4 max-w-3xl">
        <Link
          href={
            isEditing && application ? `/applications/${application.id}` : "/applications"
          }
        >
          <Button type="button" variant="outline">
            {t("common.cancel")}
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.save")}
            </>
          ) : (
            t("common.save")
          )}
        </Button>
      </div>
    </form>
  );
}
