import type { Metadata } from "next";
import type { AppLocale } from "./locale";
import { marketingBrand } from "./brand";
import { getMarketingContent } from "./marketing-content";
import { buildLocaleAlternates, withLocale } from "./routes";
import referenceLinks from "@/content/Reference and Links.json";

const MARKETING_LOCAL_DEV_URL = "http://localhost:3002";
const WORKSPACE_LOCAL_DEV_URL = "http://localhost:3000/signin";
const ASSISTANT_LOCAL_DEV_URL = "http://localhost:3101/app";
const DOCS_LOCAL_DEV_URL = "http://localhost:3002/en/docs";
const PARTNER_LOCAL_DEV_URL = "http://localhost:3000/partners";

type ReferenceLinks = {
  workspaceUrl?: string;
  assistantUrl?: string;
  docsUrl?: string;
  partnerUrl?: string;
  social?: {
    linkedin?: string;
    x?: string;
    instagram?: string;
    facebook?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
  };
};

function normalizeAbsoluteUrl(value?: string | null) {
  if (!value?.trim()) return null;

  const normalized = value.trim().startsWith("http")
    ? value.trim()
    : `https://${value.trim()}`;

  try {
    return new URL(normalized);
  } catch {
    return null;
  }
}

export function getMarketingBaseUrl() {
  return (
    normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeAbsoluteUrl(process.env.SITE_URL) ??
    normalizeAbsoluteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeAbsoluteUrl(process.env.VERCEL_URL) ??
    new URL(MARKETING_LOCAL_DEV_URL)
  );
}

export function getWorkspaceEntryUrl() {
  return (
    normalizeAbsoluteUrl((referenceLinks as ReferenceLinks).workspaceUrl)?.toString() ??
    normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_WORKSPACE_ENTRY_URL)?.toString() ??
    WORKSPACE_LOCAL_DEV_URL
  );
}

export function getAssistantUrl() {
  return (
    normalizeAbsoluteUrl((referenceLinks as ReferenceLinks).assistantUrl)?.toString() ??
    normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_ASSISTANT_URL)?.toString() ??
    ASSISTANT_LOCAL_DEV_URL
  );
}

export function getPartnerUrl() {
  return (
    normalizeAbsoluteUrl((referenceLinks as ReferenceLinks).partnerUrl)?.toString() ??
    PARTNER_LOCAL_DEV_URL
  );
}

export function getDocsUrl() {
  return (
    normalizeAbsoluteUrl((referenceLinks as ReferenceLinks).docsUrl)?.toString() ??
    normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_DOCS_URL)?.toString() ??
    DOCS_LOCAL_DEV_URL
  );
}

export function getReferenceLinks() {
  const links = referenceLinks as ReferenceLinks;

  return {
    workspaceUrl: getWorkspaceEntryUrl(),
    assistantUrl: getAssistantUrl(),
    docsUrl: getDocsUrl(),
    partnerUrl: getPartnerUrl(),
    social: {
      linkedin: normalizeAbsoluteUrl(links.social?.linkedin)?.toString() ?? "",
      x: normalizeAbsoluteUrl(links.social?.x)?.toString() ?? "",
      instagram: normalizeAbsoluteUrl(links.social?.instagram)?.toString() ?? "",
      facebook: normalizeAbsoluteUrl(links.social?.facebook)?.toString() ?? "",
    },
    contact: {
      email: links.contact?.email?.trim() ?? "info@anan.sa",
      phone: links.contact?.phone?.trim() ?? "920000000",
    },
  };
}

export function getLocalizedUrl(locale: AppLocale, path = "/") {
  return new URL(withLocale(locale, path), getMarketingBaseUrl()).toString();
}

export function createPageMetadata(locale: AppLocale, path: string, title: string, description: string): Metadata {
  const content = getMarketingContent(locale);
  const canonical = getLocalizedUrl(locale, path);

  return {
    metadataBase: getMarketingBaseUrl(),
    title,
    description,
    applicationName: marketingBrand.legalName,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        Object.entries(buildLocaleAlternates(path)).map(([altLocale, altPath]) => [
          altLocale,
          new URL(altPath, getMarketingBaseUrl()).toString(),
        ]),
      ),
    },
    openGraph: {
      type: "website",
      locale,
      url: canonical,
      title,
      description,
      siteName: content.site.siteName,
      images: [{ url: marketingBrand.ogImagePath, alt: marketingBrand.name }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [marketingBrand.ogImagePath],
    },
    icons: {
      icon: marketingBrand.iconPath,
      shortcut: marketingBrand.iconPath,
      apple: marketingBrand.iconPath,
    },
  };
}

export function createOrganizationStructuredData(locale: AppLocale) {
  const content = getMarketingContent(locale);
  const websiteUrl = getMarketingBaseUrl().toString();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${websiteUrl}#organization`,
        name: marketingBrand.legalName,
        alternateName: marketingBrand.alternateNames,
        url: websiteUrl,
        logo: new URL(marketingBrand.logoPath, getMarketingBaseUrl()).toString(),
        description: content.site.companyDescription,
        areaServed: "Saudi Arabia",
        knowsAbout: [
          "Real estate AI",
          "Property demand qualification",
          "Developer distribution",
          "Broker collaboration",
          "Commercial operations",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${websiteUrl}#website`,
        name: content.site.siteName,
        alternateName: marketingBrand.alternateNames,
        url: websiteUrl,
        description: content.site.defaultDescription,
        inLanguage: locale,
      },
    ],
  };
}
