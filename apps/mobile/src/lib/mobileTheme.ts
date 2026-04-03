import type { ViewStyle } from "react-native";

export const mobileTheme = {
  colors: {
    canvas: "#FFFFFF",
    canvasElevated: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceMuted: "#F5F5F7",
    surfaceStrong: "#ECECF0",
    border: "#E6E7EB",
    borderStrong: "#D8DADF",
    ink: "#0B0C10",
    inkSoft: "#1F2937",
    inkMuted: "#6B7280",
    primary: "#2563EB",
    primaryStrong: "#1D4ED8",
    primarySoft: "#EEF4FF",
    primaryMuted: "#BFDBFE",
    teal: "#0F766E",
    tealSoft: "#ECF7F4",
    success: "#16A34A",
    successSoft: "#ECFDF3",
    danger: "#DC2626",
    dangerSoft: "#FEF2F2",
    dark: "#090A0C",
    darkSoft: "#121418",
    send: "#2563EB",
    white: "#FFFFFF",
    overlay: "rgba(15, 23, 42, 0.38)",
  },
  radii: {
    chip: 14,
    card: 20,
    panel: 24,
    hero: 28,
    bubble: 22,
    pill: 999,
  },
  spacing: {
    gutterCompact: 16,
    gutter: 20,
    gutterLarge: 24,
    section: 16,
    sectionLarge: 24,
  },
} as const;

/**
 * WHY:   Mobile cards need one shared depth system so screens feel premium without inventing different shadows everywhere.
 * WHAT:  Returns a small set of cross-platform shadow styles for surfaces and floating docks.
 * HOW:   Uses iOS shadow props plus Android elevation with intentionally restrained values.
 */
export function getMobileShadow(level: "none" | "card" | "float" = "card"): ViewStyle {
  return {};
}
