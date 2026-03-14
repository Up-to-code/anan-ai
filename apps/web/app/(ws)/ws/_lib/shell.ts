/**
 * WHY:   Overview and business-zone shells should keep the same desktop rail width so the workspace feels consistent.
 * WHAT:  Exports the shared Tailwind width token for all workspace sidebars.
 * HOW:   Centralizes the class string to avoid width drift between shells.
 */
export const WORKSPACE_SIDEBAR_WIDTH_CLASS = "w-72";
