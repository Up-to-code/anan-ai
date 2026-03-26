import { Text, TextProps } from "react-native";
import { cn } from "@/lib/cn";

type AppTextProps = TextProps & {
  tone?: "body" | "headline" | "label" | "muted";
};

const TONE_CLASS_NAMES: Record<NonNullable<AppTextProps["tone"]>, string> = {
  body: "font-cairo text-[15px] leading-relaxed text-foreground",
  headline: "font-cairo-black text-2xl tracking-tighter text-foreground",
  label: "font-cairo-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60",
  muted: "font-cairo-medium text-[13px] leading-relaxed text-muted-foreground/70",
};

/**
 * WHY:   The app needs one text primitive that keeps Cairo usage and Arabic alignment consistent.
 * WHAT:  Renders text with semantic tone variants for body, headline, label, and muted copy.
 * HOW:   Applies font family, color, and writing direction centrally so feature code stays compact.
 */
export function AppText({ tone = "body", className, style, ...props }: AppTextProps) {
  const toneClassName = TONE_CLASS_NAMES[tone];

  return (
    <Text
      {...props}
      className={cn(toneClassName, className)}
      style={[{ textAlign: "right", writingDirection: "rtl" }, style]}
    />
  );
}
