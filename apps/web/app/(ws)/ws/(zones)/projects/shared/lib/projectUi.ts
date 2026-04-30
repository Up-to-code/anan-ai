import type { WorkspaceProject } from "../../types/projectTypes";

export type ProjectDetailMode = "overview" | "units" | "analytics";

export const unitStatusLabels: Record<string, string> = {
  available: "متاحة",
  reserved: "محجوزة",
  sold: "مباعة",
  draft: "مسودة",
};

export const unitStatusTone: Record<string, string> = {
  available: "border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  reserved: "border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300",
  sold: "border-rose-500/30 bg-rose-500/12 text-rose-700 dark:text-rose-300",
  draft: "border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[var(--workspace-muted)]",
};

export const PROJECT_HEADER_TITLE_MAX_CHARS = 34;
export const PROJECT_SUMMARY_MAX_CHARS = 180;

export function formatProjectHeaderTitle(title: string) {
  const normalizedTitle = title.trim();
  if (normalizedTitle.length <= PROJECT_HEADER_TITLE_MAX_CHARS) {
    return normalizedTitle;
  }

  return `${normalizedTitle.slice(0, PROJECT_HEADER_TITLE_MAX_CHARS)}...`;
}

export function truncateProjectText(text: string, maxChars = PROJECT_SUMMARY_MAX_CHARS) {
  const normalizedText = text.trim();
  if (normalizedText.length <= maxChars) {
    return normalizedText;
  }

  return `${normalizedText.slice(0, Math.max(0, maxChars - 2)).trimEnd()}..`;
}

export function getAvailableProjectDetailModes(project: WorkspaceProject): ProjectDetailMode[] {
  const modes: ProjectDetailMode[] = ["overview"];
  if (project.inventoryKind === "project" || project.units.length > 0 || project.canEdit) {
    modes.push("units");
  }
  modes.push("analytics");
  return modes;
}

export function normalizeProjectDetailMode(
  requestedMode: string | null,
  availableModes: ProjectDetailMode[],
): ProjectDetailMode {
  const normalizedRequestedMode: ProjectDetailMode | null =
    requestedMode === "overview" || requestedMode === "units" || requestedMode === "analytics"
      ? requestedMode
      : null;

  if (normalizedRequestedMode && availableModes.includes(normalizedRequestedMode)) {
    return normalizedRequestedMode;
  }

  return availableModes[0] ?? "overview";
}
