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
import { getMobileShadow, mobileTheme } from "@/lib/mobileTheme";

type SurfaceTone = "default" | "muted" | "highlight" | "success" | "danger" | "dark";
type SurfaceRadius = "chip" | "card" | "panel" | "hero" | "pill";

function resolveSurfaceColors(tone: SurfaceTone) {
  switch (tone) {
    case "muted":
      return {
        backgroundColor: mobileTheme.colors.surfaceMuted,
        borderColor: mobileTheme.colors.border,
      };
    case "highlight":
      return {
        backgroundColor: mobileTheme.colors.primarySoft,
        borderColor: "#D4E2FF",
      };
    case "success":
      return {
        backgroundColor: mobileTheme.colors.successSoft,
        borderColor: "#CDEFD8",
      };
    case "danger":
      return {
        backgroundColor: mobileTheme.colors.dangerSoft,
        borderColor: "#F6CFCF",
      };
    case "dark":
      return {
        backgroundColor: mobileTheme.colors.dark,
        borderColor: mobileTheme.colors.dark,
      };
    default:
      return {
        backgroundColor: mobileTheme.colors.surface,
        borderColor: mobileTheme.colors.border,
      };
  }
}

function resolveRadius(radius: SurfaceRadius) {
  return mobileTheme.radii[radius];
}

/**
 * WHY:   The mobile redesign needs one shared surface primitive instead of each screen re-creating white cards and border styles.
 * WHAT:  Renders a bordered Anan mobile panel with tone, radius, padding, and optional shadow presets.
 * HOW:   Centralizes the mobile canvas palette and rounded geometry so screens only compose structure and content.
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
  const colors = resolveSurfaceColors(tone);

  return (
    <View
      {...props}
      className={cn(className)}
      style={[
        {
          borderWidth: 1,
          borderRadius: resolveRadius(radius),
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          padding: padded ? 20 : 0,
        },
        getMobileShadow(shadow),
        style,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * WHY:   Screen headers currently repeat the same safe-area math, divider, and centered-title logic across the app.
 * WHAT:  Renders the shared mobile top bar with leading/trailing actions and either a title or a centered custom slot.
 * HOW:   Uses a balanced three-column row plus optional subtitle so every feature screen inherits the same shell.
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
  return (
    <View
      className={cn(className)}
      style={{
        paddingTop: insetTop + 12,
        paddingHorizontal: mobileTheme.spacing.gutter,
        paddingBottom: 14,
        borderBottomWidth: border ? StyleSheet.hairlineWidth : 0,
        borderBottomColor: borderColor ?? mobileTheme.colors.borderStrong,
        backgroundColor: backgroundColor ?? mobileTheme.colors.canvas,
      }}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerEdge}>{leading ?? <View style={styles.headerPlaceholder} />}</View>
        <View style={styles.headerCenter}>
          {centerSlot ? (
            centerSlot
          ) : title ? (
            <View style={styles.headerCopy}>
              <AppText responsiveRole="bodyStrong" className="text-center font-cairo-black text-slate-900">
                {title}
              </AppText>
              {subtitle ? (
                <AppText responsiveRole="meta" className="mt-1 text-center font-medium text-slate-500">
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
 * WHY:   The redesigned mobile app relies on compact pills for state, filters, and section context.
 * WHAT:  Renders a reusable pill with semantic tones and optional press behavior.
 * HOW:   Shares one rounded-full geometry and token-driven palette across chips, badges, and segmented filters.
 */
export function MobilePill({
  label,
  tone = "default",
  active = false,
  onPress,
  className,
}: {
  label: string;
  tone?: "default" | "primary" | "teal" | "success" | "dark";
  active?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  const PressableComponent = onPress ? Pressable : View;
  const activeTone = active ? tone : "default";
  const style = resolvePillStyle(activeTone);

  return (
    <PressableComponent
      {...(onPress ? ({ onPress } satisfies Pick<PressableProps, "onPress">) : {})}
      className={cn("items-center justify-center", className)}
      style={{
        minHeight: 42,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: mobileTheme.radii.pill,
        borderWidth: 1,
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
      }}
    >
      <AppText
        responsiveRole="chip"
        className={cn(
          "font-cairo-black",
          style.textClassName,
        )}
      >
        {label}
      </AppText>
    </PressableComponent>
  );
}

function resolvePillStyle(tone: "default" | "primary" | "teal" | "success" | "dark") {
  switch (tone) {
    case "primary":
      return {
        backgroundColor: mobileTheme.colors.primarySoft,
        borderColor: "#D4E2FF",
        textClassName: "text-blue-700",
      };
    case "teal":
      return {
        backgroundColor: mobileTheme.colors.tealSoft,
        borderColor: "#CFEAE5",
        textClassName: "text-teal-700",
      };
    case "success":
      return {
        backgroundColor: mobileTheme.colors.successSoft,
        borderColor: "#CDEFD8",
        textClassName: "text-emerald-700",
      };
    case "dark":
      return {
        backgroundColor: mobileTheme.colors.dark,
        borderColor: mobileTheme.colors.dark,
        textClassName: "text-white",
      };
    default:
      return {
        backgroundColor: mobileTheme.colors.surface,
        borderColor: mobileTheme.colors.border,
        textClassName: "text-slate-700",
      };
  }
}

/**
 * WHY:   Major mobile sections need a repeatable heading rhythm instead of hand-authored title stacks on every screen.
 * WHAT:  Renders optional eyebrow, title, and description copy with Anan mobile spacing and hierarchy.
 * HOW:   Uses Cairo black for the title, a tracked micro-eyebrow, and muted support copy inside one small wrapper.
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
  const textAlignClassName = align === "center" ? "text-center" : "text-right";

  return (
    <View className={cn("gap-2", className)}>
      {eyebrow ? (
        <AppText className={cn(textAlignClassName, "text-[11px] font-cairo-black tracking-[0.2em] text-slate-400")}>
          {eyebrow}
        </AppText>
      ) : null}
      <AppText className={cn(textAlignClassName, "text-[28px] font-cairo-black leading-[38px] text-slate-900")}>
        {title}
      </AppText>
      {description ? (
        <AppText className={cn(textAlignClassName, "text-[15px] font-medium leading-8 text-slate-500")}>
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
    minHeight: 44,
  },
  headerEdge: {
    width: 56,
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
    width: 44,
    height: 44,
  },
});
