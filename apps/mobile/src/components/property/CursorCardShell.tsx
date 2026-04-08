import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { resolveCursorCardAppearance, useAppTheme } from "@/lib/mobileTheme";

type CursorCardShellProps = {
  children: ReactNode;
  ambientBackgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

type CursorCardActionProps = {
  label: string;
  onPress: () => void;
  ambientBackgroundColor?: string;
  emphasis?: "default" | "primary";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * WHY:   Mobile property cards need one shared shell so assistant, search, and AG-UI cards feel like the same object.
 * WHAT:  Renders a cursor-style card frame with a decorative ambient edge fade and an inner bordered surface.
 * HOW:   Uses theme-resolved cursor-card tokens and non-interactive edge gradients so the wrapper blends into the parent background without stealing taps.
 */
export function CursorCardShell({
  children,
  ambientBackgroundColor,
  style,
  contentStyle,
}: CursorCardShellProps) {
  const theme = useAppTheme();
  const appearance = resolveCursorCardAppearance(theme, ambientBackgroundColor);
  const frameReach = appearance.frameThickness * 8;

  return (
    <View
      style={[
        {
          position: "relative",
          borderRadius: appearance.outerRadius,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[appearance.edgeColor, appearance.transparentEdgeColor]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.horizontalEdge, { top: 0, height: frameReach }]}
        />
        <LinearGradient
          colors={[appearance.edgeColor, appearance.transparentEdgeColor]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={[styles.horizontalEdge, { bottom: 0, height: frameReach }]}
        />
        <LinearGradient
          colors={[appearance.edgeColor, appearance.transparentEdgeColor]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.verticalEdge, { right: 0, width: frameReach }]}
        />
        <LinearGradient
          colors={[appearance.edgeColor, appearance.transparentEdgeColor]}
          start={{ x: 1, y: 0.5 }}
          end={{ x: 0, y: 0.5 }}
          style={[styles.verticalEdge, { left: 0, width: frameReach }]}
        />
      </View>

      <View style={{ padding: appearance.frameThickness }}>
        <View
          style={[
            {
              borderRadius: appearance.innerRadius,
              borderWidth: 1,
              borderColor: appearance.borderColor,
              backgroundColor: appearance.surfaceColor,
              overflow: "hidden",
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

/**
 * WHY:   Property cards need one clear, low-noise CTA style across assistant and search surfaces.
 * WHAT:  Renders the shared action control used in the cursor-card footer.
 * HOW:   Defaults to a calm outlined action and can optionally elevate to a blue-tinted primary emphasis for shortlist/search actions.
 */
export function CursorCardAction({
  label,
  onPress,
  ambientBackgroundColor,
  emphasis = "default",
  disabled = false,
  style,
}: CursorCardActionProps) {
  const theme = useAppTheme();
  const appearance = resolveCursorCardAppearance(theme, ambientBackgroundColor);
  const isPrimary = emphasis === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          minHeight: 38,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: theme.radii.pill,
          borderWidth: 1,
          borderColor: isPrimary ? theme.colors.primaryMuted : appearance.actionBorderColor,
          backgroundColor: isPrimary ? theme.colors.primarySoft : appearance.actionSurfaceColor,
          alignSelf: "flex-start",
          opacity: disabled ? 0.55 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <View className="flex-row-reverse items-center gap-1.5">
        <ChevronLeft size={14} color={isPrimary ? theme.colors.primary : appearance.actionTextColor} />
        <AppText
          className="text-[12px] font-cairo-bold"
          style={{ color: isPrimary ? theme.colors.primary : appearance.actionTextColor }}
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  horizontalEdge: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  verticalEdge: {
    position: "absolute",
    top: 0,
    bottom: 0,
  },
});
