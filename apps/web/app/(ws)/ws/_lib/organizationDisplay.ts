import type { AppLocale } from "@/lib/locale";
import { getWebDictionary } from "@/lib/i18n";

type OrganizationDisplayInput = {
  name: string | null | undefined;
  type?: string | null;
  status?: string | null;
  logoUrl?: string | null;
  isVerified?: boolean;
  zoneLabel?: string | null;
  locale?: AppLocale;
};

export type WorkspaceOrganizationDisplay = {
  name: string;
  sidebarSubtitle: string;
  navbarSubtitle: string;
  logoUrl: string | null;
  isVerified: boolean;
  typeKey?: "developer" | "broker";
  typeLabel?: string;
};

const BANNED_NAME_FRAGMENTS = [
  /anan/gi,
  /عنان/gi,
  /institutional/gi,
  /workspace/gi,
];

/**
 * WHY:   Workspace chrome should present a clean organization identity instead of leaking backend naming noise or platform branding.
 * WHAT:  Normalizes an organization name for display by stripping banned fragments, decorative punctuation, and repeated separators.
 * HOW:   Applies a deterministic cleanup pipeline and falls back to a safe Arabic label when nothing usable remains.
 */
export function formatWorkspaceOrganizationName(name: string | null | undefined, locale: AppLocale = "ar") {
  const initialValue = (name ?? "").trim();
  const withoutBannedWords = BANNED_NAME_FRAGMENTS.reduce(
    (value, pattern) => value.replace(pattern, " "),
    initialValue,
  );

  const cleanedValue = withoutBannedWords
    .replace(/[_|\\/]+/g, " ")
    .replace(/[^\p{L}\p{N}\s\-]/gu, " ")
    .replace(/\s*-\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleanedValue || getWebDictionary(locale).nav.workspaceFallback;
}

function formatOrganizationType(type: string | null | undefined, locale: AppLocale) {
  const dictionary = getWebDictionary(locale);
  return type === "red" ? dictionary.status.developer : dictionary.status.broker;
}

function formatOrganizationStatus(status: string | null | undefined, locale: AppLocale) {
  const dictionary = getWebDictionary(locale);
  return status === "active" ? dictionary.status.active : dictionary.status.pendingReview;
}

/**
 * WHY:   Overview and zone shells need one shared identity model for sidebars and navbars.
 * WHAT:  Produces the sanitized organization name plus Arabic-only secondary labels for the sidebar and navbar.
 * HOW:   Reuses the shared name formatter and derives contextual subtitles from the org type, status, and current zone.
 */
export function getWorkspaceOrganizationDisplay({
  name,
  type,
  status,
  logoUrl,
  isVerified,
  zoneLabel,
  locale = "ar",
}: OrganizationDisplayInput): WorkspaceOrganizationDisplay {
  const sanitizedName = formatWorkspaceOrganizationName(name, locale);
  const typeLabel = formatOrganizationType(type, locale);
  const navbarSubtitle = `${typeLabel} · ${formatOrganizationStatus(status, locale)}`;

  return {
    name: sanitizedName,
    sidebarSubtitle: zoneLabel || navbarSubtitle,
    navbarSubtitle,
    logoUrl: logoUrl ?? null,
    isVerified: isVerified === true,
    typeKey: type === "red" ? "developer" : "broker",
    typeLabel,
  };
}
