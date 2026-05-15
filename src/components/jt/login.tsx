"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { JtButton, JtLogo, JtPill } from "@/components/jt/primitives";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "magic";

const QUOTES = [
  {
    quote:
      "I went from 'Excel chaos' to 'I know exactly what's pending' in one evening.",
    name: "Maya P.",
    role: "Frontend Engineer · bootcamp grad",
  },
  {
    quote:
      "The funnel view made me realize cold applications were a waste. Pivoted to referrals — got 3 offers.",
    name: "Diego R.",
    role: "Backend Engineer",
  },
  {
    quote:
      "Stale reminders alone saved two interview rounds I would have ghosted.",
    name: "Jules T.",
    role: "Product Designer",
  },
];

export function JtLogin() {
  const router = useRouter();
  const search = useSearchParams();
  const initialMode: Mode = search?.get("mode") === "signup" ? "signup" : "signin";

  const [mode, setMode] = React.useState<Mode>(initialMode);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [magicSent, setMagicSent] = React.useState<string | null>(null);
  const [quoteIdx, setQuoteIdx] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const supabase = React.useMemo(() => createClient(), []);
  const next = search?.get("next") || "/applications";

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      toast.error("Password should be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          },
        });
        if (error) throw error;
        toast.success("Check your inbox to confirm your email.");
        setBusy(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push(next);
      router.refresh();
    } catch (err) {
      const msg = (err as Error).message || "Something went wrong";
      if (/Invalid login/i.test(msg)) {
        toast.error("Email or password isn't right. Try again or reset.");
      } else if (/not confirmed/i.test(msg)) {
        toast.error("Confirm your email first — check your inbox.");
      } else {
        toast.error(msg);
      }
      setBusy(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is required");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            next,
          )}`,
        },
      });
      if (error) throw error;
      setMagicSent(email);
      toast.success("Magic link sent — check your inbox.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "github") => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      toast.error(error.message);
      setBusy(false);
    }
  };

  const heading =
    mode === "signin"
      ? "Welcome back."
      : mode === "signup"
        ? "Let's get you tracking."
        : "Sign in without a password.";
  const subline =
    mode === "signin"
      ? "Pick up where you left off."
      : mode === "signup"
        ? "30-second signup. Free, forever."
        : "We'll email you a one-tap sign-in link.";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--jt-bg)",
        color: "var(--jt-text)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top thin header for mobile — just a back link; brand logo lives in the form panel/aside */}
      <header
        className="jt-only-mobile"
        style={{
          padding: "14px 20px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Link
          href="/"
          style={{ fontSize: 13, color: "var(--jt-text-3)" }}
        >
          ← Home
        </Link>
      </header>

      <div className="jt-login-grid">
        {/* Left brand panel */}
        <aside className="jt-login-aside">
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "32px 40px 0",
              color: "#fff",
              position: "relative",
              zIndex: 2,
            }}
          >
            <JtLogo size={26} color="#fff" />
            <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: "-0.02em" }}>
              jobtrack
            </span>
          </Link>
          <BrandMockup />
          <div className="jt-login-quote">
            <Sparkles size={14} color="var(--a-300)" />
            <p key={quoteIdx} className="jt-login-quote-text">
              &ldquo;{QUOTES[quoteIdx].quote}&rdquo;
            </p>
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "rgba(255,255,255,0.72)",
              }}
            >
              — {QUOTES[quoteIdx].name},{" "}
              <span style={{ color: "rgba(255,255,255,0.52)" }}>
                {QUOTES[quoteIdx].role}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
              {QUOTES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuoteIdx(i)}
                  aria-label={`Quote ${i + 1}`}
                  style={{
                    width: i === quoteIdx ? 24 : 6,
                    height: 6,
                    borderRadius: 99,
                    background:
                      i === quoteIdx ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 200ms var(--jt-ease)",
                  }}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Right form panel */}
        <section className="jt-login-form-wrap">
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              padding: "32px 24px",
            }}
          >
            {magicSent ? (
              <MagicLinkSent email={magicSent} onBack={() => setMagicSent(null)} />
            ) : (
              <>
                <div style={{ marginBottom: 28 }}>
                  <h1
                    style={{
                      fontSize: "clamp(24px, 4vw, 30px)",
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                      margin: 0,
                    }}
                  >
                    {heading}
                  </h1>
                  <p style={{ color: "var(--jt-text-2)", margin: "8px 0 0", fontSize: 15 }}>
                    {subline}
                  </p>
                </div>

                {mode === "magic" ? (
                  <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <FieldEmail value={email} onChange={setEmail} disabled={busy} />
                    <JtButton type="submit" size="lg" full disabled={busy}>
                      {busy ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Sending…
                        </>
                      ) : (
                        <>
                          <Mail size={16} /> Email me a sign-in link
                        </>
                      )}
                    </JtButton>
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--jt-text-2)",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      ← Use a password instead
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <FieldEmail value={email} onChange={setEmail} disabled={busy} />
                    <FieldPassword
                      value={password}
                      onChange={setPassword}
                      disabled={busy}
                      showStrength={mode === "signup"}
                      hint={
                        mode === "signin" ? (
                          <Link
                            href="/reset-password?send=1"
                            style={{
                              fontSize: 12,
                              color: "var(--jt-text-2)",
                            }}
                          >
                            Forgot?
                          </Link>
                        ) : undefined
                      }
                    />
                    <JtButton type="submit" size="lg" full disabled={busy}>
                      {busy ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          {mode === "signup" ? "Creating account…" : "Signing in…"}
                        </>
                      ) : (
                        <>
                          <Mail size={16} />
                          {mode === "signup" ? "Create account" : "Sign in with email"}
                        </>
                      )}
                    </JtButton>
                    <button
                      type="button"
                      onClick={() => setMode("magic")}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--p-600)",
                        fontSize: 13,
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Or email me a magic link instead →
                    </button>
                  </form>
                )}

                <Divider label="Or continue with" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <JtButton
                    variant="secondary"
                    onClick={() => oauth("google")}
                    disabled={busy}
                  >
                    <GoogleIcon /> Google
                  </JtButton>
                  <JtButton
                    variant="secondary"
                    onClick={() => oauth("github")}
                    disabled={busy}
                  >
                    <GithubIcon /> GitHub
                  </JtButton>
                </div>

                <p
                  style={{
                    marginTop: 24,
                    textAlign: "center",
                    fontSize: 13,
                    color: "var(--jt-text-2)",
                  }}
                >
                  {mode === "signin" ? (
                    <>
                      New here?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--p-600)",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Create an account →
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signin")}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--p-600)",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Sign in →
                      </button>
                    </>
                  )}
                </p>
              </>
            )}

            <p
              style={{
                marginTop: 32,
                textAlign: "center",
                fontSize: 11,
                color: "var(--jt-text-3)",
                lineHeight: 1.5,
              }}
            >
              By continuing you agree to our{" "}
              <Link href="#" style={{ color: "var(--jt-text-2)", textDecoration: "underline" }}>
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" style={{ color: "var(--jt-text-2)", textDecoration: "underline" }}>
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function FieldEmail({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div>
      <label style={fieldLabel}>Email</label>
      <div style={fieldWrap(focused)}>
        <input
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          required
          style={fieldInput}
        />
      </div>
    </div>
  );
}

function FieldPassword({
  value,
  onChange,
  disabled,
  showStrength,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  showStrength?: boolean;
  hint?: React.ReactNode;
}) {
  const [focused, setFocused] = React.useState(false);
  const strength = passwordStrength(value);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={fieldLabel}>Password</label>
        {hint && <span>{hint}</span>}
      </div>
      <div style={fieldWrap(focused)}>
        <input
          type="password"
          autoComplete={showStrength ? "new-password" : "current-password"}
          placeholder="••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          required
          minLength={showStrength ? 8 : undefined}
          style={fieldInput}
        />
      </div>
      {showStrength && value.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <div
            style={{
              display: "flex",
              gap: 3,
              height: 4,
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  background:
                    i < strength.score
                      ? strength.color
                      : "var(--jt-border)",
                  borderRadius: 99,
                  transition: "background 200ms var(--jt-ease)",
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 11, color: strength.color, marginTop: 4, fontWeight: 500 }}>
            {strength.label}
          </div>
        </div>
      )}
    </div>
  );
}

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--jt-text)",
  marginBottom: 6,
  letterSpacing: "-0.005em",
};

function fieldWrap(focused: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    height: 42,
    padding: "0 12px",
    background: "var(--jt-bg-elev)",
    border: focused ? "1.5px solid var(--p-500)" : "1.5px solid var(--jt-border)",
    boxShadow: focused ? "0 0 0 3px var(--p-100)" : "none",
    borderRadius: "var(--r-md)",
    transition: "all 120ms var(--jt-ease)",
  };
}

const fieldInput: React.CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  color: "var(--jt-text)",
  fontSize: 14,
  fontFamily: "var(--font-sans)",
  letterSpacing: "-0.005em",
};

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  if (!pw) return { score: 0, label: "—", color: "var(--jt-text-3)" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (pw.length >= 14) score = Math.min(4, score + 1);
  const map: Record<number, { label: string; color: string }> = {
    0: { label: "Too short", color: "var(--st-rejected)" },
    1: { label: "Weak", color: "var(--st-rejected)" },
    2: { label: "Okay", color: "var(--a-600)" },
    3: { label: "Strong", color: "var(--st-accepted)" },
    4: { label: "Very strong", color: "var(--st-accepted)" },
  };
  return { score: score as 0 | 1 | 2 | 3 | 4, ...map[score] };
}

function Divider({ label }: { label: string }) {
  return (
    <div
      style={{
        position: "relative",
        margin: "24px 0",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, height: 1, background: "var(--jt-border)" }} />
      <span
        style={{
          fontSize: 11,
          color: "var(--jt-text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--jt-border)" }} />
    </div>
  );
}

function MagicLinkSent({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div
        className="jt-pulse"
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: "var(--p-50)",
          border: "1px solid var(--p-100)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <Mail size={28} color="var(--p-500)" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
        Check your inbox.
      </h2>
      <p style={{ fontSize: 14, color: "var(--jt-text-2)", margin: "0 0 18px" }}>
        We sent a sign-in link to <strong style={{ color: "var(--jt-text)" }}>{email}</strong>.
        It expires in 15 minutes.
      </p>
      <JtPill bg="var(--jt-bg-sunk)" color="var(--jt-text-2)" size="sm">
        Tip: don&apos;t forget to check spam.
      </JtPill>
      <div style={{ marginTop: 22 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--p-600)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          ← Use a different email
        </button>
      </div>
    </div>
  );
}

/* ---------- Brand mockup (replaces stock photo) ---------- */

function BrandMockup() {
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12), transparent 50%), radial-gradient(circle at 80% 70%, rgba(245,184,66,0.15), transparent 50%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          borderRadius: 18,
          padding: 18,
          width: "85%",
          maxWidth: 420,
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: "#FF5F57" }} />
          <span style={{ width: 9, height: 9, borderRadius: 99, background: "#FEBC2E" }} />
          <span style={{ width: 9, height: 9, borderRadius: 99, background: "#28C840" }} />
          <span
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              fontFamily: "var(--font-mono)",
            }}
          >
            jobtrack.com/applications
          </span>
        </div>
        {[
          { c: "Stripe", r: "Senior Frontend", s: "Applied", dot: "#94A2B8", bg: "rgba(148,162,184,0.18)" },
          { c: "Figma", r: "Product Designer", s: "HR Interview", dot: "#5AC4D2", bg: "rgba(90,196,210,0.18)" },
          { c: "Anthropic", r: "Software Engineer", s: "Offer", dot: "#F5B842", bg: "rgba(245,184,66,0.2)", glow: true },
          { c: "Linear", r: "Design Engineer", s: "Test", dot: "#9B7AE5", bg: "rgba(155,122,229,0.18)" },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10,
              marginBottom: 6,
              borderLeft: `3px solid ${row.dot}`,
              boxShadow: row.glow ? "0 0 0 1px var(--a-500)" : "none",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: row.dot,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {row.c.slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: "-0.01em" }}>
                {row.c}
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{row.r}</div>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "3px 9px",
                borderRadius: 99,
                background: row.bg,
                color: row.dot,
              }}
            >
              {row.s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
