import type { ReactNode } from "react";
import { Animated, Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useMobileLayout } from "@/lib/mobileLayout";
import { getMobileShadow, useAppTheme } from "@/lib/mobileTheme";

type MobilePromptInputShellProps = {
  children: ReactNode;
  active?: boolean;
  expanded?: boolean;
  hint?: string | null;
  style?: StyleProp<ViewStyle>;
};

type MobilePromptInputStatusProps = {
  label: string;
  tone?: "default" | "danger";
  icon?: ReactNode;
};

type MobilePromptInputRecordingRowProps = {
  durationSeconds: number;
  waveAnims: Animated.Value[];
  onCancel: () => void;
  onStop: () => void;
};

/**
 * WHY:   The mobile app needs one shared ChatGPT-like prompt surface instead of duplicating composer shell styling.
 * WHAT:  Renders the shared multiline prompt-input shell used by mobile chat surfaces.
 * HOW:   Keeps the resting state calm, expands gently for larger drafts, and supports a small inline hint region above the input row.
 */
export function MobilePromptInputShell({
  children,
  active = false,
  expanded = false,
  hint,
  style,
}: MobilePromptInputShellProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        {
          borderRadius: expanded ? theme.radii.panel : theme.radii.hero,
          borderWidth: 0,
          borderColor: active ? theme.colors.primaryMuted : "transparent",
          backgroundColor: "transparent",
          paddingHorizontal: 0,
          paddingVertical: 0,
        },
        style,
      ]}
    >
      {hint ? (
        <View className="px-3 pb-2">
          <AppText className="text-[11px] font-cairo-bold text-right" style={{ color: theme.colors.inkMuted }}>
            {hint}
          </AppText>
        </View>
      ) : null}

      {children}
    </View>
  );
}

/**
 * WHY:   Composer mode changes such as recording errors or upload/transcription need a small shared visual treatment.
 * WHAT:  Renders a compact inline status capsule for prompt-input state changes.
 * HOW:   Uses a pill container so state feedback stays visible without turning into a second heavy card.
 */
export function MobilePromptInputStatus({
  label,
  tone = "default",
  icon,
}: MobilePromptInputStatusProps) {
  const theme = useAppTheme();
  const isDanger = tone === "danger";

  return (
    <View
      className="flex-row-reverse items-center justify-center gap-2 px-4 py-2.5"
      style={{
        alignSelf: "stretch",
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: isDanger ? theme.colors.danger : theme.colors.border,
        backgroundColor: isDanger ? theme.colors.dangerSoft : theme.colors.surfaceMuted,
      }}
    >
      {icon}
      <AppText
        className="text-[12px] font-cairo-bold text-right"
        style={{ color: isDanger ? theme.colors.danger : theme.colors.ink }}
      >
        {label}
      </AppText>
    </View>
  );
}

/**
 * WHY:   Voice recording should feel like one calm, centered composer state instead of stacked mini-panels.
 * WHAT:  Renders the shared single-line recording row with symmetric actions, inline timer, and mirrored waveform motion.
 * HOW:   Uses a white capsule surface, keeps cancel/stop at equal visual weight, and places the timer inside the waveform cluster so nothing drops to a second line.
 */
export function MobilePromptInputRecordingRow({
  durationSeconds,
  waveAnims,
  onCancel,
  onStop,
}: MobilePromptInputRecordingRowProps) {
  const layout = useMobileLayout();
  const theme = useAppTheme();
  const barWidth = layout.isCompact ? 3 : 3.5;
  const barHeight = layout.isCompact ? 16 : 18;
  const centerIndex = Math.floor(waveAnims.length / 2);
  const leftWaveAnims = waveAnims.slice(0, centerIndex).reverse();
  const rightWaveAnims = waveAnims.slice(centerIndex);

  return (
    <View
      className="flex-1 flex-row items-center justify-between px-2.5"
      style={{
        minHeight: layout.isCompact ? 48 : 52,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.white,
        ...getMobileShadow("card"),
      }}
    >
      <RecordingSideButton
        icon={<AppText className="text-[18px] font-cairo-bold" style={{ color: theme.colors.ink }}>×</AppText>}
        backgroundColor={theme.colors.surfaceMuted}
        onPress={onCancel}
      />

      <View className="flex-1 flex-row items-center justify-center gap-3 px-3">
        <WaveGroup
          waveAnims={leftWaveAnims}
          barWidth={barWidth}
          barHeight={barHeight}
          color={theme.colors.primary}
          reversePeak
        />

        <AppText
          className="min-w-[48px] text-center text-[13px] font-cairo-bold"
          style={{ color: theme.colors.ink, writingDirection: "ltr" }}
        >
          {formatDuration(durationSeconds)}
        </AppText>

        <WaveGroup
          waveAnims={rightWaveAnims}
          barWidth={barWidth}
          barHeight={barHeight}
          color={theme.colors.primary}
        />
      </View>

      <RecordingSideButton
        icon={<View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: theme.colors.white }} />}
        backgroundColor={theme.colors.composerActionSurface}
        onPress={onStop}
        shadow
      />
    </View>
  );
}

function RecordingSideButton({
  icon,
  backgroundColor,
  onPress,
  shadow = false,
}: {
  icon: ReactNode;
  backgroundColor: string;
  onPress: () => void;
  shadow?: boolean;
}) {
  const layout = useMobileLayout();

  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center rounded-full"
      style={({ pressed }) => ({
        width: layout.isCompact ? 40 : 44,
        height: layout.isCompact ? 40 : 44,
        backgroundColor,
        transform: [{ scale: pressed ? 0.94 : 1 }],
        ...(shadow ? getMobileShadow("float") : {}),
      })}
    >
      {icon}
    </Pressable>
  );
}

function WaveGroup({
  waveAnims,
  barWidth,
  barHeight,
  color,
  reversePeak = false,
}: {
  waveAnims: Animated.Value[];
  barWidth: number;
  barHeight: number;
  color: string;
  reversePeak?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-center gap-1.5">
      {waveAnims.map((anim, index) => {
        const peakFactor = reversePeak ? waveAnims.length - index : index + 1;
        const maxScale = 0.7 + peakFactor * 0.16;
        const scaleY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, maxScale],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.35, 1],
        });

        return (
          <Animated.View
            key={`${reversePeak ? "left" : "right"}-wave-${index}`}
            style={{
              width: barWidth,
              height: barHeight,
              borderRadius: 999,
              backgroundColor: color,
              opacity,
              transform: [{ scaleY }],
            }}
          />
        );
      })}
    </View>
  );
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
