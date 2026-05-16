import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/u/", "/u/*", "/privacy", "/terms"],
        disallow: [
          "/applications",
          "/applications/",
          "/applications/*",
          "/analytics",
          "/analytics/*",
          "/settings",
          "/settings/*",
          "/onboarding",
          "/onboarding/*",
          "/reset-password",
          "/reset-password/*",
          "/auth",
          "/auth/*",
          "/api",
          "/api/*",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
