"use client";

import * as React from "react";
import {
  Upload,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Download,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { JtButton } from "@/components/jt/primitives";
import {
  parseCsv,
  detectColumns,
  rowToApplication,
  SAMPLE_CSV,
  type ColumnMapping,
  type RowResult,
} from "@/lib/csv/import";
import { useApplicationStore } from "@/store";
import type { ApplicationFormData } from "@/types";

type Stage = "pick" | "preview" | "importing" | "done";

export function CsvImportDialog({
  open,
  onOpenChange,
  trigger,
}: {
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  trigger?: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const { importApplications } = useApplicationStore();
  const [stage, setStage] = React.useState<Stage>("pick");
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [rows, setRows] = React.useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = React.useState<ColumnMapping>({});
  const [results, setResults] = React.useState<RowResult[]>([]);
  const [insertCount, setInsertCount] = React.useState(0);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const reset = () => {
    setStage("pick");
    setHeaders([]);
    setRows([]);
    setMapping({});
    setResults([]);
    setInsertCount(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  React.useEffect(() => {
    if (!isOpen) {
      // Defer so the closing animation doesn't show the empty state.
      const id = setTimeout(reset, 200);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const parsed = parseCsv(text);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        toast.error("That file didn't look like a CSV with a header row.");
        return;
      }
      const detected = detectColumns(parsed.headers);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setMapping(detected);
      const computed = parsed.rows.map((r, i) =>
        rowToApplication(r, detected, i),
      );
      setResults(computed);
      setStage("preview");
    };
    reader.onerror = () => toast.error("Couldn't read that file.");
    reader.readAsText(file);
  };

  const recompute = (next: ColumnMapping) => {
    setMapping(next);
    setResults(rows.map((r, i) => rowToApplication(r, next, i)));
  };

  const validItems = React.useMemo<ApplicationFormData[]>(
    () =>
      results
        .filter((r): r is Extract<RowResult, { ok: true }> => r.ok)
        .map((r) => r.data),
    [results],
  );
  const errorCount = results.length - validItems.length;

  const handleImport = async () => {
    if (validItems.length === 0) return;
    setStage("importing");
    try {
      const inserted = await importApplications(validItems);
      setInsertCount(inserted);
      setStage("done");
      toast.success(
        `Imported ${inserted} application${inserted === 1 ? "" : "s"}.`,
      );
    } catch (e) {
      toast.error((e as Error).message);
      setStage("preview");
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobtrack-sample.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import from CSV</DialogTitle>
          <DialogDescription>
            Bring your applications over from a spreadsheet. We&apos;ll match the
            columns automatically — tweak any that look off.
          </DialogDescription>
        </DialogHeader>

        {stage === "pick" && (
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              style={{
                width: "100%",
                padding: "32px 16px",
                background: "var(--jt-bg-sunk)",
                border: "1.5px dashed var(--jt-border)",
                borderRadius: "var(--r-md)",
                color: "var(--jt-text-2)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Upload size={28} color="var(--jt-text-3)" />
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--jt-text)" }}>
                Drop a CSV here, or click to pick
              </div>
              <div style={{ fontSize: 12 }}>UTF-8, first row should be headers</div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                onClick={downloadSample}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--p-600)",
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Download size={13} /> Download sample CSV
              </button>
            </div>
          </div>
        )}

        {stage === "preview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                display: "flex",
                gap: 16,
                fontSize: 12,
                color: "var(--jt-text-2)",
                alignItems: "center",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <FileText size={13} /> {rows.length} rows
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--st-accepted)" }}>
                <Check size={13} /> {validItems.length} valid
              </span>
              {errorCount > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--st-rejected)" }}>
                  <AlertTriangle size={13} /> {errorCount} need a fix
                </span>
              )}
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--jt-text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Column mapping
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  maxHeight: 220,
                  overflowY: "auto",
                  padding: 2,
                }}
              >
                {FIELD_LABELS.map((f) => (
                  <MappingRow
                    key={f.key}
                    label={f.label}
                    required={f.required}
                    value={mapping[f.key]}
                    options={headers}
                    onChange={(v) =>
                      recompute({ ...mapping, [f.key]: v || undefined })
                    }
                  />
                ))}
              </div>
            </div>

            {errorCount > 0 && (
              <details
                style={{
                  fontSize: 12,
                  color: "var(--st-rejected)",
                  background: "color-mix(in oklab, var(--st-rejected) 8%, transparent)",
                  border: "1px solid color-mix(in oklab, var(--st-rejected) 25%, transparent)",
                  borderRadius: "var(--r-md)",
                  padding: "8px 12px",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: 500 }}>
                  Skipping {errorCount} row{errorCount === 1 ? "" : "s"} with errors
                </summary>
                <div style={{ marginTop: 6, color: "var(--jt-text-2)" }}>
                  {results
                    .filter((r): r is Extract<RowResult, { ok: false }> => !r.ok)
                    .slice(0, 8)
                    .map((r) => (
                      <div key={r.row}>
                        Row {r.row}: {r.errors.join(", ")}
                      </div>
                    ))}
                </div>
              </details>
            )}
          </div>
        )}

        {stage === "importing" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "32px 16px",
              fontSize: 14,
              color: "var(--jt-text-2)",
            }}
          >
            <Loader2 size={18} className="animate-spin" /> Importing {validItems.length}{" "}
            row{validItems.length === 1 ? "" : "s"}…
          </div>
        )}

        {stage === "done" && (
          <div
            style={{
              padding: "24px 16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                margin: "0 auto 12px",
                borderRadius: 999,
                background: "color-mix(in oklab, var(--st-accepted) 18%, transparent)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--st-accepted)",
              }}
            >
              <Check size={22} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              Imported {insertCount} application{insertCount === 1 ? "" : "s"}.
            </div>
            <div style={{ fontSize: 13, color: "var(--jt-text-2)", marginTop: 4 }}>
              They&apos;re in your list now — pin or tag from there.
            </div>
          </div>
        )}

        <DialogFooter>
          {stage === "pick" && (
            <JtButton type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </JtButton>
          )}
          {stage === "preview" && (
            <>
              <JtButton type="button" variant="ghost" onClick={reset}>
                <X size={14} /> Choose another file
              </JtButton>
              <JtButton
                type="button"
                onClick={handleImport}
                disabled={validItems.length === 0}
                icon={<Upload size={14} />}
              >
                Import {validItems.length} row{validItems.length === 1 ? "" : "s"}
              </JtButton>
            </>
          )}
          {stage === "done" && (
            <JtButton type="button" onClick={() => setOpen(false)}>
              Done
            </JtButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const FIELD_LABELS: { key: keyof ColumnMapping; label: string; required?: boolean }[] = [
  { key: "companyName", label: "Company", required: true },
  { key: "position", label: "Role", required: true },
  { key: "status", label: "Status" },
  { key: "applicationDate", label: "Date" },
  { key: "companyLocation", label: "Location" },
  { key: "source", label: "Source" },
  { key: "workType", label: "Work type" },
  { key: "jobPostingUrl", label: "Job URL" },
  { key: "salaryExpectation", label: "Salary" },
  { key: "companyIndustry", label: "Industry" },
  { key: "skills", label: "Skills" },
  { key: "notes", label: "Notes" },
];

function MappingRow({
  label,
  required,
  value,
  options,
  onChange,
}: {
  label: string;
  required?: boolean;
  value?: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontSize: 12,
        color: "var(--jt-text-2)",
      }}
    >
      <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
        {label}
        {required && (
          <span style={{ color: "var(--st-rejected)", fontWeight: 600 }}>*</span>
        )}
      </span>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 32,
          padding: "0 8px",
          background: "var(--jt-bg-elev)",
          border: "1px solid var(--jt-border)",
          borderRadius: "var(--r-sm)",
          color: "var(--jt-text)",
          fontSize: 13,
        }}
      >
        <option value="">— skip —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
