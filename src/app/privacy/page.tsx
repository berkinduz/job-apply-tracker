import type { Metadata } from "next";
import { JtLegalShell } from "@/components/jt/legal-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How JobTrack collects, stores, and protects your data. Short version: your data is yours.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <JtLegalShell title="Privacy Policy" updatedAt="May 16, 2026">
      <p>
        JobTrack (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a personal job-application tracker
        built for individual job seekers. This document explains, in plain English, what
        we collect, why, and what your rights are.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>You own your data. You can export or delete it any time.</li>
        <li>We do not sell, rent, or share your data with advertisers.</li>
        <li>We store the minimum we need to make the app work.</li>
        <li>Data is hosted in the EU on Supabase infrastructure.</li>
      </ul>

      <h2>What we collect</h2>
      <h3>Account data</h3>
      <p>
        Email address, hashed password (when you sign up with email), or an OAuth identifier
        when you sign in with Google or GitHub. We store your display name if you provide one.
      </p>
      <h3>Application data</h3>
      <p>
        Everything you enter about your job applications — company, role, notes, contacts,
        resumes you upload, and any cover letters you save. This data is encrypted at rest
        and visible only to you. Row-level security policies enforce per-user isolation.
      </p>
      <h3>Usage analytics</h3>
      <p>
        We collect anonymous, aggregated usage metrics (page views, route timings) via
        Vercel Analytics. We do not use cookies for analytics and do not track you across
        other sites.
      </p>

      <h2>What we do not collect</h2>
      <ul>
        <li>Marketing trackers, advertising cookies, third-party pixels.</li>
        <li>Your contacts, calendar, or other personal information unless you paste it in.</li>
        <li>Resume contents in any AI model, unless you opt in to a future AI feature.</li>
      </ul>

      <h2>How long we keep it</h2>
      <p>
        Your account and application data are retained until you delete them. Deleting your
        account from Settings removes all related data within seven days, including
        uploaded resumes. Backups are rotated within thirty days.
      </p>

      <h2>Your rights</h2>
      <p>
        Under GDPR and similar regulations you can access, correct, export, or erase your
        data at any time. The Settings page offers export and delete actions; for anything
        else email <a href="mailto:hello@jobapplytracker.com">hello@jobapplytracker.com</a>.
      </p>

      <h2>Sub-processors</h2>
      <ul>
        <li>
          <strong>Supabase</strong> (EU region) — database, authentication, file storage.
        </li>
        <li>
          <strong>Vercel</strong> — hosting and analytics.
        </li>
        <li>
          <strong>Resend</strong> (if enabled) — transactional email delivery for magic links
          and reminders.
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use first-party cookies only for authentication (keeping you signed in) and to
        remember your theme and language preferences. No analytics or advertising cookies.
      </p>

      <h2>Changes</h2>
      <p>
        We will post material changes here and, when meaningful, notify you by email. The
        &ldquo;Last updated&rdquo; date above always reflects the current version.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href="mailto:hello@jobapplytracker.com">hello@jobapplytracker.com</a>.
      </p>
    </JtLegalShell>
  );
}
