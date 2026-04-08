import type { ReactNode } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { AppText } from "@/components/ui/AppText";
import { cn } from "@/lib/cn";
import { getMobileShadow, useAppTheme } from "@/lib/mobileTheme";

type SurfaceTone = "default" | "muted" | "highlight" | "success" | "danger" | "dark" | "glass";
type SurfaceRadius = "chip" | "card" | "panel" | "hero" | "pill";

/**
 * WHY:   The Unified System demands gentle zinc borders and large 16-24px radii inside structure.
 * WHAT:  Surface primitive enforcing 1px delicate boundaries and soft corners.
 */
export function MobileSurface({
  children,
  className,
  tone = "default",
  radius = "card",
  padded = true,
  shadow = "none",
  style,
  ...props
}: ViewProps & {
  tone?: SurfaceTone;
  radius?: SurfaceRadius;
  padded?: boolean;
  shadow?: "none" | "card" | "float";
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useAppTheme();
  const colors = resolveSurfaceColors(tone, theme);

  return (
    <View
      {...props}
      className={cn(className)}
      style={[
        {
          borderWidth: 1, // Delicate 1px stroke boundaries
          borderRadius: theme.radii[radius], // Uses the robust 16px/20px/24px geometry
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          padding: padded ? 20 : 0,
        },
        shadow === "none" ? null : getMobileShadow(shadow),
        style,
      ]}
    >
      {children}
    </View>
  );
}

function resolveSurfaceColors(tone: SurfaceTone, theme: ReturnType<typeof useAppTheme>) {
  switch (tone) {
    case "muted":
      return {
        backgroundColor: theme.colors.surfaceMuted,
        borderColor: theme.colors.border,
      };
    case "highlight":
      return {
        backgroundColor: theme.colors.primarySoft,
        borderColor: theme.colors.primaryMuted,
      };
    case "success":
      return {
        backgroundColor: theme.colors.successSoft,
        borderColor: theme.colors.successSoft,
      };
    case "danger":
      return {
        backgroundColor: theme.colors.dangerSoft,
        borderColor: theme.colors.dangerSoft,
      };
    case "dark":
      return {
        backgroundColor: theme.isDark ? theme.colors.surfaceStrong : theme.colors.dark,
        borderColor: theme.isDark ? theme.colors.border : theme.colors.dark,
      };
    case "glass": // Returns subtle layered look
      return {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.borderStrong,
      };
    default:
      return {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      };
  }
}

/**
 * WHAT:  Top bar using a subtle 1px frame bottom line.
 */
export function MobileTopBar({
  insetTop,
  title,
  subtitle,
  leading,
  trailing,
  centerSlot,
  border = true,
  backgroundColor,
  borderColor,
  className,
}: {
  insetTop: number;
  title?: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  centerSlot?: ReactNode;
  border?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  className?: string;
}) {
  const theme = useAppTheme();

  return (
    <View
      className={cn(className)}
      style={{
        paddingTop: insetTop,
        paddingHorizontal: theme.spacing.gutterCompact,
        borderBottomWidth: border ? 1 : 0, // 1px subtle stroke
        borderBottomColor: borderColor ?? theme.colors.border,
        backgroundColor: backgroundColor ?? theme.colors.canvas,
        justifyContent: "center",
      }}
    >
      <View style={[styles.headerRow, { minHeight: 60 }]}>
        <View style={styles.headerEdge}>{leading ?? <View style={styles.headerPlaceholder} />}</View>
        <View style={styles.headerCenter}>
          {centerSlot ? (
            centerSlot
          ) : title ? (
            <View style={styles.headerCopy}>
              <AppText responsiveRole="bodyStrong" className="text-center font-cairo-bold" style={{ color: theme.colors.ink }}>
                {title}
              </AppText>
              {subtitle ? (
                <AppText className="mt-0.5 text-[11px] text-center font-cairo-medium" style={{ color: theme.colors.inkMuted }}>
                  {subtitle}
                </AppText>
              ) : null}
            </View>
          ) : null}
        </View>
        <View style={[styles.headerEdge, styles.headerEdgeTrailing]}>
          {trailing ?? <View style={styles.headerPlaceholder} />}
        </View>
      </View>
    </View>
  );
}

/**
 * WHAT:  A pill acting as a tag/status display with pills being fully rounded in the new Unified spec.
 */
export function MobilePill({
  label,
  tone = "default",
  active = false,
  onPress,
  className,
}: {
  label: string;
  tone?: "default" | "primary" | "teal" | "success" | "dark" | "accent" | "accentSecondary";
  active?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  const theme = useAppTheme();
  const PressableComponent = onPress ? Pressable : View;
  const activeTone = active ? tone : "default";
  const pillStyle = resolvePillStyle(activeTone, theme);

  return (
    <PressableComponent
      {...(onPress ? ({ onPress } satisfies Pick<PressableProps, "onPress">) : {})}
      className={cn("items-center justify-center", className)}
      style={{
        minHeight: 32,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: theme.radii.pill, // Unified pill 999
        borderWidth: 1, // Delicate 1px frame
        backgroundColor: pillStyle.backgroundColor,
        borderColor: pillStyle.borderColor,
      }}
    >
      <AppText
        className={cn("text-[11px] font-cairo-bold")}
        style={{ color: pillStyle.textColor }}
      >
        {label}
      </AppText>
    </PressableComponent>
  );
}

function resolvePillStyle(tone: string, theme: ReturnType<typeof useAppTheme>) {
  switch (tone) {
    case "primary":
    case "accent":
      return {
        backgroundColor: theme.colors.primarySoft,
        borderColor: theme.colors.primaryMuted,
        textColor: theme.colors.primary,
      };
    case "success":
      return {
        backgroundColor: theme.colors.successSoft,
        borderColor: theme.colors.successSoft,
        textColor: theme.colors.success,
      };
    case "dark":
      return {
        backgroundColor: theme.isDark ? theme.colors.surfaceStrong : theme.colors.dark,
        borderColor: theme.isDark ? theme.colors.borderStrong : theme.colors.dark,
        textColor: theme.isDark ? theme.colors.ink : "#FFFFFF",
      };
    default:
      return {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        textColor: theme.colors.inkSoft,
      };
  }
}

/**
 * WHAT:  Clean typography for grouping sections, dropping wide uppercase.
 */
export function MobileSectionHeading({
  eyebrow,
  title,
  description,
  align = "right",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "right" | "center";
  className?: string;
}) {
  const theme = useAppTheme();
  const textAlignStyle = { textAlign: align === "center" ? ("center" as const) : ("right" as const) };

  return (
    <View className={cn("gap-1.5", className)}>
      {eyebrow ? (
        <AppText
          className="text-[11px] font-cairo-bold"
          style={{ ...textAlignStyle, color: theme.colors.primary }}
        >
          {eyebrow}
        </AppText>
      ) : null}
      <AppText
        className="text-[24px] font-cairo-bold leading-[34px] tracking-tight"
        style={{ ...textAlignStyle, color: theme.colors.ink }}
      >
        {title}
      </AppText>
      {description ? (
        <AppText
          className="text-[14px] font-medium leading-relaxed"
          style={{ ...textAlignStyle, color: theme.colors.inkMuted }}
        >
          {description}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerEdge: {
    width: 52,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerEdgeTrailing: {
    alignItems: "flex-end",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  headerCopy: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerPlaceholder: {
    width: 40,
    height: 40,
  },
});
