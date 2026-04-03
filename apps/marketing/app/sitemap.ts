import type { MetadataRoute } from "next";
import { getMarketingContent } from "@/lib/marketing-content";
import { WEB_SUPPORTED_LOCALES } from "@/lib/locale";
import { indexableStaticPaths, withLocale } from "@/lib/routes";
import { getMarketingBaseUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getMarketingBaseUrl();
  const lastModified = new Date();
  const blogPaths = getMarketingContent("en").blog.posts.map((post) => `/blog/${post.slug}`);
  const localizedRoutes = [...indexableStaticPaths, ...blogPaths].flatMap((path) =>
    WEB_SUPPORTED_LOCALES.map((locale) => withLocale(locale, path)),
  );

  return localizedRoutes.map((route) => ({
    url: new URL(route, baseUrl).toString(),
    lastModified,
    changeFrequency:
      route.includes("/blog/") ? "monthly" : route.includes("/docs/") ? "monthly" : "weekly",
    priority:
      route === "/ar" || route === "/en" || route === "/fr" ? 1 : route.includes("/docs/") ? 0.8 : 0.7,
  }));
}
