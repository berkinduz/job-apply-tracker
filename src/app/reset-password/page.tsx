"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

import { JtButton, JtLogo } from "@/components/jt/primitives";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={null}>
      <ResetPasswordContent />
    </React.Suspense>
  );
}

function ResetPasswordContent() {
  const supabase = React.useMemo(() => createClient(), []);
  const router = useRouter();
  const search = useSearchParams();
  const requestMode = search?.get("send") === "1";

  const [hasSession, setHasSession] = React.useState<boolean | null>(null);
  const [mode, setMode] = React.useState<"request" | "update" | "sent">(
    requestMode ? "request" : "update",
  );

  React.useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const has = Boolean(data.session);
      setHasSession(has);
      if (!has && !requestMode) setMode("request");
      if (has && !requestMode) setMode("update");
    });
    return () => {
      alive = false;
    };
  }, [supabase, requestMode]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--jt-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <JtLogo size={22} />
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>
            jobtrack
          </span>
        </Link>
        <Link
          href="/login"
          style={{ fontSize: 13, color: "var(--jt-text-3)", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </header>
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          {mode === "request" && <RequestForm onSent={() => setMode("sent")} supabase={supabase} />}
          {mode === "sent" && <SentState onResend={() => setMode("request")} />}
          {mode === "update" && (
            <UpdateForm
              hasSession={hasSession}
              supabase={supabase}
              onSuccess={() => {
                router.push("/applications");
                router.refresh();
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function RequestForm({
  onSent,
  supabase,
}: {
  onSent: (email: string) => void;
  supabase: ReturnType<typeof createClient>;
}) {
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is required");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      onSent(email);
    }
  };

  return (
    <Card title="Reset your password." subtitle="We'll email you a one-time link that lets you set a new password.">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FormField label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={busy}
            style={inputStyle}
          />
        </FormField>
        <JtButton type="submit" size="lg" full disabled={busy}>
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Mail size={16} /> Send reset link
            </>
          )}
        </JtButton>
      </form>
    </Card>
  );
}

function SentState({ onResend }: { onResend: () => void }) {
  const [cooldown, setCooldown] = React.useState(60);
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);
  return (
    <Card
      title="Check your inbox."
      subtitle="Click the link in the email to set a new password. The link expires in 60 minutes."
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 14,
          background: "var(--jt-bg-sunk)",
          borderRadius: "var(--r-md)",
          fontSize: 13,
          color: "var(--jt-text-2)",
        }}
      >
        <Mail size={18} color="var(--jt-text-3)" />
        Don&apos;t forget to check spam.
      </div>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <button
          type="button"
          disabled={cooldown > 0}
          onClick={onResend}
          style={{
            background: "transparent",
            border: "none",
            color: cooldown > 0 ? "var(--jt-text-3)" : "var(--p-600)",
            fontSize: 13,
            fontWeight: 500,
            cursor: cooldown > 0 ? "not-allowed" : "pointer",
          }}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
        </button>
      </div>
    </Card>
  );
}

function UpdateForm({
  hasSession,
  supabase,
  onSuccess,
}: {
  hasSession: boolean | null;
  supabase: ReturnType<typeof createClient>;
  onSuccess: () => void;
}) {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  if (hasSession === null) return <Card title="Loading…" subtitle="" />;

  if (hasSession === false) {
    return (
      <Card
        title="Reset link expired."
        subtitle="The link you used is missing or expired. Request a new one."
      >
        <Link href="/reset-password?send=1">
          <JtButton size="lg" full>
            Request new link
          </JtButton>
        </Link>
      </Card>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password should be at least 8 characters");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(onSuccess, 1500);
  };

  if (success) {
    return (
      <Card title="Password updated." subtitle="Redirecting you to JobTrack…">
        <div
          className="jt-pulse"
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "var(--st-accepted-bg)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <Check size={28} color="var(--st-accepted)" />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Set a new password." subtitle="Choose something memorable — at least 8 characters.">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FormField label="New password">
          <input
            type="password"
            required
            value={password}
            minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={busy}
            autoComplete="new-password"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Confirm password">
          <input
            type="password"
            required
            value={confirm}
            minLength={8}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            disabled={busy}
            autoComplete="new-password"
            style={inputStyle}
          />
        </FormField>
        <JtButton type="submit" size="lg" full disabled={busy}>
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Updating…
            </>
          ) : (
            "Update password"
          )}
        </JtButton>
      </form>
    </Card>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-lg)",
        padding: 28,
        boxShadow: "var(--sh-sm)",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: "var(--jt-text-2)", fontSize: 14, margin: "6px 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--jt-text)", letterSpacing: "-0.005em" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  padding: "0 12px",
  background: "var(--jt-bg-elev)",
  border: "1.5px solid var(--jt-border)",
  borderRadius: "var(--r-md)",
  color: "var(--jt-text)",
  fontSize: 14,
  fontFamily: "var(--font-sans)",
  letterSpacing: "-0.005em",
  outline: "none",
};
