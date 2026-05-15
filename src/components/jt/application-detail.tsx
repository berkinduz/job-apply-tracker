"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MoreHorizontal,
  Pin,
  ChevronDown,
  MapPin,
  Building2,
  TrendingUp,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  Linkedin,
  User,
} from "lucide-react";
import { toast } from "sonner";

import {
  JtButton,
  JtCompanyAvatar,
  JtDot,
  STATUS_TOKENS,
  STATUS_ORDER,
  type JtStatusKey,
} from "@/components/jt/primitives";
import {
  JtPipeline,
  JtActivityTimeline,
  JtDetailSidebar,
  buildSyntheticActivity,
} from "@/components/jt/application-detail-extras";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useApplicationStore } from "@/store";
import { createClient } from "@/lib/supabase/client";
import type { JobApplication, ApplicationStatus } from "@/types";

export function JtApplicationDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    getApplicationById,
    fetchApplications,
    _hasHydrated,
    isLoading,
    deleteApplication,
    togglePin,
    updateApplicationStatus,
    updateApplicationNotes,
  } = useApplicationStore();

  const [app, setApp] = React.useState<JobApplication | undefined>(undefined);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [resumeBusy, setResumeBusy] = React.useState(false);
  const [noteDraft, setNoteDraft] = React.useState("");

  React.useEffect(() => {
    if (!_hasHydrated) fetchApplications();
  }, [_hasHydrated, fetchApplications]);

  React.useEffect(() => {
    if (_hasHydrated && params?.id) {
      setApp(getApplicationById(params.id));
    }
  }, [params?.id, getApplicationById, _hasHydrated]);

  if (!_hasHydrated || isLoading) {
    return <LoadingDetail />;
  }

  if (!app) {
    return (
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "var(--jt-text-2)", margin: "0 0 16px" }}>
          Application not found.
        </p>
        <Link href="/applications">
          <JtButton variant="secondary" icon={<ArrowLeft size={14} />}>
            Back to applications
          </JtButton>
        </Link>
      </main>
    );
  }

  const sKey = app.status as JtStatusKey;
  const s = STATUS_TOKENS[sKey];

  const changeStatus = async (next: ApplicationStatus) => {
    setStatusOpen(false);
    if (next === app.status) return;
    await updateApplicationStatus(app.id, next);
    setApp(getApplicationById(app.id));
    const wasOffer = next === "offer" || next === "accepted";
    if (wasOffer) {
      toast.success(
        next === "offer"
          ? `Offer at ${app.companyName} 🎉  Nice.`
          : `Accepted ${app.companyName} — congrats!`,
      );
    } else if (next === "rejected") {
      toast(`Marked ${app.companyName} as rejected. Their loss.`);
    } else {
      toast.success(`Moved to ${STATUS_TOKENS[next as JtStatusKey].label}`);
    }
  };

  const handleResumeDownload = async () => {
    if (!app.resumePath) return;
    setResumeBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("resumes")
        .createSignedUrl(app.resumePath, 60);
      if (error || !data?.signedUrl) throw error || new Error("Bad URL");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setResumeBusy(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteDraft.trim()) return;
    await updateApplicationNotes(app.id, noteDraft);
    setApp(getApplicationById(app.id));
    setNoteDraft("");
    toast.success("Note added");
  };

  const activity = buildSyntheticActivity(app);

  return (
    <>
      <DetailTopbar
        companyName={app.companyName}
        position={app.position}
        isPinned={app.isPinned}
        onTogglePin={() => togglePin(app.id)}
        onDelete={() => setConfirmDelete(true)}
        appId={app.id}
      />
      <main
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "24px 16px 100px",
        }}
        className="sm:!px-8"
      >
        {/* Hero */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 20,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <JtCompanyAvatar name={app.companyName} size={72} radius={14} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                color: "var(--jt-text-2)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
                flexWrap: "wrap",
              }}
            >
              {app.isPinned && <Pin size={12} color="var(--p-500)" />}
              <span>
                Applied{" "}
                {format(new Date(app.applicationDate), "MMM d, yyyy")}
              </span>
              <span style={{ color: "var(--jt-text-3)" }}>·</span>
              <span>via {app.source}</span>
            </div>
            <h1
              style={{
                fontSize: "clamp(26px, 4vw, 32px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {app.companyName}
            </h1>
            <div
              style={{
                fontSize: 19,
                color: "var(--jt-text-2)",
                marginTop: 4,
                fontWeight: 400,
              }}
            >
              {app.position}
            </div>
            <div
              style={{
                display: "flex",
                gap: 14,
                marginTop: 12,
                flexWrap: "wrap",
                fontSize: 13,
                color: "var(--jt-text-2)",
              }}
            >
              {app.companyLocation && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <MapPin size={13} /> {app.companyLocation}
                </span>
              )}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  textTransform: "capitalize",
                }}
              >
                <Building2 size={13} /> {app.workType}
              </span>
              {app.companySalaryRange && (
                <span
                  className="tnum"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    color: "var(--jt-text)",
                    fontWeight: 500,
                  }}
                >
                  <TrendingUp size={13} /> {app.companySalaryRange}
                </span>
              )}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setStatusOpen((o) => !o)}
              className="focus-ring"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 999,
                background: s.bg,
                color: s.dot,
                border: "none",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              <JtDot color={s.dot} size={8} /> {s.label}{" "}
              <ChevronDown size={14} />
            </button>
            {statusOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  background: "var(--jt-bg-elev)",
                  border: "1px solid var(--jt-border)",
                  borderRadius: "var(--r-md)",
                  boxShadow: "var(--sh-md)",
                  minWidth: 220,
                  padding: 4,
                  zIndex: 10,
                }}
              >
                {STATUS_ORDER.map((st) => {
                  const sc = STATUS_TOKENS[st];
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => changeStatus(st as ApplicationStatus)}
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
                      <JtDot color={sc.dot} size={8} />
                      <span style={{ flex: 1 }}>{sc.label}</span>
                      <span className="kbd">{sc.shortcut}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <JtPipeline status={app.status} onChange={changeStatus} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 24,
            marginTop: 28,
          }}
          className="lg:!grid-cols-[1fr_300px]"
        >
          <div style={{ minWidth: 0 }}>
            <JtActivityTimeline events={activity} />

            {/* Notes */}
            <Section title="Notes">
              {app.notes ? (
                <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>
                  {app.notes}
                </div>
              ) : (
                <>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Drop a quick note — referrals, prep ideas, recruiter signals..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: 12,
                      border: "1.5px solid var(--jt-border)",
                      borderRadius: "var(--r-md)",
                      background: "var(--jt-bg-elev)",
                      color: "var(--jt-text)",
                      fontFamily: "var(--font-sans)",
                      fontSize: 14,
                      lineHeight: 1.5,
                      resize: "vertical",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                    <JtButton
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!noteDraft.trim()}
                    >
                      Save note
                    </JtButton>
                  </div>
                </>
              )}
            </Section>

            {app.jobPostingUrl && (
              <Section title="Job posting">
                <a
                  href={
                    app.jobPostingUrl.startsWith("http")
                      ? app.jobPostingUrl
                      : `https://${app.jobPostingUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--p-600)",
                    fontSize: 14,
                  }}
                >
                  {app.jobPostingUrl} <ExternalLink size={13} />
                </a>
                {app.jobPostingContent && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      background: "var(--jt-bg-sunk)",
                      borderRadius: "var(--r-md)",
                      whiteSpace: "pre-wrap",
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "var(--jt-text-2)",
                      maxHeight: 240,
                      overflow: "auto",
                    }}
                  >
                    {app.jobPostingContent}
                  </div>
                )}
              </Section>
            )}

            {app.coverLetter && (
              <Section title="Cover letter">
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    color: "var(--jt-text-2)",
                    background: "var(--jt-bg-sunk)",
                    padding: 14,
                    borderRadius: "var(--r-md)",
                  }}
                >
                  {app.coverLetter}
                </div>
              </Section>
            )}

            {app.contacts && app.contacts.length > 0 && (
              <Section title={`Contacts (${app.contacts.length})`}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  {app.contacts.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: 12,
                        background: "var(--jt-bg-sunk)",
                        borderRadius: "var(--r-md)",
                        border: "1px solid var(--jt-border-2)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 99,
                            background:
                              "linear-gradient(135deg, var(--p-300), var(--a-500))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        >
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {c.name}
                          </div>
                          {c.role && (
                            <div style={{ fontSize: 11, color: "var(--jt-text-3)" }}>
                              {c.role}
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          marginTop: 10,
                          fontSize: 12,
                          color: "var(--jt-text-2)",
                        }}
                      >
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            style={{ display: "inline-flex", gap: 5, alignItems: "center" }}
                          >
                            <Mail size={11} /> {c.email}
                          </a>
                        )}
                        {c.phone && (
                          <a
                            href={`tel:${c.phone}`}
                            style={{ display: "inline-flex", gap: 5, alignItems: "center" }}
                          >
                            <Phone size={11} /> {c.phone}
                          </a>
                        )}
                        {c.linkedin && (
                          <a
                            href={c.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "inline-flex", gap: 5, alignItems: "center" }}
                          >
                            <Linkedin size={11} /> LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {app.resumePath && (
              <Section title="Resume">
                <JtButton
                  variant="secondary"
                  size="sm"
                  icon={<FileText size={14} />}
                  onClick={handleResumeDownload}
                  disabled={resumeBusy}
                >
                  {resumeBusy ? "Loading…" : "Download attached PDF"}
                </JtButton>
              </Section>
            )}
          </div>

          <div className="hidden lg:block">
            <JtDetailSidebar app={app} />
          </div>
        </div>
      </main>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
            <AlertDialogDescription>
              {app.companyName} — {app.position}. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteApplication(app.id);
                toast.success("Deleted");
                router.push("/applications");
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DetailTopbar({
  companyName,
  position,
  isPinned,
  onTogglePin,
  onDelete,
  appId,
}: {
  companyName: string;
  position: string;
  isPinned: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
  appId: string;
}) {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--jt-border-2)",
        background: "var(--jt-bg)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
        className="sm:!px-8"
      >
        <Link
          href="/applications"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "1px solid var(--jt-border)",
            padding: "6px 12px 6px 8px",
            borderRadius: "var(--r-md)",
            color: "var(--jt-text-2)",
            fontSize: 13,
          }}
        >
          <ArrowLeft size={14} /> Applications
        </Link>
        <div
          className="hidden md:block"
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            color: "var(--jt-text-3)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <span>Applications</span>{" "}
          <span style={{ margin: "0 6px" }}>/</span>{" "}
          <span style={{ color: "var(--jt-text-2)" }}>
            {companyName} — {position}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <JtButton
            variant="ghost"
            size="sm"
            icon={<Pin size={14} />}
            onClick={onTogglePin}
          >
            {isPinned ? "Unpin" : "Pin"}
          </JtButton>
          <Link href={`/applications/${appId}/edit`}>
            <JtButton variant="secondary" size="sm" icon={<Pencil size={14} />}>
              Edit
            </JtButton>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="focus-ring"
                aria-label="More actions"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  background: "transparent",
                  border: "1px solid transparent",
                  borderRadius: "var(--r-md)",
                  color: "var(--jt-text-2)",
                  cursor: "pointer",
                }}
              >
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-lg)",
        padding: 22,
        marginTop: 16,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "var(--jt-text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 500,
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <User size={12} style={{ display: "none" }} /> {title}
      </div>
      {children}
    </div>
  );
}

function LoadingDetail() {
  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "24px 16px 48px",
      }}
      className="sm:!px-8"
    >
      <Skeleton className="h-10 w-32 mb-6" />
      <div className="flex items-start gap-5 mb-6">
        <Skeleton className="h-18 w-18 rounded-2xl" />
        <div className="flex-1">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <Skeleton className="h-24 w-full mb-6 rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </main>
  );
}
