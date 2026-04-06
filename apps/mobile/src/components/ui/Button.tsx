import { ActivityIndicator, Pressable, PressableProps, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { cn } from "@/lib/cn";
import { useMobileLayout } from "@/lib/mobileLayout";
import { useAppTheme } from "@/lib/mobileTheme";

type ButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "accent";
  loading?: boolean;
  size?: "default" | "sm" | "lg";
  textClassName?: string;
  className?: string;
};

/**
 * WHY:   The new Unified Rounded system dictates pill containers and delicate 1px bounds.
 * WHAT:  Modern pill-shaped button with soft zinc borders for outlines.
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
  const theme = useAppTheme();
  
  const isPrimary = variant === "primary" || variant === "accent";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";
  const isDestructive = variant === "destructive";

  const sizeStyle = {
    sm: {
      minHeight: layout.touchTarget,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: theme.radii.pill, // 9999px Pill
    },
    default: {
      minHeight: layout.touchTarget + 4,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: theme.radii.pill, // 9999px Pill
    },
    lg: {
      minHeight: layout.touchTarget + 10,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: theme.radii.pill, // 9999px Pill
    },
  };

  const resolvedStyle =
    typeof style === "function"
      ? (state: Parameters<NonNullable<typeof style>>[0]) => [sizeStyle[size], style(state)]
      : [sizeStyle[size], style];

  function getBackgroundColor() {
    if (isPrimary) return theme.colors.primary;
    if (isSecondary) return "transparent"; 
    if (isGhost) return "transparent";
    if (isDestructive) return theme.colors.danger;
    return theme.colors.primary;
  }

  function getTextColor() {
    if (isPrimary) return "#FFFFFF";
    if (isSecondary) return theme.colors.primary;
    if (isGhost) return theme.colors.inkSoft;
    if (isDestructive) return "#FFFFFF";
    return "#FFFFFF";
  }

  function getSpinnerColor() {
    if (isPrimary || isDestructive) return "#FFFFFF";
    return theme.colors.primary;
  }

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      className={cn(className)}
      style={(state) => {
        const baseStyle = {
          alignItems: "center" as const,
          justifyContent: "center" as const,
          backgroundColor: getBackgroundColor(),
          borderWidth: isSecondary ? 1 : 0, // Delicate 1px borders
          borderColor: isSecondary ? theme.colors.borderStrong : "transparent",
          opacity: disabled || loading ? 0.4 : 1,
          transform: [{ scale: state.pressed ? 0.96 : 1 }], // Softer feel
        };

        if (typeof resolvedStyle === "function") {
          return [baseStyle, resolvedStyle(state)];
        }

        return [baseStyle, resolvedStyle];
      }}
    >
      <View className="flex-row items-center gap-2">
        {loading ? <ActivityIndicator color={getSpinnerColor()} size="small" /> : null}
        <AppText
          className={cn(
            "font-cairo-bold", // Approachable bold instead of extreme black Tracking
            size === "lg" ? "text-sm" : "text-xs",
            textClassName
          )}
          style={{ color: getTextColor() }}
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}
