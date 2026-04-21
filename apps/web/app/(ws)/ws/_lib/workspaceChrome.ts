import { getWebDictionary } from "@/lib/i18n";
import type { AppLocale } from "@/lib/locale";
import type { WorkspaceZoneKey } from "@/server/contracts/workspace";
import { getWorkspaceZonesForKeys } from "./zones";

export type WorkspaceShellVariant = "default" | "assistant";

type WorkspaceMatchMode = "exact" | "section";

const ASSISTANT_CHROME_HREFS = ["/ws", "/ws/notifications", "/ws/settings", "/ws/me"] as const;

function resolveWorkspaceMatchMode(href: string, mode?: WorkspaceMatchMode) {
  if (mode) return mode;
  return href === "/ws" ? "exact" : "section";
}

export function matchesWorkspacePath(pathname: string, href: string, mode?: WorkspaceMatchMode) {
  const resolvedMode = resolveWorkspaceMatchMode(href, mode);
  if (resolvedMode === "exact") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function resolveWorkspaceShellVariant(pathname: string): WorkspaceShellVariant {
  return ASSISTANT_CHROME_HREFS.some((href) => matchesWorkspacePath(pathname, href))
    ? "assistant"
    : "default";
}

export function resolveWorkspaceHeaderTitle(args: {
  pathname: string;
  variant: WorkspaceShellVariant;
  visibleZoneKeys?: WorkspaceZoneKey[];
  locale: AppLocale;
  organizationSubtitle: string;
  explicitTitle?: string;
}) {
  if (args.explicitTitle) {
    return args.explicitTitle;
  }

  const dictionary = getWebDictionary(args.locale);
  if (args.variant === "assistant") {
    return dictionary.nav.assistantTitle;
  }

  const matchedZone = getWorkspaceZonesForKeys(args.visibleZoneKeys ?? ["overview"], args.locale).find((item) =>
    matchesWorkspacePath(args.pathname, item.href),
  );

  return matchedZone?.label ?? args.organizationSubtitle;
}

export function getWorkspaceChromeState(args: {
  pathname: string;
  visibleZoneKeys?: WorkspaceZoneKey[];
  locale: AppLocale;
  organizationSubtitle: string;
  explicitTitle?: string;
  variantOverride?: WorkspaceShellVariant;
}) {
  const variant = args.variantOverride ?? resolveWorkspaceShellVariant(args.pathname);

  return {
    variant,
    isAssistantHome: variant === "assistant" && args.pathname === "/ws",
    headerTitle: resolveWorkspaceHeaderTitle({
      pathname: args.pathname,
      variant,
      visibleZoneKeys: args.visibleZoneKeys,
      locale: args.locale,
      organizationSubtitle: args.organizationSubtitle,
      explicitTitle: args.explicitTitle,
    }),
  };
}
