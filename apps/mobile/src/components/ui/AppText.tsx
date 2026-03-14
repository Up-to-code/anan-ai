import { Text, TextProps } from "react-native";
import { cn } from "@/lib/cn";
import { rtlTextAlign } from "@/lib/rtl";

type AppTextProps = TextProps & {
  tone?: "body" | "headline" | "label" | "muted";
};

/**
 * WHY:   The app needs one text primitive that keeps Cairo usage and RTL alignment consistent.
 * WHAT:  Renders text with semantic tone variants for body, headline, label, and muted copy.
 * HOW:   Applies font family, color, and alignment centrally so feature code stays compact.
 */
export function AppText({ tone = "body", className, style, ...props }: AppTextProps) {
  const toneClassName =
    tone === "headline"
      ? "font-cairo-bold text-ink"
      : tone === "label"
        ? "font-cairo-bold text-[10px] uppercase tracking-widest text-muted"
        : tone === "muted"
          ? "font-cairo text-sm text-muted"
          : "font-cairo text-base text-ink";

  return <Text {...props} className={cn(toneClassName, className)} style={[rtlTextAlign, style]} />;
}
