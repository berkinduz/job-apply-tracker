"use client";

import * as React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Bell, Plus, Sparkles, Check, X, CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import {
  JtButton,
  JtDot,
  STATUS_TOKENS,
  PIPELINE_STATUSES,
  type JtStatusKey,
} from "@/components/jt/primitives";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useApplicationStore } from "@/store";
import { activityService } from "@/lib/supabase/activity";
import type {
  JobApplication,
  ApplicationStatus,
  ActivityEventRecord,
} from "@/types";

/**
 * Pipeline progress bar — clickable stepper for the 7 active statuses.
 * Rejected status is shown as "Closed — Rejected" with empty progress.
 */
export function JtPipeline({
  status,
  onChange,
}: {
  status: ApplicationStatus;
  onChange?: (next: ApplicationStatus) => void;
}) {
  const isReject = status === "rejected";
  const steps = PIPELINE_STATUSES;
  const curIdx = isReject ? -1 : steps.indexOf(status as JtStatusKey);

  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-lg)",
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "var(--jt-text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 500,
          }}
        >
          Pipeline
        </span>
        <span
          style={{
            fontSize: 12,
            color: "var(--jt-text-2)",
            whiteSpace: "nowrap",
          }}
        >
          {isReject ? "Closed — Rejected" : `${curIdx + 1} of ${steps.length}`}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          overflowX: "auto",
        }}
        className="no-scrollbar"
      >
        {steps.map((st, i) => {
          const s = STATUS_TOKENS[st];
          const done = i < curIdx && !isReject;
          const cur = i === curIdx && !isReject;
          const next = steps[i + 1];
          return (
            <React.Fragment key={st}>
              <button
                type="button"
                onClick={() => onChange?.(st)}
                className="focus-ring"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: cur ? 28 : 22,
                    height: cur ? 28 : 22,
                    borderRadius: 99,
                    background: done ? s.dot : cur ? s.bg : "var(--jt-bg-sunk)",
                    border: cur
                      ? `2px solid ${s.dot}`
                      : done
                        ? `1px solid ${s.dot}`
                        : "1px solid var(--jt-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 200ms var(--jt-ease)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {done && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {cur && <JtDot color={s.dot} size={10} />}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: cur ? "var(--jt-text)" : "var(--jt-text-3)",
                    fontWeight: cur ? 600 : 400,
                    letterSpacing: "-0.005em",
                    whiteSpace: "nowrap",
                    minWidth: 56,
                    textAlign: "center",
                  }}
                >
                  {s.short}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background:
                      done && next
                        ? s.dot
                        : i < curIdx
                          ? `linear-gradient(to right, ${s.dot}, ${STATUS_TOKENS[next].dot})`
                          : "var(--jt-border)",
                    margin: "0 6px",
                    marginBottom: 22,
                    minWidth: 12,
                    borderRadius: 1,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Activity timeline ---------- */

export interface ActivityEvent {
  date: string;
  text: string;
  status?: JtStatusKey;
}

/**
 * Synthesize an activity feed from the JobApplication record. Used as a
 * fallback for applications that pre-date the activity_events table (no real
 * log to render against).
 */
export function buildSyntheticActivity(app: JobApplication): ActivityEvent[] {
  const created: ActivityEvent = {
    date: format(new Date(app.createdAt), "MMM d"),
    text: `Added ${app.companyName} — ${app.position}`,
    status: "applied",
  };
  const events: ActivityEvent[] = [created];
  if (app.notes && app.notes.trim()) {
    events.push({
      date: format(new Date(app.updatedAt), "MMM d"),
      text: `Note: "${app.notes.slice(0, 120)}${app.notes.length > 120 ? "…" : ""}"`,
    });
  }
  if (app.status && app.status !== "applied") {
    events.push({
      date: format(new Date(app.updatedAt), "MMM d"),
      text: `Status changed to ${STATUS_TOKENS[app.status as JtStatusKey]?.label || app.status}`,
      status: app.status as JtStatusKey,
    });
  }
  return events;
}

/**
 * Live activity feed for a single application. Fetches once when the app
 * becomes available and falls back to the synthetic feed if the table is
 * empty (applications created before logging existed). Newest first.
 *
 * Accepts `app | undefined` so callers can place the hook above their
 * loading-state early-return (rules of hooks).
 */
export function useApplicationActivity(app: JobApplication | undefined): {
  events: ActivityEvent[];
  loading: boolean;
} {
  const [records, setRecords] = React.useState<ActivityEventRecord[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const appId = app?.id;

  React.useEffect(() => {
    if (!appId) return;
    let cancelled = false;
    setLoading(true);
    activityService
      .listForApplication(appId, 100)
      .then((r) => {
        if (!cancelled) setRecords(r);
      })
      .catch(() => {
        if (!cancelled) setRecords([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appId]);

  const events = React.useMemo<ActivityEvent[]>(() => {
    if (!app) return [];
    if (!records || records.length === 0) return buildSyntheticActivity(app);
    return records.map((r) => recordToActivityEvent(r, app));
  }, [records, app]);

  return { events, loading };
}

function recordToActivityEvent(
  r: ActivityEventRecord,
  app: JobApplication,
): ActivityEvent {
  const date = format(new Date(r.createdAt), "MMM d");
  const p = r.payload as Record<string, unknown>;

  switch (r.kind) {
    case "application_created": {
      const company = (p.company as string) || app.companyName;
      const position = (p.position as string) || app.position;
      const via = p.via === "csv_import" ? " (CSV import)" : "";
      return {
        date,
        text: `Added ${company} — ${position}${via}`,
        status: "applied",
      };
    }
    case "status_changed": {
      const to = p.to as JtStatusKey | undefined;
      const label = to ? STATUS_TOKENS[to]?.label || to : "—";
      return {
        date,
        text: `Status changed to ${label}`,
        status: to,
      };
    }
    case "note_added": {
      const note = (p.note as string) || "";
      const truncated = note.length > 120 ? note.slice(0, 120) + "…" : note;
      return {
        date,
        text: truncated ? `Note: "${truncated}"` : "Note updated",
      };
    }
    case "follow_up_set": {
      const d = p.date as string | undefined;
      return {
        date,
        text: d
          ? `Follow-up set for ${format(new Date(d), "MMM d")}`
          : "Follow-up set",
      };
    }
    case "follow_up_cleared":
      return { date, text: "Follow-up cleared" };
    case "follow_up_completed": {
      const d = p.date as string | undefined;
      return {
        date,
        text: d
          ? `Follow-up done (was ${format(new Date(d), "MMM d")})`
          : "Follow-up done",
      };
    }
    case "pinned":
      return { date, text: "Pinned" };
    case "unpinned":
      return { date, text: "Unpinned" };
    case "resume_uploaded":
      return { date, text: "Resume updated" };
    case "contact_added": {
      const name = (p.name as string) || "Contact";
      return { date, text: `Added contact: ${name}` };
    }
    default:
      return { date, text: r.kind.replace(/_/g, " ") };
  }
}

export function JtActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-lg)",
        padding: 22,
        marginTop: 24,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "var(--jt-text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 500,
          marginBottom: 16,
        }}
      >
        Activity
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {events.map((e, i) => {
          const s = e.status ? STATUS_TOKENS[e.status] : null;
          const isLast = i === events.length - 1;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 14,
                paddingBottom: isLast ? 0 : 14,
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexShrink: 0,
                  paddingTop: 3,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 99,
                    background: s ? s.dot : "var(--jt-text-3)",
                    border: "2px solid var(--jt-bg-elev)",
                    boxShadow:
                      "0 0 0 1.5px " + (s ? s.dot : "var(--jt-border)"),
                  }}
                />
                {!isLast && (
                  <div
                    style={{
                      width: 1.5,
                      flex: 1,
                      background: "var(--jt-border)",
                      marginTop: 4,
                      minHeight: 16,
                    }}
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 4 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--jt-text-3)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {e.date}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "var(--jt-text)",
                    marginTop: 2,
                    lineHeight: 1.5,
                  }}
                >
                  {e.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Sidebar (desktop) ---------- */

export function JtDetailSidebar({ app }: { app: JobApplication }) {
  const isOffer = app.status === "offer";
  const lastUpdated = formatDistanceToNow(new Date(app.updatedAt), {
    addSuffix: true,
  });

  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "sticky",
        top: 88,
        alignSelf: "flex-start",
      }}
    >
      <FollowUpCard app={app} />

      {isOffer && (
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--a-100), var(--jt-bg-elev))",
            border: "1px solid var(--a-300)",
            borderRadius: "var(--r-lg)",
            padding: 18,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--a-700)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            <Sparkles size={12} /> Offer details
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--jt-text-2)",
              margin: "0 0 12px",
              lineHeight: 1.55,
            }}
          >
            Capture the offer specifics now while they&apos;re fresh — fuels your analytics.
          </p>
          <JtButton full size="sm" variant="accent">
            Add offer details
          </JtButton>
        </div>
      )}

      <div
        style={{
          background: "var(--jt-bg-elev)",
          border: "1px solid var(--jt-border)",
          borderRadius: "var(--r-lg)",
          padding: 18,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "var(--jt-text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 500,
            marginBottom: 10,
          }}
        >
          Details
        </div>
        <DetailRow
          label="Application date"
          value={format(new Date(app.applicationDate), "MMM d, yyyy")}
          mono
        />
        <DetailRow label="Last updated" value={lastUpdated} />
        <DetailRow label="Source" value={app.source} />
        <DetailRow
          label="Work type"
          value={app.workType.replace(/^\w/, (c) => c.toUpperCase())}
        />
        {app.companySalaryRange && (
          <DetailRow label="Salary" value={app.companySalaryRange} mono />
        )}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--jt-text-3)",
          padding: "0 4px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        Press <span className="kbd">E</span> to edit, <span className="kbd">P</span> to pin
      </div>
    </aside>
  );
}

function FollowUpCard({ app }: { app: JobApplication }) {
  const { setFollowUp, completeFollowUp } = useApplicationStore();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const followUp = app.followUpDate ? new Date(app.followUpDate) : undefined;
  const isCompleted = Boolean(app.followUpCompletedAt);
  const isOverdue =
    followUp !== undefined && !isCompleted && followUp < today;
  const isToday =
    followUp !== undefined && followUp.toDateString() === today.toDateString();

  const handlePick = async (d: Date) => {
    setBusy(true);
    try {
      await setFollowUp(app.id, format(d, "yyyy-MM-dd"));
      setOpen(false);
      toast.success(`We'll nudge you on ${format(d, "MMM d")}.`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleQuick = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    handlePick(d);
  };

  const handleDone = async () => {
    setBusy(true);
    try {
      await completeFollowUp(app.id);
      toast.success("Follow-up marked done.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    setBusy(true);
    try {
      await setFollowUp(app.id, null);
      toast.success("Follow-up cleared.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const accent = isOverdue
    ? "var(--st-rejected)"
    : isToday
      ? "var(--a-500)"
      : "var(--p-500)";

  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: `1px solid ${followUp && !isCompleted ? accent : "var(--jt-border)"}`,
        borderRadius: "var(--r-lg)",
        padding: 18,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "var(--jt-text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 500,
          marginBottom: 12,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Bell size={12} /> Follow-up
      </div>

      {!followUp && (
        <>
          <p
            style={{
              fontSize: 13,
              color: "var(--jt-text-2)",
              margin: "0 0 12px",
              lineHeight: 1.5,
            }}
          >
            Set a reminder so this doesn&apos;t slip into the void.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            <QuickButton onClick={() => handleQuick(3)} disabled={busy}>
              In 3 days
            </QuickButton>
            <QuickButton onClick={() => handleQuick(7)} disabled={busy}>
              In 1 week
            </QuickButton>
            <QuickButton onClick={() => handleQuick(14)} disabled={busy}>
              In 2 weeks
            </QuickButton>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <JtButton full variant="secondary" size="sm" icon={<CalendarIcon size={12} />}>
                Pick a date
              </JtButton>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={followUp}
                onSelect={(d) => d && handlePick(d)}
                disabled={(d) => d < today}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </>
      )}

      {followUp && !isCompleted && (
        <>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: accent,
              marginBottom: 2,
            }}
          >
            {format(followUp, "EEEE, MMM d")}
          </div>
          <div style={{ fontSize: 13, color: "var(--jt-text-2)", marginBottom: 12 }}>
            {isOverdue
              ? `Overdue · ${formatDistanceToNow(followUp, { addSuffix: true })}`
              : isToday
                ? "Today — time to nudge them."
                : formatDistanceToNow(followUp, { addSuffix: true })}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <JtButton
              size="sm"
              variant="accent"
              icon={<Check size={12} />}
              onClick={handleDone}
              disabled={busy}
            >
              Mark done
            </JtButton>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <JtButton size="sm" variant="secondary" icon={<CalendarIcon size={12} />}>
                  Reschedule
                </JtButton>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={followUp}
                  onSelect={(d) => d && handlePick(d)}
                  disabled={(d) => d < today}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <button
              type="button"
              onClick={handleClear}
              disabled={busy}
              aria-label="Clear follow-up"
              style={{
                width: 32,
                background: "transparent",
                border: "1px solid var(--jt-border)",
                borderRadius: "var(--r-md)",
                color: "var(--jt-text-3)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={13} />
            </button>
          </div>
        </>
      )}

      {followUp && isCompleted && (
        <>
          <div
            style={{
              fontSize: 13,
              color: "var(--st-accepted)",
              fontWeight: 600,
              marginBottom: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Check size={14} /> Done
          </div>
          <div style={{ fontSize: 12, color: "var(--jt-text-3)", marginBottom: 12 }}>
            Was due {format(followUp, "MMM d")}
          </div>
          <JtButton
            size="sm"
            variant="secondary"
            full
            icon={<Bell size={12} />}
            onClick={() => setOpen(true)}
            disabled={busy}
          >
            Set another reminder
          </JtButton>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <span hidden />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                onSelect={(d) => d && handlePick(d)}
                disabled={(d) => d < today}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
}

function QuickButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="focus-ring"
      style={{
        padding: "6px 10px",
        background: "var(--jt-bg-sunk)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-md)",
        fontSize: 12,
        color: "var(--jt-text)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid var(--jt-border-2)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--jt-text-2)" }}>{label}</span>
      <span
        className={mono ? "tnum" : ""}
        style={{
          color: "var(--jt-text)",
          fontWeight: 500,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}
