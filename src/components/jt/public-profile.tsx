import { format, formatDistanceToNow } from "date-fns";
import { Sparkles, Flame, Target, Briefcase, Check } from "lucide-react";
import { JtDot, STATUS_TOKENS, type JtStatusKey } from "@/components/jt/primitives";
import type { PublicProfile } from "@/lib/public-profile/stats";

/**
 * Read-only public profile renderer. No store / hooks — keeps it RSC-friendly.
 */
export function JtPublicProfile({ profile }: { profile: PublicProfile }) {
  const { displayName, totalApplications } = profile;

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "40px 20px 80px",
      }}
    >
      {/* Hero block */}
      <section style={{ marginBottom: 36 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            color: "var(--p-700)",
            background: "var(--p-50)",
            border: "1px solid var(--p-100)",
            padding: "4px 10px",
            borderRadius: 999,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 16,
          }}
        >
          <Sparkles size={11} /> Public profile
        </div>
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 44px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          {displayName}
        </h1>
        <p
          style={{
            color: "var(--jt-text-2)",
            fontSize: 16,
            margin: "8px 0 0",
            lineHeight: 1.55,
          }}
        >
          {totalApplications === 0
            ? "Just getting started. The pipeline opens soon."
            : phrase(profile)}
        </p>
      </section>

      {/* Stat strip */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 36,
        }}
      >
        <Metric
          label="Applications"
          value={totalApplications.toString()}
          accent="var(--jt-text)"
          icon={<Briefcase size={14} />}
        />
        <Metric
          label="Response rate"
          value={`${profile.responseRatePercent}%`}
          accent={profile.responseRatePercent >= 20 ? "var(--st-accepted)" : "var(--jt-text)"}
          icon={<Target size={14} />}
        />
        <Metric
          label="Offers"
          value={profile.offerCount.toString()}
          accent={profile.offerCount > 0 ? "var(--a-600)" : "var(--jt-text)"}
          icon={<Sparkles size={14} />}
        />
        <Metric
          label="Streak"
          value={
            profile.streakWeeks > 0
              ? `${profile.streakWeeks} wk${profile.streakWeeks === 1 ? "" : "s"}`
              : "—"
          }
          accent={profile.streakWeeks >= 4 ? "var(--st-tech)" : "var(--jt-text)"}
          icon={<Flame size={14} />}
        />
      </section>

      {/* Funnel */}
      {totalApplications > 0 && (
        <section style={{ marginBottom: 36 }}>
          <SectionTitle>Funnel</SectionTitle>
          <div
            style={{
              background: "var(--jt-bg-elev)",
              border: "1px solid var(--jt-border)",
              borderRadius: "var(--r-lg)",
              padding: 20,
            }}
          >
            {profile.funnel.map((step) => {
              const token = STATUS_TOKENS[step.key as JtStatusKey];
              return (
                <div
                  key={step.key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 80px",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 0",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--jt-text-2)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {token && <JtDot color={token.dot} size={7} />}
                    {step.label}
                  </div>
                  <div
                    style={{
                      height: 12,
                      background: "var(--jt-bg-sunk)",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${step.ratePercent}%`,
                        background: token?.dot || "var(--jt-text-3)",
                        opacity: 0.9,
                        transition: "width 600ms var(--jt-ease)",
                      }}
                    />
                  </div>
                  <div
                    className="tnum"
                    style={{
                      fontSize: 13,
                      textAlign: "right",
                      color: "var(--jt-text)",
                      fontWeight: 600,
                    }}
                  >
                    {step.ratePercent}%
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Highlights — only if user opted in */}
      {profile.showCompanies && profile.highlights.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <SectionTitle>Highlights</SectionTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            {profile.highlights.map((h) => {
              const token = STATUS_TOKENS[h.status as JtStatusKey];
              return (
                <div
                  key={`${h.companyName}-${h.position}`}
                  style={{
                    background: "var(--jt-bg-elev)",
                    border: "1px solid var(--jt-border)",
                    borderRadius: "var(--r-md)",
                    padding: "12px 14px",
                    borderLeft: `3px solid ${token?.dot || "var(--jt-text-3)"}`,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>
                    {h.companyName}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--jt-text-2)", marginTop: 2 }}
                  >
                    {h.position}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: token?.dot,
                      fontWeight: 600,
                      marginTop: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {h.status === "accepted" || h.status === "offer" ? (
                      <Check size={11} />
                    ) : null}
                    {token?.label || h.status}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Sources */}
      {profile.topSources.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <SectionTitle>Where applications came from</SectionTitle>
          <div
            style={{
              background: "var(--jt-bg-elev)",
              border: "1px solid var(--jt-border)",
              borderRadius: "var(--r-lg)",
              padding: 20,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {profile.topSources.map((s) => (
              <span
                key={s.source}
                style={{
                  padding: "6px 12px",
                  background: "var(--jt-bg-sunk)",
                  border: "1px solid var(--jt-border)",
                  borderRadius: 999,
                  fontSize: 13,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ fontWeight: 500 }}>{s.source}</span>
                <span className="tnum" style={{ color: "var(--jt-text-3)" }}>
                  {s.count}
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      <footer
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: "1px solid var(--jt-border-2)",
          color: "var(--jt-text-3)",
          fontSize: 12,
          textAlign: "center",
        }}
      >
        Tracked on{" "}
        <a href="/" style={{ color: "var(--p-600)", fontWeight: 500 }}>
          jobtrack
        </a>{" "}
        · joined {format(new Date(profile.joinedAt), "MMMM yyyy")} · last applied{" "}
        {formatDistanceToNow(new Date(profile.lastActiveAt), { addSuffix: true })}
      </footer>
    </main>
  );
}

function phrase(p: PublicProfile): string {
  const parts: string[] = [];
  parts.push(
    `${p.totalApplications} application${p.totalApplications === 1 ? "" : "s"} sent`,
  );
  if (p.responseRatePercent > 0) {
    parts.push(`${p.responseRatePercent}% response rate`);
  }
  if (p.offerCount > 0) {
    parts.push(
      `${p.offerCount} offer${p.offerCount === 1 ? "" : "s"} along the way`,
    );
  }
  if (p.weeklyApplied > 0) {
    parts.push(`${p.weeklyApplied} this week`);
  }
  return parts.join(" · ") + ".";
}

function Metric({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-lg)",
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 500,
          color: "var(--jt-text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {icon} {label}
      </div>
      <div
        className="tnum"
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginTop: 4,
          color: accent,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "var(--jt-text-3)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}
