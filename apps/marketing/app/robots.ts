import type { MetadataRoute } from "next";
import { getMarketingBaseUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getMarketingBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/ar", "/ar/", "/en", "/en/", "/fr", "/fr/"],
      disallow: ["/api/"],
    },
    sitemap: `${baseUrl.toString().replace(/\/$/, "")}/sitemap.xml`,
  };
}

