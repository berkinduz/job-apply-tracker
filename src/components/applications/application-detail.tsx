"use client";

import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Building2,
  Calendar,
  ExternalLink,
  Briefcase,
  DollarSign,
  Globe,
  Clock,
  User,
  Mail,
  Phone,
  Linkedin,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApplicationStore } from "@/store";
import { useTranslations } from "next-intl";
import { STATUS_CONFIG, WORK_TYPE_CONFIG } from "@/config/constants";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { JobApplication, ApplicationStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export function ApplicationDetail() {
  const params = useParams();
  const router = useRouter();
  const {
    getApplicationById,
    deleteApplication,
    updateApplication,
    updateApplicationNotes,
    fetchApplications,
    _hasHydrated,
    isLoading,
  } = useApplicationStore();
  const t = useTranslations();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [application, setApplication] = useState<JobApplication | undefined>(
    undefined
  );
  const [noteDraft, setNoteDraft] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const ALL_STATUSES: ApplicationStatus[] = [
    "applied",
    "test_case",
    "hr_interview",
    "technical_interview",
    "management_interview",
    "offer",
    "accepted",
    "rejected",
  ];

  useEffect(() => {
    if (!_hasHydrated) {
      fetchApplications();
    }
  }, [_hasHydrated, fetchApplications]);

  useEffect(() => {
    if (_hasHydrated) {
      const app = getApplicationById(params.id as string);
      setApplication(app);
    }
  }, [params.id, getApplicationById, _hasHydrated]);

  // Show skeleton while loading
  if (!_hasHydrated || isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
          </div>
          <div className="flex gap-2 ml-12 sm:ml-0">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        {/* Status Skeleton */}
        <div className="flex gap-3 ml-12 sm:ml-0">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>

        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">{t("application.notFound")}</p>
        <Link href="/applications" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[application.status];
  const workTypeConfig = WORK_TYPE_CONFIG[application.workType];

  const handleDelete = async () => {
    await deleteApplication(application.id);
    toast.success(t("application.deleteSuccess"));
    router.push("/applications");
  };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    await updateApplication(application.id, { status: newStatus });
    setApplication(getApplicationById(application.id));
    toast.success(t("application.updateSuccess"));
  };

  const handleAddNote = async () => {
    if (!noteDraft.trim()) return;
    setIsSavingNote(true);
    try {
      await updateApplicationNotes(application.id, noteDraft);
      setApplication(getApplicationById(application.id));
      setNoteDraft("");
      toast.success(t("application.updateSuccess"));
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link href="/applications">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{application.companyName}</h1>
              <p className="text-lg text-muted-foreground mt-1">
                {application.position}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-12 sm:ml-0">
            <Link href={`/applications/${application.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("common.delete")}
            </Button>
          </div>
        </div>

        {/* Status & Quick Info */}
        <div className="flex flex-wrap gap-3 ml-12 sm:ml-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2 border-2 font-medium",
                  statusConfig.bgColor,
                  statusConfig.color,
                  "hover:opacity-90"
                )}
              >
                {t(`status.${application.status}`)}
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
                {ALL_STATUSES.map((status) => {
                  const config = STATUS_CONFIG[status];
                  const isActive = application.status === status;
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-full transition-all cursor-pointer text-left",
                        config.bgColor,
                        config.color,
                        isActive
                          ? "ring-2 ring-inset ring-primary/50"
                          : "hover:brightness-95"
                      )}
                    >
                      {t(`status.${status}`)}
                    </button>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {workTypeConfig.icon} {t(`workType.${application.workType}`)}
          </Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {application.source}
          </Badge>
        </div>

        {/* Skills */}
        {application.skills && application.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 ml-12 sm:ml-0">
            {application.skills.map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-sm bg-muted/50"
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Company Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t("application.companyDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{application.companyLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{application.companyIndustry}</span>
              </div>
              {application.companySalaryRange && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{application.companySalaryRange}</span>
                </div>
              )}
              {application.jobPostingUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={
                      application.jobPostingUrl.startsWith("http")
                        ? application.jobPostingUrl
                        : `https://${application.jobPostingUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {t("application.jobPosting")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("application.applicationDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {t("application.applicationDate")}:{" "}
                  {format(
                    new Date(application.applicationDate),
                    "MMMM d, yyyy"
                  )}
                </span>
              </div>
              {application.salaryExpectation && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {t("application.salaryExpectation")}:{" "}
                    {application.salaryExpectation}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {t("application.createdAt")}:{" "}
                  {format(new Date(application.createdAt), "MMM d, yyyy HH:mm")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {t("application.updatedAt")}:{" "}
                  {format(new Date(application.updatedAt), "MMM d, yyyy HH:mm")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contacts */}
        {application.contacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("application.contacts")} ({application.contacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {application.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="font-medium">{contact.name}</div>
                    {contact.role && (
                      <div className="text-sm text-muted-foreground">
                        {contact.role}
                      </div>
                    )}
                    <div className="space-y-1 text-sm">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {contact.phone}
                        </a>
                      )}
                      {contact.linkedin && (
                        <a
                          href={contact.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <Linkedin className="h-3.5 w-3.5" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                    {contact.notes && (
                      <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cover Letter */}
        {application.coverLetter && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("application.coverLetter")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm bg-muted/50 rounded-lg p-4">
                {application.coverLetter}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Posting Content */}
        {application.jobPostingContent && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("application.jobPostingContent")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm bg-muted/50 rounded-lg p-4">
                {application.jobPostingContent}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {application.notes ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("application.notes")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm">
                {application.notes}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("application.addNoteTitle")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("application.addNoteDescription")}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder={t("application.addNotePlaceholder")}
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                rows={4}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddNote}
                  disabled={!noteDraft.trim() || isSavingNote}
                >
                  {t("common.save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("application.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
