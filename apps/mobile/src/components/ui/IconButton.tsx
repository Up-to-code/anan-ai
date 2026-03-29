import { LucideIcon } from "lucide-react-native";
import { Pressable, PressableProps, StyleSheet, useColorScheme } from "react-native";

type IconButtonProps = PressableProps & {
  icon: LucideIcon;
  active?: boolean;
  tone?: "light" | "panel" | "ghost";
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
          borderWidth: tone === "panel" || active ? 1 : 0,
          borderColor: active ? (isDark ? "#3B82F6" : "#2563EB") : (isDark ? "#1E293B" : "#E2E8F0"),
          backgroundColor:
            tone === "panel"
              ? active
                ? (isDark ? "#172554" : "#EFF6FF")
                : (isDark ? "#0F172A" : "#FFFFFF")
              : "transparent",
          transform: [{ scale: pressed ? 0.94 : 1 }],
          opacity: props.disabled ? 0.5 : 1,
        },
      ]}
    >
      <Icon 
        color={active ? (isDark ? "#60A5FA" : "#2563EB") : tone === "light" ? (isDark ? "#94A3B8" : "#64748B") : (isDark ? "#CBD5E1" : "#475569")} 
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
