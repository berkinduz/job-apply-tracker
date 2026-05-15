"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Sparkles,
  Link as LinkIcon,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { JtButton, JtLogo, JtPill } from "@/components/jt/primitives";
import { seedSampleApplications, saveWeeklyGoal } from "@/app/onboarding/actions";

type StartPath = "add" | "sample" | "import" | null;

export function JtOnboarding() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [start, setStart] = React.useState<StartPath>(null);
  const [goal, setGoal] = React.useState(5);
  const [busy, setBusy] = React.useState(false);

  const finish = async () => {
    setBusy(true);
    try {
      await saveWeeklyGoal(goal);
      if (start === "sample") {
        const res = await seedSampleApplications();
        if (!res.ok) {
          toast.error(res.error || "Couldn't seed sample data");
        } else {
          toast.success(`Seeded ${res.count} sample applications`);
        }
      }
      if (start === "add") {
        router.push("/applications/new");
      } else {
        router.push("/applications");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--jt-bg)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "var(--jt-text)",
      }}
    >
      <header
        style={{
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <JtLogo size={22} />
          <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em" }}>
            jobtrack
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <StepIndicator current={step} total={3} />
          <Link
            href="/applications"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--jt-text-3)",
              fontSize: 13,
            }}
          >
            Skip — I&apos;ll figure it out
          </Link>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
        }}
        className="sm:!p-12"
      >
        <div
          style={{
            width: "100%",
            maxWidth: step === 0 ? 720 : 520,
          }}
        >
          {step === 0 && (
            <Step1
              onPick={(v) => {
                setStart(v);
                setStep(1);
              }}
            />
          )}
          {step === 1 && (
            <Step2
              goal={goal}
              setGoal={setGoal}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step3 onDone={finish} start={start} goal={goal} busy={busy} />
          )}
        </div>
      </main>
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: i === current ? 22 : 6,
            height: 6,
            background: i <= current ? "var(--p-500)" : "var(--jt-border)",
            borderRadius: 99,
            transition: "all 250ms var(--jt-ease)",
          }}
        />
      ))}
    </div>
  );
}

function Step1({ onPick }: { onPick: (v: StartPath) => void }) {
  const options: { key: NonNullable<StartPath>; icon: React.ReactNode; title: string; desc: string; tag: string }[] = [
    {
      key: "add",
      icon: <Plus size={22} color="var(--p-500)" />,
      title: "Add my first one",
      desc: "Type a company and role. Done in 20 seconds.",
      tag: "Fastest",
    },
    {
      key: "sample",
      icon: <Sparkles size={22} color="var(--a-600)" />,
      title: "Try with sample data",
      desc: "5 demo applications so you can poke around first.",
      tag: "No commitment",
    },
    {
      key: "import",
      icon: <LinkIcon size={22} color="var(--st-tech)" />,
      title: "Import from a CSV",
      desc: "Bring over your Notion table or spreadsheet.",
      tag: "Coming: Notion + email",
    },
  ];

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 36px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            margin: "0 0 10px",
          }}
        >
          How do you want to start?
        </h1>
        <p style={{ color: "var(--jt-text-2)", fontSize: 16, margin: 0 }}>
          Pick whatever feels easiest — you can change paths anytime.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
        }}
        className="md:!grid-cols-3"
      >
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onPick(o.key)}
            className="focus-ring"
            style={{
              background: "var(--jt-bg-elev)",
              border: "1px solid var(--jt-border)",
              borderRadius: "var(--r-lg)",
              padding: 24,
              textAlign: "left",
              cursor: "pointer",
              transition: "all 200ms var(--jt-ease)",
              color: "var(--jt-text)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              minHeight: 180,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--p-500)";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px var(--p-100), var(--sh-sm)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--jt-border)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "none";
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "var(--jt-bg-sunk)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {o.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "-0.015em",
                  marginBottom: 4,
                }}
              >
                {o.title}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--jt-text-2)", lineHeight: 1.5 }}>
                {o.desc}
              </div>
            </div>
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <JtPill size="sm" bg="var(--jt-bg-sunk)" color="var(--jt-text-3)">
                {o.tag}
              </JtPill>
              <ArrowRight size={16} color="var(--jt-text-3)" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2({
  goal,
  setGoal,
  onNext,
  onBack,
}: {
  goal: number;
  setGoal: (n: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const presets = [3, 5, 10];
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1
          style={{
            fontSize: "clamp(26px, 5vw, 34px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            margin: "0 0 10px",
          }}
        >
          Set a weekly pace.
        </h1>
        <p style={{ color: "var(--jt-text-2)", fontSize: 16, margin: 0 }}>
          We&apos;ll show you the progress without nagging. Skip if it&apos;s not your thing.
        </p>
      </div>
      <div
        style={{
          background: "var(--jt-bg-elev)",
          border: "1px solid var(--jt-border)",
          borderRadius: "var(--r-lg)",
          padding: 28,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--jt-text-2)",
            marginBottom: 14,
          }}
        >
          How many applications a week feels right?
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setGoal(p)}
              className="focus-ring"
              style={{
                padding: "10px 18px",
                borderRadius: "var(--r-md)",
                border:
                  goal === p
                    ? "1.5px solid var(--p-500)"
                    : "1.5px solid var(--jt-border)",
                background: goal === p ? "var(--p-50)" : "var(--jt-bg-elev)",
                color: goal === p ? "var(--p-700)" : "var(--jt-text)",
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 150ms var(--jt-ease)",
              }}
            >
              {p}
              {p === presets[presets.length - 1] ? "+" : ""} / week
            </button>
          ))}
          <div
            style={{
              flex: 1,
              minWidth: 160,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <input
              type="number"
              min={1}
              value={goal}
              onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
              placeholder="Custom"
              style={{
                width: 100,
                height: 38,
                padding: "0 12px",
                background: "var(--jt-bg-elev)",
                border: "1.5px solid var(--jt-border)",
                borderRadius: "var(--r-md)",
                color: "var(--jt-text)",
                fontSize: 14,
                outline: "none",
              }}
            />
            <span style={{ fontSize: 13, color: "var(--jt-text-3)" }}>per week</span>
          </div>
        </div>
        <div
          style={{
            padding: 12,
            background: "var(--jt-bg-sunk)",
            borderRadius: "var(--r-md)",
            fontSize: 13,
            color: "var(--jt-text-2)",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <Sparkles size={14} color="var(--a-600)" style={{ marginTop: 2 }} />
          <div>
            That&apos;s{" "}
            <strong style={{ color: "var(--jt-text)" }}>{goal}</strong> apps per week
            — roughly <span className="mono">{(goal / 5).toFixed(1)}</span> per workday.
            We&apos;ll surface a progress chip on the list page so you know where you stand.
          </div>
        </div>
      </div>
      <div
        style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}
      >
        <JtButton variant="ghost" onClick={onBack} icon={<ArrowLeft />}>
          Back
        </JtButton>
        <div style={{ display: "flex", gap: 8 }}>
          <JtButton variant="ghost" onClick={onNext}>
            Skip
          </JtButton>
          <JtButton onClick={onNext} iconRight={<ArrowRight />}>
            Continue
          </JtButton>
        </div>
      </div>
    </div>
  );
}

function Step3({
  onDone,
  start,
  goal,
  busy,
}: {
  onDone: () => void;
  start: StartPath;
  goal: number;
  busy: boolean;
}) {
  const msg =
    start === "add"
      ? "Let's add your first application."
      : start === "sample"
        ? "We've seeded 5 sample applications. Poke around — they're disposable."
        : start === "import"
          ? "Drop a CSV and we'll match the columns."
          : "You're set.";
  return (
    <div style={{ textAlign: "center" }}>
      <div
        className="jt-pulse"
        style={{
          width: 80,
          height: 80,
          borderRadius: 99,
          background: "var(--p-50)",
          border: "2px solid var(--p-100)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Check size={36} color="var(--p-500)" />
      </div>
      <h1
        style={{
          fontSize: "clamp(26px, 5vw, 34px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          margin: "0 0 10px",
        }}
      >
        You&apos;re set.
      </h1>
      <p
        style={{
          color: "var(--jt-text-2)",
          fontSize: 16,
          margin: "0 auto 8px",
          maxWidth: 380,
        }}
      >
        {msg}
      </p>
      <p style={{ color: "var(--jt-text-3)", fontSize: 13, margin: "0 0 32px" }}>
        Goal locked at {goal} apps / week.
      </p>
      <JtButton
        size="lg"
        onClick={onDone}
        iconRight={<ArrowRight />}
        disabled={busy}
      >
        {busy ? "Setting things up…" : "Let's go"}
      </JtButton>
    </div>
  );
}
