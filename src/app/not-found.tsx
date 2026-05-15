import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JtButton, JtLogo } from "@/components/jt/primitives";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false },
};

export default function NotFound() {
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
      </header>
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 540 }}>
          <div
            style={{
              fontSize: "clamp(72px, 14vw, 120px)",
              fontWeight: 700,
              letterSpacing: "-0.05em",
              color: "var(--p-500)",
              lineHeight: 1,
              margin: 0,
              fontFamily: "var(--font-mono)",
            }}
          >
            404
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: "16px 0 8px",
            }}
          >
            Looks like that one never made it to interview.
          </h1>
          <p style={{ color: "var(--jt-text-2)", fontSize: 15, margin: "0 0 28px" }}>
            The page you&apos;re after doesn&apos;t exist — or maybe it&apos;s still in HR.
          </p>
          <div
            style={{
              display: "inline-flex",
              gap: 10,
              flexDirection: "column",
            }}
            className="sm:!flex-row"
          >
            <Link href="/applications">
              <JtButton size="lg" icon={<ArrowLeft size={16} />}>
                Back to applications
              </JtButton>
            </Link>
            <Link href="/">
              <JtButton size="lg" variant="ghost">
                Home
              </JtButton>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
