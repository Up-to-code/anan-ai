"use client";

import { cn } from "@/lib/utils";

export type WorkspaceAssistantBadgeTone =
  | "assistant"
  | "projects"
  | "offers"
  | "crm"
  | "organization"
  | "inbox"
  | "neutral";

export type WorkspaceAssistantBadge = {
  id: string;
  label: string;
  tone: WorkspaceAssistantBadgeTone;
};

type WorkspaceAssistantRoutingMeta = {
  assistantLabel?: string;
  agentName?: string;
  primaryTeamId?: string;
  teamIds?: string[];
};

const WORKSPACE_ASSISTANT_LABEL = "Anan AI";

const TEAM_BADGE_META: Record<
  string,
  {
    tone: WorkspaceAssistantBadgeTone;
    ar: string;
    en: string;
  }
> = {
  team_workspace_projects: {
    tone: "projects",
    ar: "فريق المشاريع",
    en: "Projects Team",
  },
  team_workspace_offers: {
    tone: "offers",
    ar: "فريق العروض",
    en: "Offers Team",
  },
  team_workspace_crm: {
    tone: "crm",
    ar: "فريق CRM",
    en: "CRM Team",
  },
  team_workspace_org: {
    tone: "organization",
    ar: "فريق المنظمة",
    en: "Organization Team",
  },
  team_workspace_inbox: {
    tone: "inbox",
    ar: "فريق الوارد",
    en: "Inbox Team",
  },
};

const TONE_CLASS_NAMES: Record<WorkspaceAssistantBadgeTone, string> = {
  assistant: "border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,var(--workspace-border))] bg-[var(--workspace-highlight)] text-white dark:bg-[var(--workspace-highlight)] dark:text-white",
  projects: "border-[color:color-mix(in_srgb,var(--workspace-highlight)_20%,var(--workspace-border))] bg-[var(--workspace-highlight-soft)] text-[var(--workspace-highlight)] dark:bg-[var(--workspace-highlight-soft)] dark:text-[#dbeafe]",
  offers: "border-[color:color-mix(in_srgb,var(--workspace-highlight)_18%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,var(--workspace-panel))] text-[var(--workspace-bubble-other-foreground)] dark:text-[#e5edff]",
  crm: "border-[color:color-mix(in_srgb,var(--workspace-highlight)_18%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_7%,var(--workspace-panel))] text-[var(--workspace-bubble-other-foreground)] dark:text-[#e5edff]",
  organization: "border-[color:color-mix(in_srgb,var(--workspace-highlight)_18%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_6%,var(--workspace-panel))] text-[var(--workspace-bubble-other-foreground)] dark:text-[#e5edff]",
  inbox: "border-[color:color-mix(in_srgb,var(--workspace-highlight)_18%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_9%,var(--workspace-panel))] text-[var(--workspace-bubble-other-foreground)] dark:text-[#e5edff]",
  neutral: "border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[var(--workspace-bubble-other-foreground)] dark:bg-[var(--workspace-elevated)] dark:text-[var(--workspace-bubble-other-foreground)]",
};

function toMetaRecord(meta: unknown): Record<string, unknown> | null {
  return meta && typeof meta === "object" ? (meta as Record<string, unknown>) : null;
}

function resolveTeamBadge(teamId: string, isArabic: boolean): WorkspaceAssistantBadge {
  const meta = TEAM_BADGE_META[teamId];
  if (!meta) {
    return {
      id: teamId,
      label: teamId.replace("team_workspace_", "").replaceAll("_", " "),
      tone: "neutral",
    };
  }

  return {
    id: teamId,
    label: isArabic ? meta.ar : meta.en,
    tone: meta.tone,
  };
}

/**
 * WHY:   Assistant turns mix Arabic and English content, so badges and message chrome need a stable language heuristic.
 * WHAT:  Detects whether a text contains Arabic characters strongly enough to present Arabic-first UI labels.
 * HOW:   Checks the string against the Arabic Unicode block and returns `true` when at least one match exists.
 */
export function isArabicText(value: string | null | undefined) {
  return /[\u0600-\u06FF]/.test(value ?? "");
}

/**
 * WHY:   Message content and uploaded captions can switch scripts within the same thread.
 * WHAT:  Resolves the visual writing direction for a piece of assistant text.
 * HOW:   Returns `rtl` when Arabic script is detected and `ltr` otherwise.
 */
export function resolveAssistantDirection(value: string | null | undefined) {
  return isArabicText(value) ? "rtl" : "ltr";
}

/**
 * WHY:   Streaming state and persisted assistant metadata need one shared badge builder so live and saved turns stay consistent.
 * WHAT:  Converts assistant routing metadata plus optional fallbacks into compact UI badges.
 * HOW:   Pins the assistant identity first, then appends the primary team and any extra routed teams without duplicates.
 */
export function getWorkspaceAssistantBadges(args: {
  content?: string | null;
  meta?: unknown;
  fallbackTeamId?: string | null;
  fallbackAgentName?: string | null;
}) {
  const isArabic = isArabicText(args.content);
  const metaRecord = toMetaRecord(args.meta);
  const routing = toMetaRecord(metaRecord?.routing) as WorkspaceAssistantRoutingMeta | null;
  const assistantLabel = WORKSPACE_ASSISTANT_LABEL;

  const rawTeamIds = [
    routing?.primaryTeamId,
    ...(Array.isArray(routing?.teamIds) ? routing.teamIds : []),
    args.fallbackTeamId ?? undefined,
  ].filter((teamId): teamId is string => typeof teamId === "string" && teamId.trim().length > 0);

  const uniqueTeamIds = [...new Set(rawTeamIds)];
  const badges: WorkspaceAssistantBadge[] = [
    {
      id: "assistant",
      label: assistantLabel,
      tone: "assistant",
    },
    ...uniqueTeamIds.map((teamId) => resolveTeamBadge(teamId, isArabic)),
  ];

  return badges;
}

/**
 * WHY:   Assistant identity should stay readable without overwhelming the response body.
 * WHAT:  Renders a compact pill row for assistant and team badges.
 * HOW:   Applies a tone-aware palette, wraps on small screens, and respects the caller's direction choice.
 */
export function WorkspaceAssistantBadgeRow({
  badges,
  className,
  dir = "rtl",
}: {
  badges: WorkspaceAssistantBadge[];
  className?: string;
  dir?: "rtl" | "ltr";
}) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} dir={dir}>
      {badges.map((badge) => (
        <span
          key={badge.id}
          className={cn(
            "inline-flex min-h-8 items-center rounded-full border px-3.5 py-1.5 text-[11px] font-black tracking-[0.08em]",
            TONE_CLASS_NAMES[badge.tone],
          )}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
