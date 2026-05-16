"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  Monitor,
  Plus,
  X,
  Download,
  Upload,
  Trash2,
  Github,
  Heart,
} from "lucide-react";
import { toast } from "sonner";

import { JtButton, JtPill } from "@/components/jt/primitives";
import { createClient } from "@/lib/supabase/client";
import { CsvImportDialog } from "@/components/jt/csv-import-dialog";
import { PublicProfileCard } from "@/components/jt/public-profile-card";
import { clearAllData, deleteAccount } from "@/app/settings/danger-actions";
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
import { useSettingsStore, useApplicationStore } from "@/store";

export function JtSettings({
  userEmail,
  publicProfileInitial,
}: {
  userEmail?: string | null;
  publicProfileInitial?: {
    enabled: boolean;
    handle: string | null;
    showCompanies: boolean;
    displayName: string | null;
  };
}) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const t = useTranslations();
  const {
    settings,
    updateSettings,
    addCustomSource,
    removeCustomSource,
    addCustomIndustry,
    removeCustomIndustry,
  } = useSettingsStore();
  const { applications, filters, setFilters } = useApplicationStore();
  const [newSource, setNewSource] = React.useState("");
  const [newIndustry, setNewIndustry] = React.useState("");
  const [showClear, setShowClear] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [dangerBusy, setDangerBusy] = React.useState(false);
  const [showImport, setShowImport] = React.useState(false);

  const handleLanguageChange = (locale: "en" | "tr") => {
    updateSettings({ language: locale });
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    router.refresh();
  };

  const handleExport = () => {
    const payload = {
      applications,
      settings,
      exportedAt: new Date().toISOString(),
      version: 1,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobtrack-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };

  return (
    <main
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "24px 16px 48px",
      }}
      className="sm:!px-8"
    >
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 30px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          Settings
        </h1>
        <p style={{ color: "var(--jt-text-2)", margin: "4px 0 0", fontSize: 14 }}>
          Tune JobTrack to fit how you actually search.
        </p>
      </div>

      <Card title="Account">
        <Row>
          <Field label="Email" hint="Linked to your sign-in. Contact us to change.">
            <ReadOnlyInput value={userEmail || "—"} />
          </Field>
          <Field label="Theme">
            <PillGroup
              options={[
                { value: "light", label: "Light", icon: <Sun size={14} /> },
                { value: "dark", label: "Dark", icon: <Moon size={14} /> },
                { value: "system", label: "System", icon: <Monitor size={14} /> },
              ]}
              value={theme || "system"}
              onChange={(v) => setTheme(v)}
            />
          </Field>
        </Row>
        <Row>
          <Field label="Language">
            <PillGroup
              options={[
                { value: "en", label: "English" },
                { value: "tr", label: "Türkçe" },
              ]}
              value={settings.language}
              onChange={(v) => handleLanguageChange(v as "en" | "tr")}
            />
          </Field>
          <Field label="Hide rejected" hint="Keep your active pipeline focused.">
            <ToggleSwitch
              checked={Boolean(filters.hideRejected)}
              onChange={(checked) =>
                setFilters({ ...filters, hideRejected: checked || undefined })
              }
            />
          </Field>
        </Row>
      </Card>

      <Card
        title="Notifications"
        description="Daily email at 08:00 UTC for follow-ups that hit their due date."
      >
        <Field label="Follow-up reminders" hint="Email me when an application I set a follow-up for is due.">
          <FollowUpEmailToggle />
        </Field>
      </Card>

      {publicProfileInitial && (
        <Card
          title="Public profile"
          description="Optional — share a read-only stats page at jobtrack.com/u/your-handle."
        >
          <PublicProfileCard initial={publicProfileInitial} />
        </Card>
      )}

      <Card title="Customization" description="Bend the app to your search style.">
        <Field label="Sources" hint="Anywhere you find jobs — LinkedIn, referrals, alumni groups, niche boards.">
          <Chips
            value={newSource}
            onValue={setNewSource}
            onAdd={() => {
              const v = newSource.trim();
              if (!v) return;
              addCustomSource(v);
              setNewSource("");
            }}
            items={settings.customSources}
            onRemove={(v) => removeCustomSource(v)}
            placeholder="AngelList, Hacker News, alumni Slack…"
          />
        </Field>
        <Field label="Industries" hint="Group your applications the way you think about them.">
          <Chips
            value={newIndustry}
            onValue={setNewIndustry}
            onAdd={() => {
              const v = newIndustry.trim();
              if (!v) return;
              addCustomIndustry(v);
              setNewIndustry("");
            }}
            items={settings.customIndustries}
            onRemove={(v) => removeCustomIndustry(v)}
            placeholder="Climate tech, DevTools, Healthcare…"
          />
        </Field>
      </Card>

      <Card title="Data" description="Your data is yours. Export it, walk away if you need to.">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <JtButton variant="secondary" icon={<Download size={14} />} onClick={handleExport}>
            Export to JSON
          </JtButton>
          <JtButton
            variant="secondary"
            icon={<Upload size={14} />}
            onClick={() => setShowImport(true)}
          >
            Import from CSV
          </JtButton>
          <CsvImportDialog open={showImport} onOpenChange={setShowImport} />
        </div>
        <div
          style={{
            marginTop: 16,
            padding: 14,
            border: "1px solid var(--st-rejected-bg)",
            background: "var(--jt-bg-sunk)",
            borderRadius: "var(--r-md)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--st-rejected)",
              marginBottom: 4,
            }}
          >
            Danger zone
          </div>
          <p
            style={{
              fontSize: 12,
              color: "var(--jt-text-2)",
              margin: "0 0 10px",
              lineHeight: 1.55,
            }}
          >
            Two flavors — wipe your applications but keep the account, or
            torch everything including sign-in. Both are permanent.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <JtButton
              variant="secondary"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={() => setShowClear(true)}
            >
              Clear all data
            </JtButton>
            <JtButton
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={() => setShowDelete(true)}
            >
              Delete account
            </JtButton>
          </div>
        </div>
      </Card>

      <Card title="About JobTrack">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <JtPill bg="var(--jt-bg-sunk)" color="var(--jt-text-2)" size="sm">
            v0.2 · build 2026.05
          </JtPill>
          <JtPill bg="var(--p-50)" color="var(--p-700)" size="sm">
            Made by Berkin Duz
          </JtPill>
        </div>
        <p
          style={{
            color: "var(--jt-text-2)",
            fontSize: 14,
            margin: "14px 0",
            maxWidth: 580,
            lineHeight: 1.6,
          }}
        >
          JobTrack is a calm, opinionated job-application tracker built for people who&apos;ve
          outgrown spreadsheets. Free, forever — your support keeps it that way.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href="https://github.com/berkinduz" target="_blank" rel="noopener noreferrer">
            <JtButton variant="secondary" size="sm" icon={<Github size={14} />}>
              Star on GitHub
            </JtButton>
          </a>
          <a
            href="https://www.buymeacoffee.com/berkinduz"
            target="_blank"
            rel="noopener noreferrer"
          >
            <JtButton variant="ghost" size="sm" icon={<Heart size={14} />}>
              Buy me a coffee
            </JtButton>
          </a>
        </div>
      </Card>

      <AlertDialog open={showClear} onOpenChange={setShowClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all your data?</AlertDialogTitle>
            <AlertDialogDescription>
              Every application, note, resume, and saved preference will be permanently
              deleted from our servers. Your sign-in stays so you can start fresh. Export
              first if you want a backup.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dangerBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={dangerBusy}
              onClick={async () => {
                setDangerBusy(true);
                const r = await clearAllData();
                if (r.ok) {
                  toast.success("Cleared. Refreshing…");
                  setShowClear(false);
                  // localStorage holds a cached snapshot of the now-empty data.
                  localStorage.removeItem("job-apply-track-applications");
                  localStorage.removeItem("job-apply-track-settings");
                  window.location.href = "/applications";
                } else {
                  toast.error(r.error);
                  setDangerBusy(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {dangerBusy ? "Clearing…" : "Yes, clear everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeleteAccountDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        busy={dangerBusy}
        setBusy={setDangerBusy}
      />

      {/* keep next-intl import warm during the migration */}
      <span style={{ display: "none" }} aria-hidden>
        {t("common.appName")}
      </span>
    </main>
  );
}

function DeleteAccountDialog({
  open,
  onOpenChange,
  busy,
  setBusy,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  busy: boolean;
  setBusy: (v: boolean) => void;
}) {
  const [confirm, setConfirm] = React.useState("");
  const ok = confirm.trim().toUpperCase() === "DELETE";

  React.useEffect(() => {
    if (!open) setConfirm("");
  }, [open]);

  const handleDelete = async () => {
    setBusy(true);
    const r = await deleteAccount();
    if (r.ok) {
      toast.success("Account deleted. Goodbye 👋");
      localStorage.clear();
      window.location.href = "/";
    } else {
      toast.error(r.error);
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes your sign-in, every application, all resumes
            you uploaded, and your settings. You can sign up again later but the
            data is gone forever.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div style={{ padding: "8px 0 4px" }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              color: "var(--jt-text-2)",
              marginBottom: 6,
            }}
          >
            Type <code style={{ fontFamily: "var(--font-mono)", color: "var(--st-rejected)" }}>DELETE</code> to confirm
          </label>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            disabled={busy}
            style={{
              width: "100%",
              height: 40,
              padding: "0 12px",
              background: "var(--jt-bg-elev)",
              border: "1.5px solid var(--jt-border)",
              borderRadius: "var(--r-md)",
              color: "var(--jt-text)",
              fontFamily: "var(--font-mono)",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!ok || busy}
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? "Deleting…" : "Delete my account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FollowUpEmailToggle() {
  const [checked, setChecked] = React.useState(true);
  const [loaded, setLoaded] = React.useState(false);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("user_settings")
        .select("follow_up_emails")
        .eq("user_id", u.user.id)
        .maybeSingle();
      // Default to opted-in if no row exists yet.
      setChecked(data?.follow_up_emails ?? true);
      setLoaded(true);
    })();
  }, [supabase]);

  const onChange = async (next: boolean) => {
    setChecked(next);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("user_settings")
      .upsert(
        { user_id: u.user.id, follow_up_emails: next, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    if (error) {
      setChecked(!next);
      toast.error(error.message);
    } else {
      toast.success(next ? "Reminders on." : "Reminders off.");
    }
  };

  return <ToggleSwitch checked={checked} onChange={onChange} disabled={!loaded} />;
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-lg)",
        padding: 24,
        marginBottom: 16,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "-0.015em",
            margin: 0,
          }}
        >
          {title}
        </h2>
        {description && (
          <p style={{ fontSize: 13, color: "var(--jt-text-2)", margin: "4px 0 0" }}>
            {description}
          </p>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="jt-form-row"
      style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--jt-text)" }}>
          {label}
        </div>
        {hint && (
          <div style={{ fontSize: 12, color: "var(--jt-text-3)", marginTop: 2 }}>
            {hint}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function ReadOnlyInput({ value }: { value: string }) {
  return (
    <input
      value={value}
      readOnly
      style={{
        width: "100%",
        height: 40,
        padding: "0 12px",
        background: "var(--jt-bg-sunk)",
        border: "1.5px solid var(--jt-border)",
        borderRadius: "var(--r-md)",
        color: "var(--jt-text-2)",
        fontSize: 14,
        fontFamily: "var(--font-sans)",
        cursor: "not-allowed",
      }}
    />
  );
}

function PillGroup<V extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: V; label: string; icon?: React.ReactNode }[];
  value: V;
  onChange: (v: V) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="focus-ring"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: "var(--r-md)",
              border: active ? "1.5px solid var(--p-500)" : "1.5px solid var(--jt-border)",
              background: active ? "var(--p-50)" : "var(--jt-bg-elev)",
              color: active ? "var(--p-700)" : "var(--jt-text)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 120ms var(--jt-ease)",
            }}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="focus-ring"
      style={{
        width: 42,
        height: 24,
        background: checked ? "var(--p-500)" : "var(--jt-bg-sunk)",
        border: `1.5px solid ${checked ? "var(--p-500)" : "var(--jt-border)"}`,
        borderRadius: 99,
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 150ms var(--jt-ease)",
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
  );
}

function Chips({
  value,
  onValue,
  onAdd,
  items,
  onRemove,
  placeholder,
}: {
  value: string;
  onValue: (v: string) => void;
  onAdd: () => void;
  items: string[];
  onRemove: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={value}
          onChange={(e) => onValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          style={{
            flex: 1,
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
        <JtButton size="sm" icon={<Plus size={14} />} onClick={onAdd}>
          Add
        </JtButton>
      </div>
      {items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {items.map((s) => (
            <span
              key={s}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 8px 4px 10px",
                background: "var(--jt-bg-sunk)",
                color: "var(--jt-text)",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {s}
              <button
                type="button"
                onClick={() => onRemove(s)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--jt-text-3)",
                  padding: 0,
                  display: "inline-flex",
                }}
                aria-label={`Remove ${s}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
