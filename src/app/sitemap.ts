import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();
  // Marketing routes — always included.
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Public user profiles — only those opted-in. Skip silently if admin
  // client is unavailable (e.g. local dev without service role key).
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("user_settings")
      .select("public_handle, updated_at")
      .eq("public_enabled", true)
      .not("public_handle", "is", null)
      .limit(1000);
    for (const row of data || []) {
      if (!row.public_handle) continue;
      entries.push({
        url: `${base}/u/${row.public_handle}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // Service role missing locally — fine, prod sitemap will fill in.
  }

  return entries;
}
