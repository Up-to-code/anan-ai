import { useMemo } from "react";
import { useColorScheme } from "react-native";
import type { ViewStyle } from "react-native";
import {
  resolveCursorCardAppearance as resolveCursorCardAppearanceFromTokens,
  type CursorCardAppearance,
  type CursorCardTokens,
} from "@/lib/cursorCardTheme";

/* ─────────────────── Unified Rounded Zinc/Blue Color Palettes ─────────────────── */

const lightColors = {
  // Surfaces (Zinc)
  canvas: "#FFFFFF",
  canvasElevated: "#FAFAFA", // zinc-50
  surface: "#FFFFFF",
  surfaceMuted: "#F4F4F5", // zinc-100
  surfaceStrong: "#E4E4E7", // zinc-200
  
  // Borders (Delicate 1px strokes)
  border: "#E4E4E7", // zinc-200
  borderStrong: "#D4D4D8", // zinc-300

  // Text
  ink: "#09090B", // zinc-950
  inkSoft: "#27272A", // zinc-800
  inkMuted: "#71717A", // zinc-500

  // Brand Accent (#2563EB)
  primary: "#2563EB",
  primaryStrong: "#1D4ED8",
  primarySoft: "#EFF6FF",
  primaryMuted: "#DBEAFE",

  // Feedback
  accent: "#2563EB",
  accentDim: "#EFF6FF",
  accentSecondary: "#52525B", // zinc-600
  accentSecondaryDim: "#F4F4F5",

  teal: "#0D9488",
  tealSoft: "#CCFBF1",
  success: "#16A34A",
  successSoft: "#DCFCE7",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",

  dark: "#09090B",
  darkSoft: "#18181B",
  send: "#2563EB",
  sendIcon: "#FFFFFF",
  white: "#FFFFFF",
  overlay: "rgba(9, 9, 11, 0.45)", // zinc-950 based overlay

  // Chat
  userBubble: "#F4F4F5", // zinc-100
  userBubbleText: "#09090B",
  assistantBadge: "#2563EB",
  assistantBadgeBg: "#EFF6FF",
  promptChipBg: "#FFFFFF",
  promptChipText: "#09090B",
  promptChipDot: "#2563EB",
  composerActionSurface: "#09090B",
  composerActionIcon: "#FFFFFF",
  composerActionRing: "transparent",
  composerActionBackdrop: "#09090B",
  promptStarterSurface: "#E4E4E7",

  glassBg: "rgba(255, 255, 255, 0.85)",
  glassBorder: "#E4E4E7",
} as const;

const darkColors = {
  // Surfaces (Zinc)
  canvas: "#09090B", // zinc-950
  canvasElevated: "#09090B",
  surface: "#09090B", // Appears as elevated on canvas
  surfaceMuted: "#18181B", // zinc-900 (Used for panels, chat input)
  surfaceStrong: "#27272A", // zinc-800
  
  // Borders
  border: "#27272A", // zinc-800
  borderStrong: "#3F3F46", // zinc-700

  // Text
  ink: "#FAFAFA", // zinc-50
  inkSoft: "#E4E4E7", // zinc-200
  inkMuted: "#A1A1AA", // zinc-400

  // Brand Accent (Consistent Blue)
  primary: "#3B82F6", // Slightly brighter in dark mode for contrast
  primaryStrong: "#60A5FA",
  primarySoft: "rgba(59,130,246,0.15)",
  primaryMuted: "rgba(59,130,246,0.25)",

  // Accents
  accent: "#3B82F6",
  accentDim: "rgba(59,130,246,0.15)",
  accentSecondary: "#A1A1AA",
  accentSecondaryDim: "rgba(161,161,170,0.15)",

  teal: "#14B8A6",
  tealSoft: "rgba(20,184,166,0.15)",
  success: "#22C55E",
  successSoft: "rgba(34,197,94,0.15)",
  danger: "#EF4444",
  dangerSoft: "rgba(239,68,68,0.15)",

  dark: "#FAFAFA",
  darkSoft: "#F4F4F5",
  send: "#3B82F6",
  sendIcon: "#FFFFFF",
  white: "#FFFFFF",
  overlay: "rgba(0, 0, 0, 0.75)",

  // Chat
  userBubble: "#18181B", // zinc-900
  userBubbleText: "#FAFAFA",
  assistantBadge: "#3B82F6",
  assistantBadgeBg: "rgba(59,130,246,0.15)",
  promptChipBg: "#18181B",
  promptChipText: "#FAFAFA",
  promptChipDot: "#3B82F6",
  composerActionSurface: "#F4F4F5",
  composerActionIcon: "#09090B",
  composerActionRing: "#52525B",
  composerActionBackdrop: "#F4F4F5",
  promptStarterSurface: "#27272A",

  glassBg: "rgba(9, 9, 11, 0.75)",
  glassBorder: "#27272A",
} as const;

export type AppThemeColors = typeof lightColors | typeof darkColors;

/* ─────────────────── Theme Hook ─────────────────── */

export type AppTheme = {
  isDark: boolean;
  colors: AppThemeColors;
  cursorCard: CursorCardTokens;
  radii: typeof radii;
  spacing: typeof spacing;
};

// "Unified Rounded" means soft containers and pill buttons. No strict 8px logic.
const radii = {
  chip: 999, // Pill
  card: 16, // rounded-2xl
  panel: 20, // Between 2xl and 3xl
  hero: 24, // rounded-3xl
  bubble: 20, // Soft chat bubbles
  pill: 999, // Pill shape
} as const;

const spacing = {
  gutterCompact: 16,
  gutter: 20,
  gutterLarge: 24,
  section: 24,
  sectionLarge: 40,
} as const;

const lightCursorCard: CursorCardTokens = {
  defaultAmbientBackgroundColor: lightColors.canvas,
  surfaceColor: lightColors.surface,
  borderColor: lightColors.border,
  actionSurfaceColor: lightColors.surfaceMuted,
  actionBorderColor: lightColors.borderStrong,
  actionTextColor: lightColors.ink,
  frameThickness: 2,
  frameOpacity: 0.96,
  outerRadius: radii.hero,
  innerRadius: radii.panel,
};

const darkCursorCard: CursorCardTokens = {
  defaultAmbientBackgroundColor: darkColors.canvasElevated,
  surfaceColor: darkColors.surfaceMuted,
  borderColor: darkColors.borderStrong,
  actionSurfaceColor: darkColors.surfaceStrong,
  actionBorderColor: darkColors.borderStrong,
  actionTextColor: darkColors.ink,
  frameThickness: 2,
  frameOpacity: 0.94,
  outerRadius: radii.hero,
  innerRadius: radii.panel,
};

/**
 * WHY:   Cursor-style cards need one semantic appearance contract instead of per-screen gradient guesses.
 * WHAT:  Resolves the ambient fade colors, card surface, and action styling for the shared mobile cursor-card shell.
 * HOW:   Uses the active theme tokens and optionally accepts a parent background color so the frame blends into its host surface.
 */
export function resolveCursorCardAppearance(theme: AppTheme, ambientBackgroundColor?: string): CursorCardAppearance {
  return resolveCursorCardAppearanceFromTokens(theme.cursorCard, ambientBackgroundColor);
}

/**
 * WHY:   System mockups use a zinc/blue soft minimal design language.
 * WHAT:  Returns the theme object matching the "Unified Rounded" Zinc spec.
 * HOW:   Reads useColorScheme() to toggle.
 */
export function useAppTheme(): AppTheme {
  const colorScheme = useColorScheme();
  return useMemo(() => {
    const isDark = colorScheme === "dark";
    return {
      isDark,
      colors: isDark ? darkColors : lightColors,
      cursorCard: isDark ? darkCursorCard : lightCursorCard,
      radii,
      spacing,
    };
  }, [colorScheme]);
}

/* ─────────────────── Legacy compat ─────────────────── */

export const mobileTheme = {
  colors: lightColors,
  cursorCard: lightCursorCard,
  radii,
  spacing,
} as const;

/* ─────────────────── Shadows ─────────────────── */

/**
 * WHY:   JSON Philosophy: Floating subtle shadows for the unified design.
 */
export function getMobileShadow(level: "none" | "card" | "float" = "card"): ViewStyle {
  if (level === "none") return {};
  
  if (level === "float") {
    return {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8,
    };
  }

  return {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  };
}
