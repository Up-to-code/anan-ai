import { Text, TextProps } from "react-native";
import { cn } from "@/lib/cn";
import { rtlTextAlign } from "@/lib/rtl";

type AppTextProps = TextProps & {
  tone?: "body" | "headline" | "label" | "muted";
};

const TONE_CLASS_NAMES: Record<NonNullable<AppTextProps["tone"]>, string> = {
  body: "font-cairo text-base text-ink",
  headline: "font-cairo-bold text-ink",
  label: "font-cairo-bold text-[10px] uppercase tracking-widest text-muted",
  muted: "font-cairo text-sm text-muted",
};

/**
 * WHY:   The app needs one text primitive that keeps Cairo usage and RTL alignment consistent.
 * WHAT:  Renders text with semantic tone variants for body, headline, label, and muted copy.
 * HOW:   Applies font family, color, and alignment centrally so feature code stays compact.
 */
export function AppText({ tone = "body", className, style, ...props }: AppTextProps) {
  const toneClassName = TONE_CLASS_NAMES[tone];

  return <Text {...props} className={cn(toneClassName, className)} style={[rtlTextAlign, style]} />;
}
