import type { ReactNode } from "react";
import { Pressable, Switch, TextInput, View } from "react-native";
import { Check, Mail, ShieldCheck } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";

export function useAuthPanelPalette() {
  const theme = useAppTheme();

  return {
    panelBackground: theme.isDark ? theme.colors.surfaceMuted : theme.colors.dark,
    panelBorder: theme.isDark ? theme.colors.borderStrong : theme.colors.dark,
    primaryText: theme.isDark ? theme.colors.ink : "#FFFFFF",
    secondaryText: theme.isDark ? theme.colors.inkMuted : "rgba(255,255,255,0.68)",
    tertiaryText: theme.isDark ? theme.colors.inkMuted : "rgba(255,255,255,0.48)",
    subtleSurface: theme.isDark ? theme.colors.surfaceStrong : "rgba(255,255,255,0.1)",
    subtleBorder: theme.isDark ? theme.colors.borderStrong : "rgba(255,255,255,0.16)",
    outlineBackground: theme.isDark ? theme.colors.surface : "transparent",
    darkButtonBackground: theme.isDark ? theme.colors.surfaceStrong : "rgba(255,255,255,0.14)",
    darkButtonBorder: theme.isDark ? theme.colors.borderStrong : "rgba(255,255,255,0.04)",
    darkButtonText: theme.isDark ? theme.colors.ink : "#FFFFFF",
    iconOnDark: theme.isDark ? theme.colors.ink : "#FFFFFF",
  };
}

export function AuthMessageCard({
  title,
  body,
  tone = "default",
}: {
  title: string;
  body: string;
  tone?: "default" | "danger";
}) {
  const theme = useAppTheme();
  return (
    <View
      className="gap-2 rounded-[24px] px-4 py-4"
      style={{
        borderWidth: 1,
        borderColor: tone === "danger" ? theme.colors.dangerSoft : theme.colors.border,
        backgroundColor: tone === "danger" ? theme.colors.dangerSoft : theme.colors.surfaceMuted,
      }}
    >
      <AppText className="text-right text-[14px] font-cairo-black" style={{ color: tone === "danger" ? theme.colors.danger : theme.colors.ink }}>
        {title}
      </AppText>
      <AppText className="text-right text-[13px] leading-7 font-medium" style={{ color: tone === "danger" ? theme.colors.danger : theme.colors.inkMuted }}>
        {body}
      </AppText>
    </View>
  );
}

export function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "number-pad";
  autoCapitalize?: "none" | "sentences";
  secureTextEntry?: boolean;
}) {
  const theme = useAppTheme();
  const { isRtl, textAlign, direction } = useMobileLocale();
  return (
    <View className="gap-2">
      <AppText className={`${isRtl ? "text-right" : "text-left"} text-[13px] font-cairo-bold`} style={{ color: theme.colors.ink }}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inkMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        textAlign={textAlign}
        style={{
          minHeight: 60,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          color: theme.colors.ink,
          paddingHorizontal: 18,
          fontFamily: "Cairo_500Medium",
          writingDirection: direction,
        }}
      />
    </View>
  );
}

export function AuthActionButton({
  title,
  accent,
  onPress,
  tone = "dark",
  compact = false,
}: {
  title: string;
  accent: ReactNode;
  onPress: () => void;
  tone?: "dark" | "light" | "outline";
  compact?: boolean;
}) {
  const theme = useAppTheme();
  const panel = useAuthPanelPalette();
  const palette =
    tone === "light"
      ? {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          titleColor: theme.colors.ink,
        }
      : tone === "outline"
        ? {
            backgroundColor: panel.outlineBackground,
            borderColor: panel.subtleBorder,
            titleColor: panel.primaryText,
          }
        : {
            backgroundColor: panel.darkButtonBackground,
            borderColor: panel.darkButtonBorder,
            titleColor: panel.darkButtonText,
          };

  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center active:opacity-80"
      style={{
        minHeight: compact ? 52 : 62,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: palette.borderColor,
        backgroundColor: palette.backgroundColor,
        paddingHorizontal: 14,
        paddingVertical: compact ? 8 : 10,
      }}
    >
      <View className="flex-row items-center justify-center" style={{ gap: 8 }}>
        <View
          className="items-center justify-center"
          style={{
            width: compact ? 22 : 24,
            height: compact ? 22 : 24,
          }}
        >
          {accent}
        </View>
        <AppText className="text-right text-[14px] font-cairo-black" style={{ color: palette.titleColor }}>
          {title}
        </AppText>
      </View>
    </Pressable>
  );
}

export function AuthTrustRow({ children }: { children: ReactNode }) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();
  return (
    <View className={`items-center gap-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
      <View
        className="items-center justify-center"
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: theme.colors.surfaceMuted,
        }}
      >
        <ShieldCheck size={16} color={theme.colors.teal} />
      </View>
      <AppText className="flex-1 text-right text-[13px] leading-6 font-medium" style={{ color: theme.colors.inkMuted }}>
        {children}
      </AppText>
    </View>
  );
}

export function AuthLegalToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  const panel = useAuthPanelPalette();
  const { isRtl } = useMobileLocale();
  return (
    <View
      className={`items-center gap-3 rounded-[22px] px-4 py-4 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
      style={{
        borderWidth: 1,
        borderColor: panel.subtleBorder,
        backgroundColor: panel.subtleSurface,
      }}
    >
      <Switch value={checked} onValueChange={onChange} />
      <AppText className="flex-1 text-right text-[13px] leading-7 font-medium" style={{ color: panel.primaryText }}>
        {label}
      </AppText>
    </View>
  );
}

export function GoogleBadge() {
  const panel = useAuthPanelPalette();
  return <AppText className="text-[18px] font-cairo-black" style={{ color: panel.iconOnDark }}>G</AppText>;
}

export function AppleBadge() {
  return <AppText className="text-[18px] font-cairo-black" style={{ color: "#111111" }}>A</AppText>;
}

export function EmailBadge() {
  const panel = useAuthPanelPalette();
  return <Mail size={18} color={panel.iconOnDark} />;
}

export function SuccessBadge() {
  const theme = useAppTheme();
  return <Check size={18} color={theme.colors.primary} />;
}

export function AuthBottomPanel({
  children,
}: {
  children: ReactNode;
}) {
  const panel = useAuthPanelPalette();
  return (
    <View
      className="gap-2.5 rounded-t-[34px] px-5 pt-3"
      style={{
        backgroundColor: panel.panelBackground,
        borderTopWidth: 1,
        borderTopColor: panel.panelBorder,
        borderTopLeftRadius: 34,
        borderTopRightRadius: 34,
      }}
    >
      {children}
    </View>
  );
}

export function getAuthScreenMetrics(screenHeight: number) {
  if (screenHeight < 700) {
    return {
      minHeight: 680,
      heroTopPadding: 20,
      heroCompact: true,
      footerNotePaddingTop: 2,
    };
  }

  if (screenHeight < 820) {
    return {
      minHeight: screenHeight - 12,
      heroTopPadding: 34,
      heroCompact: true,
      footerNotePaddingTop: 4,
    };
  }

  return {
    minHeight: screenHeight - 12,
    heroTopPadding: 56,
    heroCompact: false,
    footerNotePaddingTop: 6,
  };
}

export function AuthHero({
  eyebrow,
  title,
  description,
  dot = false,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  dot?: boolean;
  compact?: boolean;
}) {
  const theme = useAppTheme();

  return (
    <View className="items-end px-1">
      {eyebrow ? (
        <AppText className="text-right text-[11px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
          {eyebrow}
        </AppText>
      ) : null}
      <View className="flex-row-reverse items-center" style={{ marginTop: compact ? 8 : 12, gap: compact ? 10 : 12 }}>
        {dot ? (
          <View
            style={{
              width: compact ? 14 : 18,
              height: compact ? 14 : 18,
              borderRadius: compact ? 7 : 9,
              backgroundColor: theme.colors.primary,
            }}
          />
        ) : null}
        <AppText
          className="text-right font-cairo-black"
          style={{
            color: theme.colors.primary,
            fontSize: compact ? 30 : 34,
            lineHeight: compact ? 38 : 44,
          }}
        >
          {title}
        </AppText>
      </View>
      {description ? (
        <AppText
          className="text-right font-medium"
          style={{
            color: theme.colors.inkMuted,
            marginTop: compact ? 10 : 16,
            fontSize: compact ? 13 : 14,
            lineHeight: compact ? 28 : 32,
          }}
        >
          {description}
        </AppText>
      ) : null}
    </View>
  );
}
