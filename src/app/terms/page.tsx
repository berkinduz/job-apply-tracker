import type { Metadata } from "next";
import { JtLegalShell } from "@/components/jt/legal-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms you agree to when using JobTrack.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <JtLegalShell title="Terms of Service" updatedAt="May 16, 2026">
      <p>
        These terms govern your use of JobTrack. By creating an account you agree to them.
        If anything here is unclear, email{" "}
        <a href="mailto:hello@jobapplytracker.com">hello@jobapplytracker.com</a> before
        signing up.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be at least sixteen years old, or the minimum digital-consent age in your
        country, whichever is higher.
      </p>

      <h2>Your account</h2>
      <p>
        You are responsible for keeping your credentials safe. Notify us immediately if you
        suspect unauthorized access. We may suspend or terminate accounts that abuse the
        service, attempt to harm other users, or violate these terms or applicable law.
      </p>

      <h2>Your content</h2>
      <p>
        You own everything you upload — applications, notes, resumes, cover letters. You
        grant us a limited license only to store, transmit, and display that content back
        to you so the product can function. We do not use your content to train AI models.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>No scraping, automated abuse, or attempting to reverse-engineer the service.</li>
        <li>No uploading unlawful, harassing, or infringing content.</li>
        <li>No attempting to access other users&rsquo; data.</li>
      </ul>

      <h2>Free service</h2>
      <p>
        JobTrack is currently free to use. We may introduce paid plans in the future for
        additional features; existing functionality you rely on today will remain
        available at no cost, or we will notify you in advance with a reasonable
        transition period.
      </p>

      <h2>Service availability</h2>
      <p>
        We aim for high availability but do not guarantee uninterrupted service. The
        product is provided &ldquo;as is&rdquo; without warranties of any kind.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, JobTrack and its operators are not liable
        for indirect, incidental, or consequential damages arising from your use of the
        service. Our total liability for any claim is limited to the amount you paid for
        the service in the twelve months prior, which is zero for the free tier.
      </p>

      <h2>Termination</h2>
      <p>
        You can delete your account at any time from Settings, which removes your data per
        the Privacy Policy. We may terminate accounts that breach these terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the Republic of Türkiye, without regard to
        conflict-of-law principles. Disputes will be resolved in the courts of Istanbul.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms; continued use after a posted change means you accept
        the revised version. The &ldquo;Last updated&rdquo; date above always reflects the
        current version.
      </p>
    </JtLegalShell>
  );
}
