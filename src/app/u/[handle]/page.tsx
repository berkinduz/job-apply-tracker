import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicProfile } from "@/lib/public-profile/stats";
import { JtPublicProfile } from "@/components/jt/public-profile";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ handle: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 min — fresh enough, cheap caching

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) return { title: "Profile not found" };
  const title = `${profile.displayName} — Job hunt`;
  const description = `${profile.totalApplications} applications · ${profile.responseRatePercent}% response rate · ${profile.offerCount} offer${profile.offerCount === 1 ? "" : "s"} on JobTrack.`;
  return {
    title,
    description,
    alternates: { canonical: `/u/${profile.handle}` },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/u/${profile.handle}`,
      type: "profile",
      images: [`/u/${profile.handle}/og`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/u/${profile.handle}/og`],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) {
    notFound();
  }

  return (
    <div
      style={{
        background: "var(--jt-bg)",
        color: "var(--jt-text)",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--jt-border-2)",
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: "-0.02em",
            color: "var(--jt-text)",
          }}
        >
          jobtrack
        </Link>
        <Link
          href="/login?mode=signup"
          style={{
            fontSize: 13,
            color: "var(--p-600)",
            fontWeight: 500,
          }}
        >
          Track yours →
        </Link>
      </header>
      <JtPublicProfile profile={profile} />
    </div>
  );
}
