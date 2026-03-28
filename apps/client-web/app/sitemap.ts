import type { MetadataRoute } from "next";
import { getClientWebBaseUrl } from "@/lib/site";

const PUBLIC_ROUTES = ["/", "/search", "/loans", "/signin", "/about"] as const;

/**
 * WHY:   Search engines need one stable list of public buyer-facing routes at launch.
 * WHAT:  Serves a static sitemap for the indexable client web pages.
 * HOW:   Builds route URLs from the resolved deployment origin and stamps them with the current generation time.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getClientWebBaseUrl();
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: new URL(route, baseUrl).toString(),
    lastModified,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
