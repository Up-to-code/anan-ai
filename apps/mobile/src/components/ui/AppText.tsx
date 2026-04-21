import { memo } from "react";
import { Text, TextProps } from "react-native";
import { cn } from "@/lib/cn";
import { getResponsiveTextStyle, type ResponsiveTextRole, useMobileLayout } from "@/lib/mobileLayout";
import { useAppTheme } from "@/lib/mobileTheme";

type AppTextProps = TextProps & {
  tone?: "body" | "headline" | "label" | "muted";
  responsiveRole?: ResponsiveTextRole;
  uppercase?: boolean;
};

const TONE_CLASS_NAMES: Record<NonNullable<AppTextProps["tone"]>, string> = {
  body: "font-cairo text-[15px] leading-relaxed",
  headline: "font-cairo-black text-2xl tracking-tighter",
  label: "font-cairo-bold text-[10px]", // Removed extreme spacing
  muted: "font-cairo-medium text-[13px] leading-relaxed",
};

/**
 * WHY:   The Unified Rounded logic relies on natural typography rather than forced aggressive capitalization.
 * WHAT:  Renders generic typography correctly mapped to the Zinc/Blue scale.
 */
export const AppText = memo(function AppText({ tone = "body", responsiveRole, uppercase, className, style, ...props }: AppTextProps) {
  const layout = useMobileLayout();
  const theme = useAppTheme();
  const toneClassName = TONE_CLASS_NAMES[tone];
  const responsiveStyle = responsiveRole ? getResponsiveTextStyle(layout, responsiveRole) : null;

  return (
    <Text
      {...props}
      className={cn(toneClassName, uppercase ? "uppercase" : "", className)}
      style={[
        {
          textAlign: "right",
          writingDirection: "rtl",
          textTransform: uppercase ? "uppercase" : "none", // Only manual uppercase
          color: tone === "muted" || tone === "label" ? theme.colors.inkMuted : theme.colors.ink,
        },
        responsiveStyle,
        style,
      ]}
    />
  );
});
