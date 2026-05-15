"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

import { JtApplicationForm } from "@/components/jt/application-form";
import { JtButton } from "@/components/jt/primitives";
import { useApplicationStore } from "@/store";

export default function EditApplicationPage() {
  const params = useParams<{ id: string }>();
  const { getApplicationById, fetchApplications, _hasHydrated, isLoading } =
    useApplicationStore();

  useEffect(() => {
    if (!_hasHydrated) fetchApplications();
  }, [_hasHydrated, fetchApplications]);

  const application = getApplicationById(params?.id || "");

  if (!_hasHydrated || isLoading) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <p style={{ color: "var(--jt-text-2)" }}>Loading…</p>
      </main>
    );
  }

  if (!application) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <p style={{ color: "var(--jt-text-2)", marginBottom: 16 }}>Application not found.</p>
        <Link href="/applications">
          <JtButton variant="secondary" icon={<ArrowLeft size={14} />}>
            Back to applications
          </JtButton>
        </Link>
      </main>
    );
  }

  return <JtApplicationForm application={application} isEditing />;
}
