import type { Metadata } from "next";
import Script from "next/script";
import { redirect } from "next/navigation";
import { JtLanding } from "@/components/jt/landing";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: { canonical: "/" },
  twitter: {
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: siteConfig.description,
  url: siteConfig.url,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/applications");
  }

  return (
    <>
      <Script
        id="jsonld-jobtrack"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JtLanding />
    </>
  );
}
