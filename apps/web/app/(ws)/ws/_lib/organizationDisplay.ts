type OrganizationDisplayInput = {
  name: string | null | undefined;
  type?: string | null;
  status?: string | null;
  zoneLabel?: string | null;
};

export type WorkspaceOrganizationDisplay = {
  name: string;
  sidebarSubtitle: string;
  navbarSubtitle: string;
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
export function formatWorkspaceOrganizationName(name: string | null | undefined) {
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

  return cleanedValue || "مساحة العمل";
}

function formatOrganizationType(type?: string | null) {
  return type === "red" ? "مطور" : "وسيط";
}

function formatOrganizationStatus(status?: string | null) {
  return status === "active" ? "نشط" : "قيد المراجعة";
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
  zoneLabel,
}: OrganizationDisplayInput): WorkspaceOrganizationDisplay {
  const sanitizedName = formatWorkspaceOrganizationName(name);
  const navbarSubtitle = `${formatOrganizationType(type)} · ${formatOrganizationStatus(status)}`;

  return {
    name: sanitizedName,
    sidebarSubtitle: zoneLabel || navbarSubtitle,
    navbarSubtitle,
  };
}
