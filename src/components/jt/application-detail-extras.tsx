"use client";

import * as React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Bell, Plus, Sparkles } from "lucide-react";

import {
  JtButton,
  JtDot,
  STATUS_TOKENS,
  PIPELINE_STATUSES,
  type JtStatusKey,
} from "@/components/jt/primitives";
import type { JobApplication, ApplicationStatus } from "@/types";

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
 * Synthesize a minimal activity feed from the JobApplication record.
 * The full feed will come from a dedicated table; for now we render
 * the “created” and “last updated” signposts plus inline notes.
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
            marginBottom: 12,
          }}
        >
          Quick actions
        </div>
        <JtButton full size="md" icon={<Bell size={14} />}>
          Set follow-up
        </JtButton>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          <JtButton full variant="secondary" size="sm" icon={<Plus size={12} />}>
            Add contact
          </JtButton>
          <JtButton full variant="secondary" size="sm" icon={<Plus size={12} />}>
            Upload resume version
          </JtButton>
          <JtButton full variant="secondary" size="sm" icon={<Plus size={12} />}>
            Add note
          </JtButton>
        </div>
      </div>

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
