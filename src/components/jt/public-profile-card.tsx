"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Globe,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { JtButton } from "@/components/jt/primitives";
import {
  checkHandle,
  savePublicProfile,
  type HandleCheckResult,
} from "@/app/settings/public-profile-actions";
import { siteConfig } from "@/config/site";

type Saved = {
  enabled: boolean;
  handle: string | null;
  showCompanies: boolean;
  displayName: string | null;
};

export function PublicProfileCard({ initial }: { initial: Saved }) {
  const [enabled, setEnabled] = React.useState(initial.enabled);
  const [handle, setHandle] = React.useState(initial.handle || "");
  const [displayName, setDisplayName] = React.useState(initial.displayName || "");
  const [showCompanies, setShowCompanies] = React.useState(initial.showCompanies);
  const [busy, setBusy] = React.useState(false);
  const [check, setCheck] = React.useState<HandleCheckResult | null>(null);
  const [checking, setChecking] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const dirty =
    enabled !== initial.enabled ||
    (handle || "").toLowerCase() !== (initial.handle || "").toLowerCase() ||
    displayName !== (initial.displayName || "") ||
    showCompanies !== initial.showCompanies;

  // Debounced uniqueness check as the user types.
  React.useEffect(() => {
    if (!handle.trim()) {
      setCheck(null);
      return;
    }
    setChecking(true);
    const id = setTimeout(async () => {
      try {
        const r = await checkHandle(handle);
        setCheck(r);
      } finally {
        setChecking(false);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [handle]);

  const url = handle
    ? `${siteConfig.url}/u/${handle.toLowerCase()}`
    : `${siteConfig.url}/u/your-handle`;

  const handleSave = async () => {
    setBusy(true);
    try {
      const r = await savePublicProfile({
        enabled,
        handle: handle.trim() || null,
        showCompanies,
        displayName: displayName.trim() || null,
      });
      if (r.ok) {
        toast.success(enabled ? "Public profile is live." : "Saved.");
      } else {
        toast.error(r.error);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy. Select and copy manually.");
    }
  };

  const handleStatus: React.ReactNode = (() => {
    if (!handle.trim()) return null;
    if (checking) {
      return (
        <span style={{ color: "var(--jt-text-3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Loader2 size={11} className="animate-spin" /> checking
        </span>
      );
    }
    if (!check) return null;
    if (check.ok && check.available) {
      return (
        <span style={{ color: "var(--st-accepted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Check size={11} /> available
        </span>
      );
    }
    if (check.ok && !check.available && check.reason === "yours") {
      return <span style={{ color: "var(--jt-text-3)" }}>your current handle</span>;
    }
    if (check.ok && !check.available && check.reason === "taken") {
      return <span style={{ color: "var(--st-rejected)" }}>taken</span>;
    }
    if (!check.ok && check.reason === "invalid") {
      return <span style={{ color: "var(--st-rejected)" }}>invalid — a–z, 0–9, _, -</span>;
    }
    if (!check.ok && check.reason === "reserved") {
      return <span style={{ color: "var(--st-rejected)" }}>reserved</span>;
    }
    return null;
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <ToggleRow
          label="Enable public profile"
          hint="A read-only page that shows your funnel stats. You decide whether company names are visible."
          checked={enabled}
          onChange={setEnabled}
          icon={enabled ? <Globe size={14} color="var(--st-accepted)" /> : <Lock size={14} color="var(--jt-text-3)" />}
        />
      </div>

      <div>
        <label style={fieldLabel}>Display name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Berkin Duz"
          maxLength={64}
          style={inputStyle}
        />
        <div style={hintStyle}>Optional — shown as the page title.</div>
      </div>

      <div>
        <label style={fieldLabel}>Handle</label>
        <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
          <span
            style={{
              ...inputStyle,
              flex: "0 0 auto",
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              borderRight: "none",
              color: "var(--jt-text-3)",
              fontFamily: "var(--font-mono)",
              display: "inline-flex",
              alignItems: "center",
              padding: "0 10px",
            }}
          >
            jobtrack.com/u/
          </span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase())}
            placeholder="berkin"
            maxLength={32}
            style={{
              ...inputStyle,
              flex: 1,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              fontFamily: "var(--font-mono)",
            }}
          />
        </div>
        <div style={{ ...hintStyle, display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span>2–32 characters, lowercase letters, digits, _ and -</span>
          <span>{handleStatus}</span>
        </div>
      </div>

      <ToggleRow
        label="Show company names"
        hint="Off: only aggregate funnel percentages. On: show your offers/interviews with company + role (good for flexing, bad for stealth job hunts)."
        checked={showCompanies}
        onChange={setShowCompanies}
      />

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: "10px 12px",
          background: "var(--jt-bg-sunk)",
          border: "1px dashed var(--jt-border)",
          borderRadius: "var(--r-md)",
          fontSize: 12,
          color: "var(--jt-text-2)",
          fontFamily: "var(--font-mono)",
          overflow: "hidden",
        }}
      >
        <Globe size={13} color="var(--jt-text-3)" />
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {url}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy link"
          style={{
            background: "transparent",
            border: "none",
            color: copied ? "var(--st-accepted)" : "var(--jt-text-3)",
            cursor: "pointer",
            padding: 4,
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
        {initial.enabled && initial.handle && (
          <Link
            href={`/u/${initial.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open"
            style={{ color: "var(--jt-text-3)", padding: 4 }}
          >
            <ExternalLink size={13} />
          </Link>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <JtButton
          type="button"
          onClick={handleSave}
          disabled={busy || !dirty}
          icon={
            busy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )
          }
        >
          {busy ? "Saving…" : enabled ? "Save & publish" : "Save"}
        </JtButton>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  icon,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--jt-text)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {icon}
          {label}
        </div>
        {hint && (
          <div
            style={{
              fontSize: 12,
              color: "var(--jt-text-3)",
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            {hint}
          </div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="focus-ring"
        style={{
          width: 42,
          height: 24,
          background: checked ? "var(--p-500)" : "var(--jt-bg-sunk)",
          border: `1.5px solid ${checked ? "var(--p-500)" : "var(--jt-border)"}`,
          borderRadius: 99,
          position: "relative",
          cursor: "pointer",
          padding: 0,
          marginTop: 4,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: checked ? 20 : 2,
            transform: "translateY(-50%)",
            width: 16,
            height: 16,
            borderRadius: 99,
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 150ms var(--jt-ease)",
          }}
        />
      </button>
    </div>
  );
}

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--jt-text)",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  height: 40,
  padding: "0 12px",
  background: "var(--jt-bg-elev)",
  border: "1.5px solid var(--jt-border)",
  borderRadius: "var(--r-md)",
  color: "var(--jt-text)",
  fontSize: 14,
  fontFamily: "var(--font-sans)",
  letterSpacing: "-0.005em",
  outline: "none",
  width: "100%",
};

const hintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--jt-text-3)",
  marginTop: 6,
};
