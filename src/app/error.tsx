"use client";

import * as React from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { JtButton, JtLogo } from "@/components/jt/primitives";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    if (typeof window !== "undefined" && "console" in window) {
      console.error(error);
    }
  }, [error]);

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
          padding: 20,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              margin: "0 0 12px",
            }}
          >
            Something broke on our end.
          </h1>
          <p
            style={{
              color: "var(--jt-text-2)",
              fontSize: 15,
              margin: "0 0 24px",
              lineHeight: 1.6,
            }}
          >
            We&apos;re sorry — try again, or head back to your applications.
            {error.digest && (
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  color: "var(--jt-text-3)",
                  fontFamily: "var(--font-mono)",
                  marginTop: 10,
                }}
              >
                error id: {error.digest}
              </span>
            )}
          </p>
          <div
            style={{
              display: "inline-flex",
              gap: 10,
              flexDirection: "column",
            }}
            className="sm:!flex-row"
          >
            <JtButton size="lg" onClick={reset} icon={<RotateCw size={16} />}>
              Try again
            </JtButton>
            <Link href="/applications">
              <JtButton size="lg" variant="ghost">
                Back to applications
              </JtButton>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
