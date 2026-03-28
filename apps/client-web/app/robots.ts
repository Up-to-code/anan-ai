import type { MetadataRoute } from "next";
import { getClientWebBaseUrl } from "@/lib/site";

/**
 * WHY:   Public launch requires a crawl policy for search engines and deployment consistency.
 * WHAT:  Serves the buyer app robots.txt configuration.
 * HOW:   Allows crawling of public routes and points crawlers to the generated sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getClientWebBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/search", "/loans", "/signin", "/about"],
      disallow: ["/app", "/app/history", "/app/handoff"],
    },
    sitemap: `${baseUrl.toString().replace(/\/$/, "")}/sitemap.xml`,
  };
}
