"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JtLogo } from "@/components/jt/primitives";

export function JtLegalShell({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "var(--jt-bg)", color: "var(--jt-text)", minHeight: "100vh" }}>
      <header
        style={{
          borderBottom: "1px solid var(--jt-border-2)",
          background: "color-mix(in oklab, var(--jt-bg) 88%, transparent)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <JtLogo size={22} />
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>
              jobtrack
            </span>
          </Link>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--jt-text-2)",
            }}
          >
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </header>
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 80px" }}>
        <h1
          style={{
            fontSize: "clamp(28px, 4vw, 38px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            margin: "0 0 8px",
          }}
        >
          {title}
        </h1>
        <p style={{ color: "var(--jt-text-3)", fontSize: 13, margin: "0 0 28px" }}>
          Last updated {updatedAt}
        </p>
        <article className="jt-legal-prose">{children}</article>
      </main>
    </div>
  );
}
