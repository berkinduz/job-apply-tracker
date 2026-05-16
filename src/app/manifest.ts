import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JobTrack — Job Application Tracker",
    short_name: "JobTrack",
    description: siteConfig.description,
    start_url: "/applications",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0c0c10",
    theme_color: "#4F46E5",
    categories: ["productivity", "business"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
