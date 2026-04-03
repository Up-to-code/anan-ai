import { ActivityIndicator, Pressable, PressableProps, View, useColorScheme } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { cn } from "@/lib/cn";
import { useMobileLayout } from "@/lib/mobileLayout";
import { mobileTheme } from "@/lib/mobileTheme";

type ButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  loading?: boolean;
  size?: "default" | "sm" | "lg";
  textClassName?: string;
  className?: string;
};

/**
 * WHY:   The app needs one consistent action primitive for chat, search, and journey CTAs.
 * WHAT:  Renders a compact, modern button with primary, secondary, ghost, or destructive treatment.
 * HOW:   Uses mobile-safe touch targets, responsive padding, and calm bordered styling so buttons stay usable on smaller phones.
 */
export function Button({ 
  label, 
  variant = "primary", 
  loading, 
  size = "default",
  className, 
  textClassName,
  style,
  disabled, 
  ...props 
}: ButtonProps) {
  const layout = useMobileLayout();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";
  const isDestructive = variant === "destructive";

  const sizeStyle = {
    sm: {
      minHeight: layout.touchTarget,
      paddingHorizontal: layout.isCompact ? 16 : 20,
      paddingVertical: 8,
      borderRadius: 999,
    },
    default: {
      minHeight: layout.touchTarget + 4,
      paddingHorizontal: layout.isCompact ? 20 : 24,
      paddingVertical: 10,
      borderRadius: 999,
    },
    lg: {
      minHeight: layout.touchTarget + 10,
      paddingHorizontal: layout.isCompact ? 24 : 28,
      paddingVertical: 12,
      borderRadius: 999,
    },
  };

  const resolvedStyle =
    typeof style === "function"
      ? (state: Parameters<NonNullable<typeof style>>[0]) => [sizeStyle[size], style(state)]
      : [sizeStyle[size], style];

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      className={cn(className)}
      style={(state) => {
        const baseStyle = {
          alignItems: "center" as const,
          justifyContent: "center" as const,
          backgroundColor: isPrimary 
            ? (isDark ? "#F8FAFC" : mobileTheme.colors.dark)
            : isSecondary 
              ? (isDark ? "#0F172A" : mobileTheme.colors.surface)
              : isGhost 
                ? "transparent" 
                : mobileTheme.colors.danger,
          borderWidth: isSecondary ? 1.5 : 0,
          borderColor: isSecondary ? (isDark ? "#1E293B" : mobileTheme.colors.border) : "transparent",
          opacity: disabled || loading ? 0.4 : 1,
          transform: [{ scale: state.pressed ? 0.96 : 1 }],
        };

        if (typeof resolvedStyle === "function") {
          return [baseStyle, resolvedStyle(state)];
        }

        return [baseStyle, resolvedStyle];
      }}
    >
      <View className="flex-row items-center gap-2">
        {loading ? (
          <ActivityIndicator 
            color={
              isPrimary 
                ? (isDark ? "#0F172A" : mobileTheme.colors.white)
                : isDestructive ? mobileTheme.colors.white : (isDark ? "#94A3B8" : mobileTheme.colors.inkMuted)
            } 
          />
        ) : null}
        <AppText
          responsiveRole={size === "sm" ? "chip" : size === "lg" ? "title" : "bodyStrong"}
          className={cn(
            "font-cairo-black tracking-tight",
            isPrimary ? "text-white dark:text-slate-900" : "",
            isSecondary ? "text-slate-900 dark:text-slate-100" : "",
            isGhost ? "text-slate-600 dark:text-slate-400" : "",
            isDestructive ? "text-white" : "",
            textClassName,
          )}
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}
