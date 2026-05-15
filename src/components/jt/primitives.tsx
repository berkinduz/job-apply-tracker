"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ============================================================
   JobTrack design primitives — Button, Pill, StatusPill,
   CompanyAvatar, Segmented, Card, Input.
   These intentionally live alongside shadcn/ui — used in the
   redesigned screens.
   ============================================================ */

/* ---------- Button ---------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  full?: boolean;
  asChild?: boolean;
  type?: "button" | "submit" | "reset";
}

const buttonSize: Record<
  ButtonSize,
  { h: number; px: number; fs: number; gap: number; iconSize: number }
> = {
  sm: { h: 30, px: 10, fs: 13, gap: 6, iconSize: 14 },
  md: { h: 36, px: 14, fs: 14, gap: 8, iconSize: 16 },
  lg: { h: 44, px: 20, fs: 15, gap: 10, iconSize: 18 },
};

const variantStyles: Record<
  ButtonVariant,
  { bg: string; hover: string; color: string; border: string }
> = {
  primary: {
    bg: "var(--p-500)",
    hover: "var(--p-600)",
    color: "#fff",
    border: "1px solid var(--p-500)",
  },
  secondary: {
    bg: "var(--jt-bg-elev)",
    hover: "var(--jt-bg-sunk)",
    color: "var(--jt-text)",
    border: "1px solid var(--jt-border)",
  },
  ghost: {
    bg: "transparent",
    hover: "var(--jt-bg-sunk)",
    color: "var(--jt-text)",
    border: "1px solid transparent",
  },
  accent: {
    bg: "var(--a-500)",
    hover: "var(--a-600)",
    color: "#231300",
    border: "1px solid var(--a-500)",
  },
  danger: {
    bg: "var(--st-rejected)",
    hover: "#c66556",
    color: "#fff",
    border: "1px solid var(--st-rejected)",
  },
};

function sizeIcon(node: React.ReactNode, n: number) {
  if (!node || !React.isValidElement(node)) return node;
  const el = node as React.ReactElement<{ size?: number | string }>;
  return React.cloneElement(el, { size: n });
}

export const JtButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function JtButton(
    {
      children,
      variant = "primary",
      size = "md",
      icon,
      iconRight,
      full,
      className,
      style,
      type = "button",
      disabled,
      ...rest
    },
    ref,
  ) {
    const sz = buttonSize[size];
    const v = variantStyles[variant];
    const [hover, setHover] = React.useState(false);
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={cn("focus-ring", className)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: sz.gap,
          height: sz.h,
          padding: `0 ${sz.px}px`,
          background: hover && !disabled ? v.hover : v.bg,
          color: v.color,
          border: v.border,
          borderRadius: "var(--r-md)",
          fontSize: sz.fs,
          fontWeight: 500,
          letterSpacing: "-0.005em",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition:
            "background var(--jt-dur) var(--jt-ease), transform 100ms var(--jt-ease)",
          width: full ? "100%" : "auto",
          whiteSpace: "nowrap",
          ...style,
        }}
        {...rest}
      >
        {icon && sizeIcon(icon, sz.iconSize)}
        {children}
        {iconRight && sizeIcon(iconRight, sz.iconSize)}
      </button>
    );
  },
);

/* ---------- Pill ---------- */

type PillSize = "sm" | "md" | "lg";

export function JtPill({
  children,
  color,
  bg,
  border,
  icon,
  size = "md",
  style,
  className,
}: {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  border?: string;
  icon?: React.ReactNode;
  size?: PillSize;
  style?: React.CSSProperties;
  className?: string;
}) {
  const sizes: Record<PillSize, { fs: number; h: number; px: number }> = {
    sm: { fs: 11, h: 20, px: 8 },
    md: { fs: 12, h: 24, px: 10 },
    lg: { fs: 13, h: 28, px: 12 },
  };
  const sz = sizes[size];
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: sz.h,
        padding: `0 ${sz.px}px`,
        borderRadius: 999,
        fontSize: sz.fs,
        fontWeight: 500,
        background: bg || "var(--jt-bg-sunk)",
        color: color || "var(--jt-text-2)",
        border: border || "none",
        whiteSpace: "nowrap",
        letterSpacing: "-0.005em",
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}

/* ---------- StatusPill ---------- */

export type JtStatusKey =
  | "applied"
  | "test_case"
  | "hr_interview"
  | "technical_interview"
  | "management_interview"
  | "offer"
  | "accepted"
  | "rejected";

export const STATUS_TOKENS: Record<
  JtStatusKey,
  { dot: string; bg: string; label: string; short: string; shortcut: string }
> = {
  applied: {
    dot: "var(--st-applied)",
    bg: "var(--st-applied-bg)",
    label: "Applied",
    short: "Applied",
    shortcut: "1",
  },
  test_case: {
    dot: "var(--st-test)",
    bg: "var(--st-test-bg)",
    label: "Test case",
    short: "Test",
    shortcut: "2",
  },
  hr_interview: {
    dot: "var(--st-hr)",
    bg: "var(--st-hr-bg)",
    label: "HR interview",
    short: "HR",
    shortcut: "3",
  },
  technical_interview: {
    dot: "var(--st-tech)",
    bg: "var(--st-tech-bg)",
    label: "Technical",
    short: "Tech",
    shortcut: "4",
  },
  management_interview: {
    dot: "var(--st-mgmt)",
    bg: "var(--st-mgmt-bg)",
    label: "Management",
    short: "Mgmt",
    shortcut: "5",
  },
  offer: {
    dot: "var(--st-offer)",
    bg: "var(--st-offer-bg)",
    label: "Offer",
    short: "Offer",
    shortcut: "6",
  },
  accepted: {
    dot: "var(--st-accepted)",
    bg: "var(--st-accepted-bg)",
    label: "Accepted",
    short: "Accepted",
    shortcut: "7",
  },
  rejected: {
    dot: "var(--st-rejected)",
    bg: "var(--st-rejected-bg)",
    label: "Rejected",
    short: "Rejected",
    shortcut: "8",
  },
};

export const STATUS_ORDER: JtStatusKey[] = [
  "applied",
  "test_case",
  "hr_interview",
  "technical_interview",
  "management_interview",
  "offer",
  "accepted",
  "rejected",
];

/** statuses that participate in the pipeline (rejected is closed-side) */
export const PIPELINE_STATUSES: JtStatusKey[] = [
  "applied",
  "test_case",
  "hr_interview",
  "technical_interview",
  "management_interview",
  "offer",
  "accepted",
];

export function JtStatusPill({
  statusKey,
  size = "md",
}: {
  statusKey: JtStatusKey;
  size?: PillSize;
}) {
  const s = STATUS_TOKENS[statusKey];
  if (!s) return null;
  return (
    <JtPill
      size={size}
      color={s.dot}
      bg={s.bg}
      icon={<JtDot color={s.dot} size={6} />}
    >
      {s.label}
    </JtPill>
  );
}

/* ---------- Dot ---------- */

export function JtDot({
  color = "currentColor",
  size = 8,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

/* ---------- Company Avatar ---------- */

const COMPANY_COLORS: Record<string, { color: string; initials: string }> = {
  Stripe: { color: "#635BFF", initials: "St" },
  Linear: { color: "#5E6AD2", initials: "Ln" },
  Figma: { color: "#F24E1E", initials: "Fg" },
  Notion: { color: "#0E0F1A", initials: "No" },
  Vercel: { color: "#0E0F1A", initials: "Ve" },
  Anthropic: { color: "#D97757", initials: "An" },
  Supabase: { color: "#3ECF8E", initials: "Sb" },
  Cloudflare: { color: "#F38020", initials: "Cf" },
  Posthog: { color: "#F54E00", initials: "Ph" },
  Raycast: { color: "#FF6363", initials: "Rc" },
  Cron: { color: "#000", initials: "Cn" },
  Discord: { color: "#5865F2", initials: "Dc" },
  GitHub: { color: "#181717", initials: "Gh" },
  Shopify: { color: "#7AB55C", initials: "Sh" },
};

/** Deterministic colour for an unknown company name. */
function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  const palette = [
    "#5A5DE8",
    "#9B7AE5",
    "#5AC4D2",
    "#B860D9",
    "#43C18B",
    "#E69B2E",
    "#E07A6B",
    "#5158D6",
  ];
  return palette[h % palette.length];
}

export function JtCompanyAvatar({
  name,
  size = 32,
  radius = 8,
}: {
  name: string;
  size?: number;
  radius?: number;
}) {
  const cleaned = (name || "?").trim();
  const known = COMPANY_COLORS[cleaned];
  const initials = known
    ? known.initials
    : cleaned
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "?";
  const color = known?.color || hashColor(cleaned);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 600,
        letterSpacing: "-0.02em",
        flexShrink: 0,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        textTransform: "uppercase",
      }}
    >
      {initials}
    </div>
  );
}

/* ---------- Segmented ---------- */

export interface SegmentedOption<V extends string> {
  value: V;
  label: string;
  icon?: React.ReactNode;
}

export function JtSegmented<V extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: SegmentedOption<V>[];
  value: V;
  onChange: (v: V) => void;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? 28 : 34;
  return (
    <div
      style={{
        display: "inline-flex",
        background: "var(--jt-bg-sunk)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-md)",
        padding: 3,
        gap: 2,
        height: h,
        boxSizing: "border-box",
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="focus-ring"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0 12px",
              height: "100%",
              background: active ? "var(--jt-bg-elev)" : "transparent",
              color: active ? "var(--jt-text)" : "var(--jt-text-2)",
              fontSize: 13,
              fontWeight: 500,
              border: "none",
              borderRadius: 7,
              boxShadow: active ? "var(--sh-xs)" : "none",
              cursor: "pointer",
              transition: "all 120ms var(--jt-ease)",
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Logo ---------- */

export function JtLogo({
  size = 22,
  color = "var(--p-500)",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <circle
        cx="12"
        cy="12"
        r="5"
        stroke={color}
        strokeWidth="2"
        opacity="0.4"
      />
      <path
        d="M8.5 12L11 14.5L16 9"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function JtWordmark({
  size = 22,
  color = "var(--jt-text)",
  accent = "var(--p-500)",
}: {
  size?: number;
  color?: string;
  accent?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <JtLogo size={size} color={accent} />
      <span
        style={{
          fontWeight: 600,
          fontSize: size - 6,
          letterSpacing: "-0.02em",
          color,
        }}
      >
        jobtrack
      </span>
    </span>
  );
}
