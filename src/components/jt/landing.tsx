"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Sparkles,
  Eye,
  Check,
  ChevronDown,
  Plus,
  Zap,
  TrendingUp,
  Bell,
  Clock,
  Github,
  Heart,
  List as ListIcon,
  Columns3 as KanbanIcon,
  BarChart3,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

import {
  JtButton,
  JtPill,
  JtSegmented,
  JtLogo,
  JtDot,
  STATUS_TOKENS,
  type JtStatusKey,
} from "@/components/jt/primitives";

export function JtLanding() {
  return (
    <div
      style={{
        background: "var(--jt-bg)",
        color: "var(--jt-text)",
        minHeight: "100%",
        overflowX: "hidden",
      }}
    >
      <LandingHeader />
      <Hero />
      <Preview />
      <DeepDive />
      <Compare />
      <FeatureSlab />
      <Testimonials />
      <FAQ />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}

function LandingHeader() {
  const t = useTranslations("landing.nav");
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "color-mix(in oklab, var(--jt-bg) 80%, transparent)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--jt-border-2)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="sm:px-14"
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <JtLogo size={24} />
          <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: "-0.02em" }}>
            jobtrack
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <nav
            className="hidden md:flex"
            style={{ gap: 22, fontSize: 14, color: "var(--jt-text-2)", marginRight: 16 }}
          >
            <a href="#features">{t("features")}</a>
            <a href="#compare">{t("compare")}</a>
            <a href="#faq">{t("faq")}</a>
          </nav>
          <ThemeMenu />
          <LangMenu />
          <Link href="/login" className="hidden sm:inline">
            <JtButton variant="ghost" size="sm">
              {t("signIn")}
            </JtButton>
          </Link>
          <Link href="/login">
            <JtButton size="sm">{t("getStarted")}</JtButton>
          </Link>
        </div>
      </div>
    </header>
  );
}

function ThemeMenu() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const active = mounted ? (theme === "system" ? "system" : resolvedTheme) : "system";
  const Icon = active === "dark" ? Moon : active === "light" ? Sun : Monitor;
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        aria-label="Theme"
        className="focus-ring"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        style={{
          width: 34,
          height: 34,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "1px solid var(--jt-border)",
          borderRadius: "var(--r-md)",
          color: "var(--jt-text-2)",
          cursor: "pointer",
        }}
      >
        <Icon size={15} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "var(--jt-bg-elev)",
            border: "1px solid var(--jt-border)",
            borderRadius: "var(--r-md)",
            boxShadow: "var(--sh-md)",
            padding: 4,
            minWidth: 140,
            zIndex: 30,
          }}
        >
          {([
            { v: "light", label: "Light", Icon: Sun },
            { v: "dark", label: "Dark", Icon: Moon },
            { v: "system", label: "System", Icon: Monitor },
          ] as const).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setTheme(opt.v);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "7px 10px",
                background: theme === opt.v ? "var(--jt-bg-sunk)" : "transparent",
                border: "none",
                borderRadius: "var(--r-sm)",
                fontSize: 13,
                color: "var(--jt-text)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <opt.Icon size={14} /> {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LangMenu() {
  const [open, setOpen] = React.useState(false);
  const [locale, setLocaleState] = React.useState<"en" | "tr">("en");
  React.useEffect(() => {
    const m = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    if (m) setLocaleState(m[1] === "tr" ? "tr" : "en");
  }, []);
  const set = (next: "en" | "tr") => {
    document.cookie = `locale=${next};path=/;max-age=31536000`;
    setLocaleState(next);
    setOpen(false);
    window.location.reload();
  };
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        aria-label="Language"
        className="focus-ring"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        style={{
          height: 34,
          padding: "0 10px",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "transparent",
          border: "1px solid var(--jt-border)",
          borderRadius: "var(--r-md)",
          color: "var(--jt-text-2)",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.04em",
          cursor: "pointer",
          textTransform: "uppercase",
        }}
      >
        {locale}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "var(--jt-bg-elev)",
            border: "1px solid var(--jt-border)",
            borderRadius: "var(--r-md)",
            boxShadow: "var(--sh-md)",
            padding: 4,
            minWidth: 120,
            zIndex: 30,
          }}
        >
          {[
            { v: "en" as const, label: "English" },
            { v: "tr" as const, label: "Türkçe" },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                set(o.v);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "7px 10px",
                background: locale === o.v ? "var(--jt-bg-sunk)" : "transparent",
                border: "none",
                borderRadius: "var(--r-sm)",
                fontSize: 13,
                color: "var(--jt-text)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section
      style={{
        padding: "40px 20px 32px",
        maxWidth: 1280,
        margin: "0 auto",
      }}
      className="sm:!py-22"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 32,
          alignItems: "center",
        }}
        className="lg:!grid-cols-[1fr_1.25fr] lg:!gap-12"
      >
        <div>
          <JtPill
            bg="var(--p-100)"
            color="var(--p-700)"
            icon={<Sparkles size={12} />}
          >
            {t("pill")}
          </JtPill>
          <h1
            style={{
              fontSize: "clamp(40px, 6vw, 60px)",
              lineHeight: 1.04,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              margin: "20px 0 18px",
              color: "var(--jt-text)",
              textWrap: "balance",
            }}
          >
            {t("titleLine1")}
            <br />
            <span style={{ color: "var(--jt-text-2)" }}>{t("titleLine2")}</span>
          </h1>
          <p
            style={{
              fontSize: "clamp(17px, 2.2vw, 19px)",
              lineHeight: 1.55,
              color: "var(--jt-text-2)",
              maxWidth: 540,
              margin: 0,
              letterSpacing: "-0.005em",
            }}
          >
            {t("subtitle")}
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 32,
            }}
            className="sm:!flex-row"
          >
            <Link href="/login">
              <JtButton size="lg" iconRight={<ArrowRight />} full>
                {t("ctaPrimary")}
              </JtButton>
            </Link>
            <a href="#preview">
              <JtButton variant="secondary" size="lg" icon={<Eye />} full>
                {t("ctaSecondary")}
              </JtButton>
            </a>
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 28,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <TrustItem>{t("trustNoCreditCard")}</TrustItem>
            <TrustItem>{t("trustOwnData")}</TrustItem>
            <TrustItem>{t("trustEuHosted")}</TrustItem>
          </div>
        </div>
        <HeroMockup />
      </div>
    </section>
  );
}

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: "var(--jt-text-2)",
      }}
    >
      <Check size={14} color="var(--st-accepted)" /> {children}
    </span>
  );
}

function HeroMockup() {
  const cols: { st: JtStatusKey; cards: { c: string; r: string }[]; glow?: boolean }[] = [
    { st: "applied", cards: [{ c: "Supabase", r: "Full Stack" }, { c: "Vercel", r: "DX Engineer" }] },
    { st: "technical_interview", cards: [{ c: "Stripe", r: "Sr. Frontend" }] },
    { st: "management_interview", cards: [{ c: "Notion", r: "Eng Manager" }] },
    { st: "offer", cards: [{ c: "Anthropic", r: "Research Eng" }], glow: true },
  ];
  return (
    <div style={{ position: "relative", height: 520, minHeight: 360 }}>
      <div
        style={{
          position: "absolute",
          inset: -20,
          background:
            "radial-gradient(circle at 70% 30%, color-mix(in oklab, var(--p-100), transparent 30%), transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--jt-bg-elev)",
          border: "1px solid var(--jt-border)",
          borderRadius: "var(--r-xl)",
          boxShadow: "var(--sh-lg)",
          overflow: "hidden",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "11px 14px",
            borderBottom: "1px solid var(--jt-border-2)",
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: 99, background: "#FF5F57" }} />
          <span style={{ width: 10, height: 10, borderRadius: 99, background: "#FEBC2E" }} />
          <span style={{ width: 10, height: 10, borderRadius: 99, background: "#28C840" }} />
          <span
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 11,
              color: "var(--jt-text-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            jobtrack.com/applications
          </span>
        </div>
        <div
          style={{
            padding: "14px 18px 12px",
            borderBottom: "1px solid var(--jt-border-2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em" }}>
              Applications
            </div>
            <div style={{ fontSize: 11, color: "var(--jt-text-3)", marginTop: 2 }}>
              8 active · 3 pinned
            </div>
          </div>
          <div
            style={{
              background: "var(--p-500)",
              color: "white",
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 6,
              fontWeight: 500,
            }}
          >
            + New
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            padding: 12,
          }}
        >
          {cols.map((col, i) => {
            const s = STATUS_TOKENS[col.st];
            return (
              <div
                key={i}
                style={{
                  background: "var(--jt-bg-sunk)",
                  borderRadius: 8,
                  padding: 8,
                  minHeight: 200,
                  border: col.glow ? "1.5px solid var(--a-500)" : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  <JtDot color={s.dot} size={7} />
                  <span style={{ color: "var(--jt-text)" }}>{s.short}</span>
                  <span style={{ color: "var(--jt-text-3)", marginLeft: "auto" }}>
                    {col.cards.length}
                  </span>
                </div>
                {col.cards.map((card, j) => (
                  <div
                    key={j}
                    style={{
                      background: "var(--jt-bg-elev)",
                      borderRadius: 6,
                      padding: "8px 9px",
                      marginBottom: 6,
                      borderLeft: `3px solid ${s.dot}`,
                      boxShadow:
                        col.glow && j === 0
                          ? "0 0 0 2px var(--a-300), var(--sh-sm)"
                          : "var(--sh-xs)",
                      border: "1px solid var(--jt-border-2)",
                      borderLeftWidth: 3,
                      borderLeftStyle: "solid",
                      borderLeftColor: s.dot,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--jt-text)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {card.c}
                    </div>
                    <div
                      style={{ fontSize: 10, color: "var(--jt-text-2)", marginTop: 1 }}
                    >
                      {card.r}
                    </div>
                    {col.glow && j === 0 && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          marginTop: 4,
                          padding: "1px 5px",
                          background: "var(--a-500)",
                          color: "#231300",
                          borderRadius: 4,
                          fontSize: 9,
                          fontWeight: 600,
                        }}
                      >
                        <Sparkles size={8} /> Offer
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Preview() {
  const t = useTranslations("landing.preview");
  const [tab, setTab] = React.useState<"track" | "visual" | "learn">("track");
  return (
    <section
      id="preview"
      style={{
        padding: "40px 20px",
        maxWidth: 1280,
        margin: "0 auto",
      }}
      className="sm:!py-16"
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <JtPill bg="var(--jt-bg-sunk)" color="var(--jt-text-2)">
          {t("pill")}
        </JtPill>
        <h2
          style={{
            fontSize: "clamp(28px, 4.4vw, 38px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            margin: "14px 0 8px",
            textWrap: "balance",
          }}
        >
          {t("title")}
        </h2>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <JtSegmented
          options={[
            { value: "track", label: t("tabs.track"), icon: <ListIcon size={14} /> },
            { value: "visual", label: t("tabs.visualize"), icon: <KanbanIcon size={14} /> },
            { value: "learn", label: t("tabs.learn"), icon: <BarChart3 size={14} /> },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      <PreviewMedia tab={tab} />
    </section>
  );
}

function PreviewMedia({ tab }: { tab: "track" | "visual" | "learn" }) {
  const t = useTranslations("landing.preview");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : false;
  const variant = isDark ? "dark" : "light";

  const sources: Record<typeof tab, { type: "image" | "video"; src: string; alt: string }> = {
    track: {
      type: "image",
      src: `/track_${variant}.png`,
      alt: t("altTrack"),
    },
    visual: {
      type: "image",
      src: `/visualize_${variant}.png`,
      alt: t("altVisualize"),
    },
    learn: {
      type: "image",
      src: `/learn_${variant}.png`,
      alt: t("altLearn"),
    },
  };
  const media = sources[tab];

  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-xl)",
        overflow: "hidden",
        boxShadow: "var(--sh-md)",
        lineHeight: 0,
      }}
    >
      {media.type === "image" ? (
        <Image
          key={media.src}
          src={media.src}
          alt={media.alt}
          width={2480}
          height={1114}
          sizes="(max-width: 1280px) 100vw, 1280px"
          style={{ width: "100%", height: "auto", display: "block" }}
          priority={tab === "track"}
        />
      ) : (
        <video
          key={media.src}
          src={media.src}
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      )}
    </div>
  );
}

function DeepDive() {
  const t = useTranslations("landing.deepDive");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const src = mounted && resolvedTheme === "dark"
    ? "/app_detail_dark.png"
    : "/app_detail_light.png";

  const checks = [
    t("checks.0"),
    t("checks.1"),
    t("checks.2"),
    t("checks.3"),
  ];

  return (
    <section
      style={{
        padding: "40px 20px",
        maxWidth: 1280,
        margin: "0 auto",
      }}
      className="sm:!py-16"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 28,
          alignItems: "center",
        }}
        className="lg:!grid-cols-[0.9fr_1.3fr] lg:!gap-14"
      >
        <div>
          <JtPill
            bg="var(--jt-bg-sunk)"
            color="var(--p-700)"
            icon={<Sparkles size={12} />}
          >
            {t("pill")}
          </JtPill>
          <h2
            style={{
              fontSize: "clamp(26px, 4vw, 36px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              margin: "16px 0 12px",
              textWrap: "balance",
            }}
          >
            {t("title")}
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--jt-text-2)",
              lineHeight: 1.6,
              margin: "0 0 18px",
              maxWidth: 460,
            }}
          >
            {t("body")}
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {checks.map((c) => (
              <li
                key={c}
                style={{
                  display: "inline-flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: 14,
                  color: "var(--jt-text)",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    flex: "0 0 16px",
                    height: 16,
                    borderRadius: 999,
                    background: "var(--p-100)",
                    color: "var(--p-700)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 2,
                  }}
                >
                  <Check size={10} strokeWidth={3} />
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div
          style={{
            borderRadius: "var(--r-xl)",
            overflow: "hidden",
            border: "1px solid var(--jt-border)",
            boxShadow: "var(--sh-lg)",
            background: "var(--jt-bg-elev)",
            lineHeight: 0,
          }}
        >
          <Image
            key={src}
            src={src}
            alt={t("alt")}
            width={2522}
            height={1620}
            sizes="(max-width: 1280px) 100vw, 760px"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </div>
    </section>
  );
}

function Compare() {
  const t = useTranslations("landing.compare");
  const keys = ["find", "follow", "rate", "move", "phone"] as const;
  const rows = keys.map((k) => ({
    row: t(`rows.${k}.need`),
    s: t(`rows.${k}.ss`),
    j: t(`rows.${k}.jt`),
  }));
  return (
    <section
      id="compare"
      style={{ padding: "40px 20px", maxWidth: 1280, margin: "0 auto" }}
      className="sm:!py-20"
    >
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h2
          style={{
            fontSize: "clamp(28px, 4.4vw, 38px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            margin: "0 0 8px",
            textWrap: "balance",
          }}
        >
          {t("title")}
        </h2>
        <p style={{ color: "var(--jt-text-2)", fontSize: 17, margin: 0 }}>
          {t("subtitle")}
        </p>
      </div>
      <div
        className="grid-cols-1 md:!grid-cols-[1fr_1fr_1fr]"
        style={{
          display: "grid",
          gap: 0,
          border: "1px solid var(--jt-border)",
          borderRadius: "var(--r-lg)",
          overflow: "hidden",
          background: "var(--jt-bg-elev)",
        }}
      >
        <div
          className="hidden md:block"
          style={{
            padding: "14px 20px",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--jt-text-3)",
            borderBottom: "1px solid var(--jt-border-2)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {t("colNeed")}
        </div>
        <div
          className="hidden md:block"
          style={{
            padding: "14px 20px",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--jt-text-3)",
            borderBottom: "1px solid var(--jt-border-2)",
            borderLeft: "1px solid var(--jt-border-2)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: "var(--jt-bg-sunk)",
          }}
        >
          {t("colSpreadsheet")}
        </div>
        <div
          className="hidden md:block"
          style={{
            padding: "14px 20px",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--p-700)",
            borderBottom: "1px solid var(--jt-border-2)",
            borderLeft: "1px solid var(--jt-border-2)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: "var(--p-50)",
          }}
        >
          {t("colJobTrack")}
        </div>
        {rows.map((r, i) => {
          const last = i === rows.length - 1;
          return (
            <React.Fragment key={i}>
              <div
                style={{
                  padding: "16px 20px",
                  fontSize: 15,
                  fontWeight: 500,
                  borderBottom: last ? "none" : "1px solid var(--jt-border-2)",
                }}
              >
                {r.row}
              </div>
              <div
                style={{
                  padding: "16px 20px",
                  fontSize: 14,
                  color: "var(--jt-text-2)",
                  borderBottom: last ? "none" : "1px solid var(--jt-border-2)",
                  background: "var(--jt-bg-sunk)",
                }}
                className="md:border-l md:border-[color:var(--jt-border-2)]"
              >
                {r.s}
              </div>
              <div
                style={{
                  padding: "16px 20px",
                  fontSize: 14,
                  color: "var(--p-700)",
                  borderBottom: last ? "none" : "1px solid var(--jt-border-2)",
                  background: "var(--p-50)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 500,
                }}
                className="md:border-l md:border-[color:var(--jt-border-2)]"
              >
                <Check size={14} color="var(--p-500)" /> {r.j}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}

function FeatureSlab() {
  const t = useTranslations("landing.features");
  const features = [
    {
      eyebrow: t("capture.eyebrow"),
      title: t("capture.title"),
      body: t("capture.body"),
      icon: <Zap />,
      accent: "var(--p-500)",
      mock: <MockCapture />,
    },
    {
      eyebrow: t("see.eyebrow"),
      title: t("see.title"),
      body: t("see.body"),
      icon: <TrendingUp />,
      accent: "var(--a-500)",
      mock: <MockFunnel />,
    },
    {
      eyebrow: t("followUp.eyebrow"),
      title: t("followUp.title"),
      body: t("followUp.body"),
      icon: <Bell />,
      accent: "var(--st-tech)",
      mock: <MockStale />,
    },
  ];
  return (
    <section
      id="features"
      style={{
        padding: "40px 20px",
        maxWidth: 1280,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 40,
      }}
      className="sm:!py-20 sm:!gap-20"
    >
      {features.map((f, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 20,
            alignItems: "center",
          }}
          className={
            i % 2
              ? "lg:!grid-cols-[1fr_1.1fr] lg:!gap-14"
              : "lg:!grid-cols-[1.1fr_1fr] lg:!gap-14"
          }
        >
          {i % 2 === 1 && <div className="hidden lg:block">{f.mock}</div>}
          <div>
            <JtPill
              bg="var(--jt-bg-sunk)"
              color={f.accent}
              icon={React.cloneElement(f.icon, { size: 12 } as React.SVGProps<SVGSVGElement>)}
            >
              {f.eyebrow}
            </JtPill>
            <h2
              style={{
                fontSize: "clamp(26px, 4vw, 36px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                margin: "16px 0 12px",
                textWrap: "balance",
              }}
            >
              {f.title}
            </h2>
            <p
              style={{
                fontSize: 17,
                color: "var(--jt-text-2)",
                lineHeight: 1.6,
                margin: 0,
                maxWidth: 480,
              }}
            >
              {f.body}
            </p>
          </div>
          {(i % 2 === 0 || true) && (
            <div className={i % 2 === 1 ? "lg:hidden" : ""}>{f.mock}</div>
          )}
        </div>
      ))}
    </section>
  );
}

function MockCapture() {
  const t = useTranslations("landing.mocks");
  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-xl)",
        padding: 24,
        boxShadow: "var(--sh-md)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--jt-text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 10,
        }}
      >
        {t("quickAdd")}
      </div>
      <div
        style={{
          background: "var(--jt-bg-sunk)",
          border: "1.5px solid var(--jt-border)",
          borderRadius: "var(--r-md)",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Plus size={16} color="var(--jt-text-3)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            Stripe → Senior Frontend Engineer
          </div>
        </div>
        <span className="kbd">⏎</span>
      </div>
      <div
        style={{
          marginTop: 14,
          padding: "10px 12px",
          background: "var(--p-50)",
          border: "1px solid var(--p-100)",
          borderRadius: "var(--r-md)",
          fontSize: 13,
          color: "var(--p-700)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Check size={14} color="var(--p-500)" /> {t("quickAddSuccess")}
      </div>
    </div>
  );
}

function MockFunnel() {
  const tStatus = useTranslations("status");
  const tMock = useTranslations("landing.mocks");
  const rows = [
    { label: tStatus("applied"), w: 100, n: 24, color: "var(--st-applied)" },
    { label: tStatus("test_case"), w: 67, n: 16, color: "var(--st-test)" },
    { label: tStatus("hr_interview"), w: 50, n: 12, color: "var(--st-hr)" },
    { label: tStatus("technical_interview"), w: 33, n: 8, color: "var(--st-tech)" },
    { label: tStatus("offer"), w: 12, n: 3, color: "var(--st-offer)" },
  ];
  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-xl)",
        padding: 24,
        boxShadow: "var(--sh-md)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--jt-text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 14,
        }}
      >
        {tMock("funnel")}
      </div>
      {rows.map((s, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}
        >
          <div style={{ width: 72, fontSize: 12, color: "var(--jt-text-2)" }}>
            {s.label}
          </div>
          <div
            style={{
              flex: 1,
              height: 18,
              background: "var(--jt-bg-sunk)",
              borderRadius: 4,
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${s.w}%`,
                height: "100%",
                background: s.color,
                borderRadius: 4,
                opacity: 0.85,
              }}
            />
          </div>
          <div
            className="mono"
            style={{ fontSize: 12, fontWeight: 500, width: 24, textAlign: "right" }}
          >
            {s.n}
          </div>
        </div>
      ))}
    </div>
  );
}

function MockStale() {
  const t = useTranslations("landing.mocks");
  return (
    <div
      style={{
        background: "var(--jt-bg-elev)",
        border: "1px solid var(--jt-border)",
        borderRadius: "var(--r-xl)",
        padding: 24,
        boxShadow: "var(--sh-md)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: 12,
          background: "var(--jt-bg-sunk)",
          borderRadius: "var(--r-md)",
          borderLeft: "3px solid var(--st-tech)",
        }}
      >
        <Clock size={18} color="var(--st-tech)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{t("staleTitle")}</div>
          <div style={{ fontSize: 12, color: "var(--jt-text-2)", marginTop: 2 }}>
            {t("staleBody")}
          </div>
        </div>
        <span
          style={{
            padding: "3px 8px",
            background: "var(--a-500)",
            color: "#231300",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {t("staleTag")}
        </span>
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 13,
          color: "var(--jt-text-2)",
          lineHeight: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Bell size={14} color="var(--st-tech)" />
        {t("staleReminder")}
      </div>
    </div>
  );
}

function Testimonials() {
  const tr = useTranslations();
  const t = tr.raw("loginV2.quotes") as {
    quote: string;
    name: string;
    role: string;
  }[];
  return (
    <section
      style={{ padding: "40px 20px", maxWidth: 1280, margin: "0 auto" }}
      className="sm:!py-16"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
        }}
        className="md:!grid-cols-3"
      >
        {t.map((q, i) => (
          <div
            key={i}
            style={{
              background: "var(--jt-bg-elev)",
              border: "1px solid var(--jt-border)",
              borderRadius: "var(--r-lg)",
              padding: 24,
            }}
          >
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.55,
                color: "var(--jt-text)",
                margin: 0,
                fontWeight: 400,
                letterSpacing: "-0.005em",
              }}
            >
              &ldquo;{q.quote}&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 99,
                  background: "linear-gradient(135deg, var(--p-300), var(--a-500))",
                }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{q.name}</div>
                <div style={{ fontSize: 12, color: "var(--jt-text-3)" }}>{q.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const t = useTranslations("landing.faq");
  const [open, setOpen] = React.useState<number>(0);
  const itemKeys = ["free", "data", "import", "mobile", "email", "delete"] as const;
  const qs = itemKeys.map((k) => ({ q: t(`items.${k}.q`), a: t(`items.${k}.a`) }));
  return (
    <section
      id="faq"
      style={{ padding: "40px 20px", maxWidth: 760, margin: "0 auto" }}
      className="sm:!py-20"
    >
      <h2
        style={{
          fontSize: "clamp(28px, 4.4vw, 36px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          margin: "0 0 32px",
          textAlign: "center",
        }}
      >
        {t("title")}
      </h2>
      <div
        style={{
          background: "var(--jt-bg-elev)",
          border: "1px solid var(--jt-border)",
          borderRadius: "var(--r-lg)",
          overflow: "hidden",
        }}
      >
        {qs.map((item, i) => (
          <div
            key={i}
            style={{
              borderBottom:
                i === qs.length - 1 ? "none" : "1px solid var(--jt-border-2)",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(open === i ? -1 : i)}
              style={{
                width: "100%",
                textAlign: "left",
                background: "transparent",
                border: "none",
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                color: "var(--jt-text)",
                cursor: "pointer",
              }}
            >
              <span style={{ fontWeight: 500, fontSize: 16, letterSpacing: "-0.01em" }}>
                {item.q}
              </span>
              <ChevronDown
                size={18}
                style={{
                  transform: open === i ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 200ms var(--jt-ease)",
                  color: "var(--jt-text-3)",
                  flexShrink: 0,
                }}
              />
            </button>
            {open === i && (
              <div
                style={{
                  padding: "0 22px 20px",
                  fontSize: 14,
                  color: "var(--jt-text-2)",
                  lineHeight: 1.6,
                }}
              >
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  const t = useTranslations("landing.finalCta");
  return (
    <section style={{ padding: "40px 20px" }} className="sm:!py-20">
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          background: "var(--p-50)",
          border: "1px solid var(--p-100)",
          borderRadius: "var(--r-xl)",
          padding: "36px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
        className="sm:!p-18"
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: 99,
            background: "radial-gradient(circle, var(--a-500), transparent 60%)",
            opacity: 0.15,
          }}
        />
        <JtPill
          bg="var(--jt-bg-elev)"
          color="var(--p-700)"
          border="1px solid var(--p-100)"
          icon={<Heart size={12} color="var(--p-500)" />}
        >
          {t("pill")}
        </JtPill>
        <h2
          style={{
            fontSize: "clamp(32px, 5.5vw, 48px)",
            fontWeight: 700,
            letterSpacing: "-0.035em",
            margin: "20px 0 12px",
            color: "var(--p-900)",
          }}
        >
          {t("title")}
        </h2>
        <p
          style={{
            fontSize: 18,
            color: "var(--jt-text-2)",
            maxWidth: 500,
            margin: "0 auto 28px",
          }}
        >
          {t("subtitle")}
        </p>
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            gap: 10,
          }}
          className="sm:!flex-row"
        >
          <Link href="/login">
            <JtButton size="lg" iconRight={<ArrowRight />}>
              {t("ctaPrimary")}
            </JtButton>
          </Link>
          <a
            href="https://github.com/berkinduz"
            target="_blank"
            rel="noopener noreferrer"
          >
            <JtButton variant="ghost" size="lg" icon={<Github />}>
              {t("ctaSecondary")}
            </JtButton>
          </a>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  const t = useTranslations("landing.footer");
  const cols: { title: string; items: { label: string; href: string; external?: boolean }[] }[] = [
    {
      title: t("colProduct"),
      items: [
        { label: t("links.features"), href: "#features" },
        { label: t("links.compare"), href: "#compare" },
        { label: t("links.faq"), href: "#faq" },
        { label: t("links.signIn"), href: "/login" },
      ],
    },
    {
      title: t("colCompany"),
      items: [
        { label: t("links.contact"), href: "mailto:hello@jobapplytracker.com", external: true },
        { label: t("links.github"), href: "https://github.com/berkinduz/job-apply-tracker", external: true },
        { label: t("links.privacy"), href: "/privacy" },
        { label: t("links.terms"), href: "/terms" },
      ],
    },
  ];
  return (
    <footer
      style={{
        padding: "40px 20px 24px",
        borderTop: "1px solid var(--jt-border-2)",
        background: "var(--jt-bg)",
      }}
      className="sm:!px-14 sm:!pt-16 sm:!pb-8"
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 32,
        }}
        className="md:!grid-cols-[1.6fr_1fr_1fr] md:!gap-10"
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <JtLogo size={22} />
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em" }}>
              jobtrack
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--jt-text-2)",
              marginTop: 12,
              maxWidth: 280,
              lineHeight: 1.55,
            }}
          >
            {t("tagline")}
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--jt-text)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              {c.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {c.items.map((i) =>
                i.external || i.href.startsWith("mailto:") ? (
                  <a
                    key={i.label}
                    href={i.href}
                    target={i.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={i.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                    style={{ fontSize: 14, color: "var(--jt-text-2)" }}
                  >
                    {i.label}
                  </a>
                ) : (
                  <Link
                    key={i.label}
                    href={i.href}
                    style={{ fontSize: 14, color: "var(--jt-text-2)" }}
                  >
                    {i.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          maxWidth: 1280,
          margin: "36px auto 0",
          paddingTop: 20,
          borderTop: "1px solid var(--jt-border-2)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 12,
          fontSize: 12,
          color: "var(--jt-text-3)",
        }}
        className="sm:!flex-row"
      >
        <div>{t("copyright")}</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a
            href="https://github.com/berkinduz"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Github size={13} /> GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/berkinduz/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("linkedIn")}
          </a>
        </div>
      </div>
    </footer>
  );
}
