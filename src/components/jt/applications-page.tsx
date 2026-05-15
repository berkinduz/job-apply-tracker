"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  Pin,
  Clock,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
  List as ListIcon,
  Columns3 as KanbanIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  JtButton,
  JtPill,
  JtStatusPill,
  JtCompanyAvatar,
  JtSegmented,
  STATUS_TOKENS,
  type JtStatusKey,
} from "@/components/jt/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { KanbanBoard } from "@/components/applications/kanban-board";
import { useApplicationStore } from "@/store";
import type { JobApplication } from "@/types";

const VIEW_MODE_KEY = "jt-view-mode";

type Filter = "active" | "all" | "closed";

function isStale(a: JobApplication): boolean {
  const ms = Date.now() - new Date(a.updatedAt).getTime();
  return (
    ms > 14 * 24 * 60 * 60 * 1000 &&
    a.status !== "rejected" &&
    a.status !== "accepted"
  );
}

function relativeUpdate(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (d <= 0) return "today";
  if (d === 1) return "1d";
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w === 1) return "1w";
  if (w < 5) return `${w}w`;
  const mo = Math.floor(d / 30);
  return `${mo}mo`;
}

export function JtApplicationsPage() {
  const {
    applications,
    _hasHydrated,
    isLoading,
    fetchApplications,
  } = useApplicationStore();

  const [view, setView] = React.useState<"list" | "kanban">(() => {
    if (typeof window === "undefined") return "list";
    return (window.localStorage.getItem(VIEW_MODE_KEY) as "list" | "kanban") || "list";
  });
  const [filter, setFilter] = React.useState<Filter>("active");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const setViewPersist = (next: "list" | "kanban") => {
    setView(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VIEW_MODE_KEY, next);
    }
  };

  const filtered = React.useMemo(() => {
    return applications
      .filter((a) => {
        const closed = a.status === "rejected" || a.status === "accepted";
        if (filter === "active" && closed) return false;
        if (filter === "closed" && !closed) return false;
        if (search) {
          const q = search.toLowerCase();
          const hay = `${a.companyName} ${a.position} ${a.companyLocation}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // pinned first, then most recently updated
        const pinDiff = Number(b.isPinned) - Number(a.isPinned);
        if (pinDiff !== 0) return pinDiff;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [applications, filter, search]);

  const counts = React.useMemo(() => {
    const active = applications.filter(
      (a) => a.status !== "rejected" && a.status !== "accepted",
    ).length;
    const pinned = applications.filter((a) => a.isPinned).length;
    const stale = applications.filter(isStale).length;
    return { active, pinned, stale };
  }, [applications]);

  if (!_hasHydrated || isLoading) {
    return <LoadingState />;
  }

  if (applications.length === 0) {
    return <EmptyApplications />;
  }

  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "24px 16px 48px",
      }}
      className="sm:!px-8"
    >
      <ListHeader counts={counts} />
      <QuickAddBar />
      <Toolbar
        view={view}
        setView={setViewPersist}
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
      />

      {filtered.length === 0 ? (
        <NoMatches />
      ) : view === "list" ? (
        <ListView apps={filtered} />
      ) : (
        <div style={{ marginTop: 4 }}>
          <KanbanBoard applications={filtered} />
        </div>
      )}
    </main>
  );
}

/* ---------- subcomponents ---------- */

function ListHeader({ counts }: { counts: { active: number; pinned: number; stale: number } }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 18,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 30px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          Applications
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 6,
            fontSize: 13,
            color: "var(--jt-text-2)",
            flexWrap: "wrap",
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>
            <span className="tnum" style={{ color: "var(--jt-text)", fontWeight: 600 }}>
              {counts.active}
            </span>{" "}
            active
          </span>
          <Divider />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              whiteSpace: "nowrap",
            }}
          >
            <Pin size={12} color="var(--p-500)" />{" "}
            <span className="tnum">{counts.pinned}</span> pinned
          </span>
          {counts.stale > 0 && (
            <>
              <Divider />
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  color: "var(--a-700)",
                  whiteSpace: "nowrap",
                }}
              >
                <Clock size={12} /> <span className="tnum">{counts.stale}</span> stale —
                needs follow-up
              </span>
            </>
          )}
        </div>
      </div>
      <Link href="/applications/new" className="hidden sm:block">
        <JtButton size="md" icon={<Plus size={16} />}>
          New application
        </JtButton>
      </Link>
    </div>
  );
}

function Divider() {
  return (
    <span style={{ width: 1, height: 12, background: "var(--jt-border)" }} />
  );
}

function QuickAddBar() {
  const { addApplication } = useApplicationStore();
  const router = useRouter();
  const [val, setVal] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [added, setAdded] = React.useState<string | null>(null);

  const parse = (raw: string): { companyName: string; position: string } | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    // Try arrow, em dash, dash, colon
    const sep = trimmed.match(/(?:\s+→\s+|\s+->\s+|\s+—\s+|\s+-\s+|\s+:\s+)/);
    if (sep && sep.index !== undefined) {
      const companyName = trimmed.slice(0, sep.index).trim();
      const position = trimmed.slice(sep.index + sep[0].length).trim();
      if (companyName && position) return { companyName, position };
    }
    return null;
  };

  const submit = async () => {
    const parsed = parse(val);
    if (!parsed) {
      toast.error("Use format: Company → Role (or Company - Role)");
      return;
    }
    setBusy(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      await addApplication({
        companyName: parsed.companyName,
        position: parsed.position,
        companyLocation: "",
        companyIndustry: "Technology",
        applicationDate: today,
        source: "LinkedIn",
        workType: "remote",
        status: "applied",
        contacts: [],
      });
      setVal("");
      setAdded(`${parsed.companyName} → ${parsed.position}`);
      toast.success(`Added ${parsed.companyName} — ${parsed.position}`);
      setTimeout(() => setAdded(null), 2400);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message || "Failed to add");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-lg)",
        padding: "4px 4px 4px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
        position: "relative",
        boxShadow: "var(--sh-xs)",
      }}
    >
      <Plus size={16} color="var(--jt-text-3)" />
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Quick add — e.g. Stripe → Senior Frontend Engineer"
        disabled={busy}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          color: "var(--jt-text)",
          fontSize: 14,
          padding: "10px 0",
          fontFamily: "var(--font-sans)",
          letterSpacing: "-0.005em",
        }}
      />
      <span
        className="hidden md:inline-flex"
        style={{
          fontSize: 12,
          color: "var(--jt-text-3)",
          alignItems: "center",
          gap: 4,
        }}
      >
        press <span className="kbd">⏎</span> to add
      </span>
      <JtButton size="sm" onClick={submit} disabled={busy}>
        {busy ? "Adding…" : "Add"}
      </JtButton>
      {added && (
        <div
          className="jt-slide-down"
          style={{
            position: "absolute",
            bottom: -44,
            left: 0,
            right: 0,
            background: "var(--st-accepted-bg)",
            color: "var(--st-accepted)",
            padding: "8px 14px",
            borderRadius: "var(--r-md)",
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "var(--sh-sm)",
          }}
        >
          ✓ Added {added}. Open it to add the rest.
        </div>
      )}
    </div>
  );
}

function Toolbar({
  view,
  setView,
  filter,
  setFilter,
  search,
  setSearch,
}: {
  view: "list" | "kanban";
  setView: (v: "list" | "kanban") => void;
  filter: Filter;
  setFilter: (v: Filter) => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
        flexWrap: "wrap",
      }}
    >
      <JtSegmented
        options={[
          { value: "active", label: "Active" },
          { value: "all", label: "All" },
          { value: "closed", label: "Closed" },
        ]}
        value={filter}
        onChange={setFilter}
      />
      <div style={{ flex: 1, minWidth: 200 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 38,
            padding: "0 12px",
            background: "var(--jt-bg-elev)",
            border: focused ? "1.5px solid var(--p-500)" : "1.5px solid var(--jt-border)",
            boxShadow: focused ? "0 0 0 3px var(--p-100)" : "none",
            borderRadius: "var(--r-md)",
            transition: "all 120ms var(--jt-ease)",
          }}
        >
          <Search size={14} color="var(--jt-text-3)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search company, role, or location…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--jt-text)",
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: "-0.005em",
              marginLeft: 8,
            }}
          />
        </div>
      </div>
      <JtButton variant="secondary" size="sm" icon={<Filter size={14} />}>
        Filters
      </JtButton>
      <div className="hidden md:block">
        <JtSegmented
          size="sm"
          options={[
            { value: "list", label: "List", icon: <ListIcon size={13} /> },
            { value: "kanban", label: "Kanban", icon: <KanbanIcon size={13} /> },
          ]}
          value={view}
          onChange={setView}
        />
      </div>
    </div>
  );
}

function ListView({ apps }: { apps: JobApplication[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {apps.map((a) => (
        <AppRow key={a.id} a={a} />
      ))}
    </div>
  );
}

function AppRow({ a }: { a: JobApplication }) {
  const router = useRouter();
  const { togglePin, deleteApplication } = useApplicationStore();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const stale = isStale(a);
  const sKey = a.status as JtStatusKey;
  const s = STATUS_TOKENS[sKey] || STATUS_TOKENS.applied;
  const last = relativeUpdate(a.updatedAt);

  const open = () => router.push(`/applications/${a.id}`);

  return (
    <>
      <div
        onClick={open}
        className="app-row"
        style={{
          display: "grid",
          gridTemplateColumns: "auto minmax(0, 1fr) auto auto",
          gap: 14,
          alignItems: "center",
          padding: "14px 16px",
          background: "var(--jt-bg-elev)",
          borderRadius: "var(--r-lg)",
          border: "1px solid var(--jt-border-2)",
          borderLeft: `4px solid ${a.isPinned ? "var(--p-500)" : s.dot}`,
          cursor: "pointer",
          transition: "all 150ms var(--jt-ease)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = "var(--jt-border)";
          e.currentTarget.style.boxShadow = "var(--sh-sm)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.borderColor = "var(--jt-border-2)";
        }}
      >
        <JtCompanyAvatar name={a.companyName} size={40} radius={9} />
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 2,
              minWidth: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>
              {a.companyName}
            </span>
            <span style={{ color: "var(--jt-text-3)", fontSize: 13 }}>·</span>
            <span
              style={{
                fontSize: 14,
                color: "var(--jt-text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {a.position}
            </span>
            {a.isPinned && <Pin size={12} color="var(--p-500)" />}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "var(--jt-text-2)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {a.companyLocation && (
              <>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={11} /> {a.companyLocation}
                </span>
                <span style={{ color: "var(--jt-text-3)" }}>·</span>
              </>
            )}
            <span style={{ flexShrink: 0, textTransform: "capitalize" }}>{a.workType}</span>
            {a.source && (
              <>
                <span style={{ color: "var(--jt-text-3)" }}>·</span>
                <span style={{ flexShrink: 0 }}>via {a.source}</span>
              </>
            )}
            {a.skills && a.skills.length > 0 && (
              <>
                <span style={{ color: "var(--jt-text-3)" }}>·</span>
                <span
                  style={{
                    display: "inline-flex",
                    gap: 4,
                    overflow: "hidden",
                  }}
                >
                  {a.skills.slice(0, 2).map((sk) => (
                    <span
                      key={sk}
                      style={{
                        padding: "1px 7px",
                        borderRadius: 4,
                        background: "var(--jt-bg-sunk)",
                        fontSize: 11,
                        color: "var(--jt-text-2)",
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                  {a.skills.length > 2 && (
                    <span style={{ fontSize: 11, color: "var(--jt-text-3)" }}>
                      +{a.skills.length - 2}
                    </span>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {stale && (
            <JtPill
              size="sm"
              bg="var(--a-100)"
              color="var(--a-700)"
              icon={<Clock size={10} />}
            >
              Stale
            </JtPill>
          )}
          <JtStatusPill statusKey={sKey} size="sm" />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span
            className="tnum hidden sm:inline"
            style={{
              fontSize: 12,
              color: "var(--jt-text-3)",
              width: 48,
              textAlign: "right",
            }}
          >
            {last}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="focus-ring"
                aria-label="More actions"
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  color: "var(--jt-text-3)",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem asChild>
                <Link href={`/applications/${a.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(a.id);
                }}
              >
                <Pin className="mr-2 h-4 w-4" />
                {a.isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
            <AlertDialogDescription>
              {a.companyName} — {a.position}. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteApplication(a.id);
                toast.success("Application deleted");
                setConfirmDelete(false);
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

function LoadingState() {
  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "24px 16px 48px",
      }}
      className="sm:!px-8"
    >
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />
      <Skeleton className="h-12 w-full mb-3 rounded-lg" />
      <Skeleton className="h-10 w-full mb-4 rounded-md" />
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </main>
  );
}

function EmptyApplications() {
  const router = useRouter();
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "80px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: "var(--p-50)",
          border: "1px solid var(--p-100)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Plus size={28} color="var(--p-500)" />
      </div>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          margin: "0 0 10px",
        }}
      >
        No applications yet. Let&apos;s fix that.
      </h1>
      <p
        style={{
          color: "var(--jt-text-2)",
          fontSize: 16,
          margin: "0 auto 24px",
          maxWidth: 460,
        }}
      >
        Drop a job link, paste a posting, or start with sample data — you&apos;ll be tracking in 30 seconds.
      </p>
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          gap: 10,
        }}
        className="sm:!flex-row"
      >
        <JtButton size="lg" onClick={() => router.push("/applications/new")}>
          Add your first application
        </JtButton>
        <Link href="/onboarding">
          <JtButton variant="secondary" size="lg">
            Try with sample data
          </JtButton>
        </Link>
      </div>
    </main>
  );
}

function NoMatches() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "64px 20px",
        color: "var(--jt-text-2)",
      }}
    >
      <Search size={36} color="var(--jt-text-3)" style={{ marginBottom: 12 }} />
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--jt-text)",
          marginBottom: 6,
        }}
      >
        No matches.
      </div>
      <div style={{ fontSize: 14 }}>Try clearing filters or broadening your search.</div>
    </div>
  );
}

