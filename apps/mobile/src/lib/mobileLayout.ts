import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export type MobileSizeTier = "compact" | "regular" | "large";
export type ResponsiveTextRole = "meta" | "chip" | "body" | "bodyStrong" | "title" | "headline";

type ResponsiveTextStyle = {
  fontSize: number;
  lineHeight: number;
};

type MobileLayout = {
  width: number;
  height: number;
  fontScale: number;
  effectiveFontScale: number;
  sizeTier: MobileSizeTier;
  isCompact: boolean;
  contentPadding: number;
  sectionGap: number;
  cardRadius: number;
  chipRadius: number;
  chipMinHeight: number;
  touchTarget: number;
  composerHeight: number;
  propertyCardWidth: number;
  propertyImageHeight: number;
  bubbleMaxWidth: number;
  typeScale: Record<ResponsiveTextRole, ResponsiveTextStyle>;
};

const BASE_TYPE_SCALE: Record<ResponsiveTextRole, ResponsiveTextStyle> = {
  meta: { fontSize: 11, lineHeight: 16 },
  chip: { fontSize: 13, lineHeight: 18 },
  body: { fontSize: 15, lineHeight: 24 },
  bodyStrong: { fontSize: 16, lineHeight: 25 },
  title: { fontSize: 19, lineHeight: 28 },
  headline: { fontSize: 28, lineHeight: 36 },
};

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function resolveSizeTier(width: number): MobileSizeTier {
  if (width < 380) return "compact";
  if (width < 430) return "regular";
  return "large";
}

function buildTypeScale(sizeTier: MobileSizeTier, effectiveFontScale: number) {
  const widthFactor = sizeTier === "compact" ? 0.94 : sizeTier === "large" ? 1.06 : 1;

  return Object.fromEntries(
    Object.entries(BASE_TYPE_SCALE).map(([role, style]) => [
      role,
      {
        fontSize: round(style.fontSize * widthFactor * effectiveFontScale),
        lineHeight: round(style.lineHeight * widthFactor * Math.min(effectiveFontScale, 1.18)),
      },
    ])
  ) as Record<ResponsiveTextRole, ResponsiveTextStyle>;
}

/**
 * WHY:   The assistant shell needs one mobile-native sizing source of truth across narrow phones and larger accessibility settings.
 * WHAT:  Computes responsive spacing, type, and card dimensions from screen width and user font scaling.
 * HOW:   Buckets the viewport into compact/regular/large tiers and applies a capped font scale so layouts stay readable without clipping.
 */
export function useMobileLayout(): MobileLayout {
  const { width, height, fontScale } = useWindowDimensions();

  return useMemo(() => {
    const sizeTier = resolveSizeTier(width);
    const effectiveFontScale = Math.min(Math.max(fontScale, 1), 1.22);
    const contentPadding = sizeTier === "compact" ? 16 : sizeTier === "large" ? 22 : 20;
    const cardRadius = sizeTier === "compact" ? 16 : 18;
    const chipRadius = sizeTier === "compact" ? 13 : 14;
    const chipMinHeight = sizeTier === "compact" ? 40 : 44;
    const touchTarget = sizeTier === "compact" ? 44 : 48;
    const propertyCardWidth = Math.min(Math.max(width * (sizeTier === "compact" ? 0.8 : 0.74), 264), 352);
    const propertyImageHeight = sizeTier === "compact" ? 128 : sizeTier === "large" ? 144 : 136;

    return {
      width,
      height,
      fontScale,
      effectiveFontScale,
      sizeTier,
      isCompact: sizeTier === "compact",
      contentPadding,
      sectionGap: sizeTier === "compact" ? 12 : 16,
      cardRadius,
      chipRadius,
      chipMinHeight,
      touchTarget,
      composerHeight: sizeTier === "compact" ? 44 : 48,
      propertyCardWidth,
      propertyImageHeight,
      bubbleMaxWidth: Math.min(width - contentPadding * 2 - 28, width * 0.88),
      typeScale: buildTypeScale(sizeTier, effectiveFontScale),
    };
  }, [fontScale, height, width]);
}

/**
 * WHY:   UI primitives need semantic text sizes instead of hard-coded pixel values spread across the assistant surface.
 * WHAT:  Returns the responsive font size and line height for a semantic text role.
 * HOW:   Reads from the shared `useMobileLayout` type ramp so components stay consistent across compact and large phones.
 */
export function getResponsiveTextStyle(layout: MobileLayout, role: ResponsiveTextRole): ResponsiveTextStyle {
  return layout.typeScale[role];
}
