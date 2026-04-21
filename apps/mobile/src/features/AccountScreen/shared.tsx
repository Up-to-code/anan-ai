import React, { type ReactNode } from "react";
import { Pressable, type PressableProps, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { MobileSectionHeading } from "@/components/ui/MobileChrome";
import { cn } from "@/lib/cn";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";

/**
 * WHY:   The buyer account cluster needs one consistent structural shell so every sub-screen feels like the same product.
 * WHAT:  Renders a titled account section using the shared mobile surface and heading treatment.
 * HOW:   Wraps child content in the same radius, spacing, and muted copy rhythm used across the account journey.
 */
export function AccountSection({
  eyebrow,
  title,
  description,
  children,
  tone = "default",
  headerSlot,
  footer,
  contentClassName,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  tone?: "default" | "muted" | "highlight";
  headerSlot?: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
}) {
  const hasHeading = Boolean(eyebrow || title || description);
  return (
    <View className={cn("gap-2", tone === "highlight" ? "gap-3" : null)}>
      {hasHeading ? <MobileSectionHeading eyebrow={eyebrow} title={title ?? ""} description={description} /> : null}
      {headerSlot}
      {children ? <View className={cn("gap-2", contentClassName)}>{children}</View> : null}
      {footer}
    </View>
  );
}

/**
 * WHY:   Every account route needs the same restrained intro treatment before the primary actions or content.
 * WHAT:  Wraps account headers, identity cues, and small supporting metadata in one quiet surface.
 * HOW:   Reuses the shared mobile surface tokens so account pages feel aligned with the assistant shell without copying it.
 */
export function AccountPageIntro({
  eyebrow,
  title,
  description,
  children,
  tone: _tone = "muted",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  tone?: "default" | "muted" | "highlight";
}) {
  return (
    <View className="gap-3 py-1">
      <MobileSectionHeading eyebrow={eyebrow} title={title} description={description} />
      {children}
    </View>
  );
}

/**
 * WHY:   Account routes need one shared list shell so actions and static rows keep the same quiet structure.
 * WHAT:  Renders a grouped account list surface with built-in border radius and overflow handling.
 * HOW:   Uses a non-padded shared surface so rows can own spacing and separators without nesting extra cards.
 */
export function AccountActionList({
  children,
}: {
  children: ReactNode;
}) {
  return <View>{children}</View>;
}

/**
 * WHY:   The account hub and settings screens need reusable action rows rather than ad-hoc one-off layouts.
 * WHAT:  Renders an account navigation or action row with icon, copy, and optional status/chevron.
 * HOW:   Keeps the rhythm flatter than the previous dashboard treatment so rows feel closer to the assistant shell.
 */
export function AccountActionRow({
  icon: Icon,
  label,
  description,
  eyebrow,
  status,
  destructive = false,
  withBorder = false,
  onPress,
  trailing,
  compact = false,
  testID,
}: {
  icon: LucideIcon;
  label: string;
  description?: string;
  eyebrow?: string;
  status?: string;
  destructive?: boolean;
  withBorder?: boolean;
  onPress?: () => void;
  trailing?: ReactNode;
  compact?: boolean;
  testID?: string;
}) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;
  const Row = onPress ? Pressable : View;
  const rowProps = onPress ? ({ onPress } satisfies Pick<PressableProps, "onPress">) : {};

  return (
    <Row
      {...rowProps}
      testID={testID}
      className={cn(
        isRtl ? "flex-row-reverse" : "flex-row",
        "items-center gap-3 active:opacity-70",
        compact ? "py-3" : "py-4",
      )}
      style={withBorder ? { borderBottomWidth: 1, borderBottomColor: theme.colors.border } : undefined}
    >
      <Icon size={compact ? 16 : 18} color={destructive ? theme.colors.danger : theme.colors.primary} />

      <View className={cn("flex-1", isRtl ? "items-end" : "items-start")}>
        {eyebrow ? (
          <AppText className={cn(isRtl ? "text-right" : "text-left", "text-[11px] font-cairo-bold")} style={{ color: theme.colors.primary }}>
            {eyebrow}
          </AppText>
        ) : null}
        <AppText
          className={cn(isRtl ? "text-right" : "text-left", "text-[15px] font-cairo-bold")}
          style={{ color: destructive ? theme.colors.danger : theme.colors.ink }}
        >
          {label}
        </AppText>
        {description ? (
          <AppText className={cn(isRtl ? "text-right" : "text-left", "mt-1 text-[12px] leading-5 font-medium")} style={{ color: theme.colors.inkMuted }}>
            {description}
          </AppText>
        ) : null}
      </View>

      {status ? (
        <AppText
          className={cn("max-w-[112px] text-[12px] font-cairo-bold", isRtl ? "text-left" : "text-right")}
          style={{ color: destructive ? theme.colors.danger : theme.colors.inkMuted }}
        >
          {status}
        </AppText>
      ) : null}
      {trailing ?? (onPress ? <ChevronIcon size={18} color={theme.colors.inkMuted} /> : null)}
    </Row>
  );
}

/**
 * WHY:   Some account screens still need a compact label/value summary without returning to the old dashboard grid.
 * WHAT:  Displays a lightweight metric tile for small factual summaries.
 * HOW:   Uses flatter surfaces and smaller type so it can appear beside lists without taking over the layout.
 */
export function AccountStatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "highlight";
}) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();
  const backgroundColor = tone === "highlight" ? theme.colors.primarySoft : theme.colors.surfaceMuted;
  const borderColor = tone === "highlight" ? theme.colors.primaryMuted : theme.colors.border;
  const valueColor = tone === "highlight" ? theme.colors.primary : theme.colors.ink;

  return (
    <View
      className="flex-1 rounded-[18px] px-3 py-3"
      style={{ borderWidth: 1, borderColor, backgroundColor }}
    >
      <AppText className={cn(isRtl ? "text-right" : "text-left", "text-[11px] font-cairo-bold")} style={{ color: theme.colors.inkMuted }}>
        {label}
      </AppText>
      <AppText className={cn(isRtl ? "text-right" : "text-left", "mt-1 text-[15px] font-cairo-black")} style={{ color: valueColor }}>
        {value}
      </AppText>
    </View>
  );
}

/**
 * WHY:   Account sub-screens need one dependable empty-state treatment instead of inventing a new pattern per route.
 * WHAT:  Shows a centered message with optional helper action inside a muted surface.
 * HOW:   Keeps copy and spacing compact so empty states still feel calm and premium.
 */
export function AccountEmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();
  return (
    <View className="items-center gap-2 py-5">
      <AppText className="text-center text-[17px] font-cairo-black" style={{ color: theme.colors.ink }}>
        {title}
      </AppText>
      <AppText className={cn("text-[12px] leading-6 font-medium", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.inkMuted }}>
        {body}
      </AppText>
      {action}
    </View>
  );
}
