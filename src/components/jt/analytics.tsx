"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Sparkles, TrendingUp, AlertTriangle, Info } from "lucide-react";
import type {
  AnalyticsData,
  FunnelStage,
  SourcePerf,
  Slice,
  Insight,
} from "@/lib/analytics-service";

export function JtAnalytics({ data }: { data: AnalyticsData }) {
  const isEmpty = data.totalApplications === 0;
  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "24px 16px 48px",
      }}
      className="sm:!px-8"
    >
      <Header />
      {isEmpty ? <EmptyAnalytics /> : <AnalyticsBody data={data} />}
    </main>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1
        style={{
          fontSize: "clamp(24px, 4vw, 30px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          margin: 0,
        }}
      >
        Analytics
      </h1>
      <p style={{ color: "var(--jt-text-2)", margin: "4px 0 0", fontSize: 14 }}>
        Where your applications are landing and what&apos;s actually working.
      </p>
    </div>
  );
}

function AnalyticsBody({ data }: { data: AnalyticsData }) {
  return (
    <>
      <MetricStrip data={data} />
      <div style={{ marginTop: 18 }}>
        <Insights insights={data.insights} />
      </div>
      <div
        className="jt-analytics-grid"
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
        }}
      >
        <Funnel data={data.funnel} />
        <SourceBreakdown data={data.sourcePerf} />
      </div>
      <div
        className="jt-analytics-grid"
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
        }}
      >
        <WeeklyActivity weekly={data.weeklyActivity} />
        <Donut title="Application status" data={data.statusDistribution} />
      </div>
      <div
        className="jt-analytics-grid"
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
        }}
      >
        <Donut title="Work type" data={data.workTypeDistribution} />
        <div />
      </div>
    </>
  );
}

function MetricStrip({ data }: { data: AnalyticsData }) {
  const items: { label: string; value: string; sub?: string }[] = [
    { label: "Total", value: String(data.totalApplications), sub: "all time" },
    { label: "Active", value: String(data.activeApplications), sub: "in flight" },
    {
      label: "Response rate",
      value: `${data.responseRate}%`,
      sub: "interview or better",
    },
    {
      label: "Avg response",
      value:
        data.avgResponseDays !== null ? `${data.avgResponseDays}d` : "—",
      sub: "apply → first move",
    },
  ];
  return (
    <div
      className="jt-metric-strip"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 10,
      }}
    >
      {items.map((m) => (
        <div
          key={m.label}
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
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}
          >
            {m.label}
          </div>
          <div
            className="tnum"
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              marginTop: 4,
            }}
          >
            {m.value}
          </div>
          {m.sub && (
            <div style={{ fontSize: 12, color: "var(--jt-text-3)", marginTop: 2 }}>
              {m.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Insights({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;
  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-lg)",
        padding: 20,
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
        <Sparkles size={12} color="var(--a-500)" /> Insights
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {insights.map((i, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              fontSize: 14,
              lineHeight: 1.55,
              color: "var(--jt-text)",
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                flexShrink: 0,
                borderRadius: 99,
                background:
                  i.kind === "good"
                    ? "var(--st-accepted-bg)"
                    : i.kind === "warn"
                      ? "var(--a-100)"
                      : "var(--p-50)",
                color:
                  i.kind === "good"
                    ? "var(--st-accepted)"
                    : i.kind === "warn"
                      ? "var(--a-700)"
                      : "var(--p-600)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i.kind === "good" ? (
                <TrendingUp size={12} />
              ) : i.kind === "warn" ? (
                <AlertTriangle size={12} />
              ) : (
                <Info size={12} />
              )}
            </span>
            <p style={{ margin: 0, paddingTop: 2 }}>{i.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Funnel({ data }: { data: FunnelStage[] }) {
  if (data.length === 0) return null;
  return (
    <Section title="Pipeline funnel" subtitle="How far each application made it.">
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map((stage) => (
          <div key={stage.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 96, fontSize: 13, color: "var(--jt-text-2)" }}>
              {stage.label}
            </div>
            <div
              style={{
                flex: 1,
                position: "relative",
                height: 24,
                background: "var(--jt-bg-sunk)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.max(stage.pct, 2)}%`,
                  height: "100%",
                  background: stage.color,
                  opacity: 0.85,
                  borderRadius: 4,
                  transition: "width 350ms var(--jt-ease)",
                }}
              />
            </div>
            <div
              className="tnum"
              style={{
                width: 72,
                fontSize: 13,
                color: "var(--jt-text)",
                fontWeight: 500,
                textAlign: "right",
              }}
            >
              {stage.count}
              <span style={{ color: "var(--jt-text-3)", fontWeight: 400, marginLeft: 6 }}>
                {stage.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SourceBreakdown({ data }: { data: SourcePerf[] }) {
  return (
    <Section
      title="Source performance"
      subtitle="Which channels are pulling their weight."
    >
      {data.length === 0 ? (
        <p style={{ color: "var(--jt-text-3)", fontSize: 14, margin: 0 }}>
          Not enough data yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.map((s) => (
            <div
              key={s.source}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ width: 110, fontSize: 13, color: "var(--jt-text-2)" }}>
                {s.source}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 8,
                  background: "var(--jt-bg-sunk)",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${s.rate}%`,
                    height: "100%",
                    background: "var(--p-500)",
                    borderRadius: 99,
                    transition: "width 350ms var(--jt-ease)",
                  }}
                />
              </div>
              <div
                className="tnum"
                style={{
                  width: 92,
                  fontSize: 12,
                  color: "var(--jt-text-2)",
                  textAlign: "right",
                }}
              >
                <span style={{ color: "var(--jt-text)", fontWeight: 500 }}>{s.rate}%</span>{" "}
                · {s.total} apps
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function WeeklyActivity({
  weekly,
}: {
  weekly: { name: string; applications: number }[];
}) {
  return (
    <Section title="Weekly activity" subtitle="Applications you logged each week.">
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekly} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--jt-text-3)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--jt-border)" }}
            />
            <YAxis
              tick={{ fill: "var(--jt-text-3)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--jt-bg-sunk)" }}
              contentStyle={{
                background: "var(--jt-bg-elev)",
                border: "1px solid var(--jt-border)",
                borderRadius: 10,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--jt-text-2)" }}
            />
            <Bar dataKey="applications" fill="var(--p-500)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}

function Donut({ title, data }: { title: string; data: Slice[] }) {
  if (data.length === 0) {
    return (
      <Section title={title} subtitle="No data yet.">
        <div />
      </Section>
    );
  }
  return (
    <Section title={title} subtitle="">
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ width: 180, height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={48}
                outerRadius={78}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--jt-bg-elev)",
                  border: "1px solid var(--jt-border)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, minWidth: 140 }}>
          {data.map((d) => (
            <li
              key={d.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "4px 0",
                fontSize: 13,
                color: "var(--jt-text-2)",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 99,
                  background: d.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}>{d.name}</span>
              <span
                className="tnum"
                style={{ color: "var(--jt-text)", fontWeight: 500 }}
              >
                {d.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-lg)",
        padding: 20,
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: "var(--jt-text-3)", marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyAnalytics() {
  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-lg)",
        padding: 48,
        textAlign: "center",
      }}
    >
      <Sparkles size={28} color="var(--a-500)" style={{ marginBottom: 12 }} />
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          margin: "0 0 8px",
        }}
      >
        Nothing to show yet.
      </h2>
      <p style={{ color: "var(--jt-text-2)", fontSize: 14, margin: "0 auto", maxWidth: 420 }}>
        Add a handful of applications and the funnel will draw itself.
      </p>
    </div>
  );
}

// Silence unused legend import (kept for future feature).
void Legend;
