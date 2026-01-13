import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  LayoutGrid,
  Bell,
  LineChart,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GifShowcase } from "@/components/layout/gif-showcase";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Job Application Tracker",
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
  },
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

  const t = await getTranslations("landing");

  return (
    <>
      <Script
        id="jsonld-jobtrack"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative overflow-hidden rounded-3xl border bg-background/80 p-8 sm:p-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/10" />
        <div className="absolute -top-24 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-16 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="space-y-10">
          <div className="space-y-6 max-w-2xl">
            <Badge className="w-fit" variant="secondary">
              {t("badge")}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <Button size="lg">
                  {t("ctaPrimary")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#preview">
                <Button size="lg" variant="outline">
                  {t("ctaSecondary")}
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span>{t("highlights.pipeline")}</span>
              <span>{t("highlights.filters")}</span>
              <span>{t("highlights.theme")}</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-background shadow-2xl">
            <div className="relative w-full">
              <Image
                src="/hero_preview_light.png"
                alt={t("heroAlt")}
                width={1600}
                height={960}
                className="w-full object-cover dark:hidden"
                priority
              />
              <Image
                src="/hero_preview_dark.png"
                alt={t("heroAlt")}
                width={1600}
                height={960}
                className="hidden w-full object-cover dark:block"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section id="preview" className="mt-14 scroll-mt-24">
        <GifShowcase
          labels={{
            kanban: t("preview.tabs.kanban"),
            detail: t("preview.tabs.detail"),
          }}
          alts={{
            kanban: t("preview.alts.kanban"),
            detail: t("preview.alts.detail"),
          }}
        />
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: LayoutGrid,
            title: t("features.kanban.title"),
            description: t("features.kanban.description"),
          },
          {
            icon: LineChart,
            title: t("features.insights.title"),
            description: t("features.insights.description"),
          },
          {
            icon: FileText,
            title: t("features.notes.title"),
            description: t("features.notes.description"),
          },
          {
            icon: Bell,
            title: t("features.timeline.title"),
            description: t("features.timeline.description"),
          },
        ].map((feature) => (
          <Card key={feature.title} className="bg-background/80">
            <CardHeader>
              <CardTitle className="flex items-start gap-2 text-base">
                <feature.icon className="h-4 w-4 shrink-0 text-primary translate-y-1" />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {feature.description}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-24 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("sections.analytics.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("sections.analytics.description")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {t("sections.analytics.bullets")
              .split("|")
              .map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border bg-background shadow-2xl">
          <Image
            src="/analytics_light.png"
            alt="Analytics Dashboard Preview"
            width={1600}
            height={960}
            className="w-full object-cover p-3 dark:hidden"
          />
          <Image
            src="/analytics_dark.png"
            alt="Analytics Dashboard Preview"
            width={1600}
            height={960}
            className="hidden w-full object-cover p-3 dark:block"
          />
        </div>
      </section>

      <section className="mt-24 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>{t("sections.commandCenter.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>{t("sections.commandCenter.description")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {t("sections.commandCenter.bullets")
                .split("|")
                .map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>{t("sections.dailyUse.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>{t("sections.dailyUse.description")}</p>
            <div className="flex flex-wrap gap-2">
              {t("sections.dailyUse.badges")
                .split("|")
                .map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-16 rounded-3xl border bg-primary/5 p-8 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("ctaBottom.title")}</h2>
            <p className="mt-2 text-muted-foreground">
              {t("ctaBottom.description")}
            </p>
          </div>
          <Link href="/login">
            <Button size="lg">
              {t("ctaBottom.button")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
