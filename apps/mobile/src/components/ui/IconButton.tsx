import { LucideIcon } from "lucide-react-native";
import { memo } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";
import { useAppTheme } from "@/lib/mobileTheme";

type IconButtonProps = PressableProps & {
  icon: LucideIcon;
  active?: boolean;
  tone?: "light" | "panel" | "ghost" | "inversePanel";
  size?: "sm" | "default" | "lg";
};

/**
 * WHY:   Icon buttons in the unified system leverage pill/circular hit zones.
 * WHAT:  Icon button rendering utilizing 9999px radii and 1px frame strokes.
 */
const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export const IconButton = memo(function IconButton({ icon: Icon, active, tone = "light", size = "default", className, ...props }: IconButtonProps) {
  const theme = useAppTheme();

  const buttonSizes = {
    sm: 36,
    default: 44,
    lg: 54,
  };

  const iconSizes = {
    sm: 18,
    default: 20,
    lg: 24,
  };

  function getBackgroundColor() {
    if (tone === "inversePanel") {
      return active ? theme.colors.primarySoft : "rgba(255,255,255,0.04)";
    }
    if (tone === "panel") {
      if (active) return theme.colors.primarySoft;
      return theme.colors.surface;
    }
    return "transparent";
  }

  function getBorderColor() {
    if (tone === "inversePanel") {
      return active ? theme.colors.primary : "rgba(255,255,255,0.10)";
    }
    if (active) return theme.colors.primary;
    return theme.colors.border; // Delicate 1px frame
  }

  function getIconColor() {
    if (tone === "inversePanel") {
      return active ? theme.colors.primary : "#F8FAFC";
    }
    if (active) return theme.colors.primary;
    if (tone === "light") return theme.colors.inkMuted;
    return theme.colors.inkSoft;
  }

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.base,
        {
          width: buttonSizes[size],
          height: buttonSizes[size],
          borderRadius: theme.radii.pill, // 9999px pill interaction
          borderWidth: tone === "panel" || tone === "inversePanel" || active ? 1 : 0, // 1px
          borderColor: getBorderColor(),
          backgroundColor: getBackgroundColor(),
          transform: [{ scale: pressed ? 0.95 : 1 }],
          opacity: props.disabled ? 0.5 : 1,
        },
      ]}
    >
      <Icon
        color={getIconColor()}
        size={iconSizes[size]}
        strokeWidth={active ? 2.5 : 2}
      />
    </Pressable>
  );
});

export default IconButton;
