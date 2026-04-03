import { LucideIcon } from "lucide-react-native";
import { Pressable, PressableProps, StyleSheet, useColorScheme } from "react-native";
import { mobileTheme } from "@/lib/mobileTheme";

type IconButtonProps = PressableProps & {
  icon: LucideIcon;
  active?: boolean;
  tone?: "light" | "panel" | "ghost" | "inversePanel";
  size?: "sm" | "default" | "lg";
};

/**
 * WHY:   Compact icon actions appear in headers, search bars, and property surfaces.
 * WHAT:  Renders a perfectly circular icon button with elegant dark mode and press states.
 * HOW:   Uses rounded-full geometry with subtle borders and precise sizing.
 */
export function IconButton({ icon: Icon, active, tone = "light", size = "default", className, ...props }: IconButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  const buttonSizes = {
    sm: 36,
    default: 44,
    lg: 56,
  };

  const iconSizes = {
    sm: 16,
    default: 20,
    lg: 24,
  };

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.base,
        {
          width: buttonSizes[size],
          height: buttonSizes[size],
          borderRadius: buttonSizes[size] / 2,
          borderWidth: tone === "panel" || tone === "inversePanel" || active ? 1 : 0,
          borderColor:
            tone === "inversePanel"
              ? "rgba(255,255,255,0.10)"
              : active
                ? (isDark ? "#3B82F6" : mobileTheme.colors.primary)
                : (isDark ? "#1E293B" : mobileTheme.colors.border),
          backgroundColor:
            tone === "inversePanel"
              ? "rgba(255,255,255,0.04)"
              : tone === "panel"
              ? active
                ? (isDark ? "#172554" : mobileTheme.colors.primarySoft)
                : (isDark ? "#0F172A" : mobileTheme.colors.surface)
              : "transparent",
          transform: [{ scale: pressed ? 0.94 : 1 }],
          opacity: props.disabled ? 0.5 : 1,
        },
      ]}
    >
      <Icon 
        color={
          tone === "inversePanel"
            ? "#F8FAFC"
            : active
              ? (isDark ? "#60A5FA" : mobileTheme.colors.primary)
              : tone === "light"
                ? (isDark ? "#94A3B8" : mobileTheme.colors.inkMuted)
                : (isDark ? "#CBD5E1" : mobileTheme.colors.inkSoft)
        } 
        size={iconSizes[size]} 
        strokeWidth={active ? 2.5 : 2} 
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});
