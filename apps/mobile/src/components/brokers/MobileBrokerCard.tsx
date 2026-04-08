import React from "react";
import { MessageCircle, Phone, ShieldCheck } from "lucide-react-native";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/lib/mobileTheme";
import type { MobileBroker } from "@/types/mobile";

type MobileBrokerCardProps = {
  broker: MobileBroker;
  onPress: (broker: MobileBroker) => void;
  onPressWhatsApp: (broker: MobileBroker) => void;
  onPressCall: (broker: MobileBroker) => void;
};

export function MobileBrokerCard({
  broker,
  onPress,
  onPressWhatsApp,
  onPressCall,
}: MobileBrokerCardProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={() => onPress(broker)}
      className="flex-row-reverse overflow-hidden"
      style={({ pressed }) => ({
        borderRadius: theme.radii.hero,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        opacity: pressed ? 0.96 : 1,
      })}
    >
      <Image
        source={broker.avatar}
        style={{ width: 128, minHeight: 176, backgroundColor: theme.colors.surfaceMuted }}
        contentFit="cover"
        transition={120}
      />

      <View className="flex-1 justify-between px-4 py-4">
        <View className="gap-2">
          <View className="flex-row-reverse items-center gap-2">
            <AppText className="flex-1 text-right text-[24px] font-cairo-black leading-8" style={{ color: theme.colors.ink }}>
              {broker.name}
            </AppText>
            {broker.isVerified ? <ShieldCheck size={18} color={theme.colors.teal} /> : null}
          </View>

          <View className="flex-row-reverse flex-wrap gap-2">
            {broker.badges.map((badge) => (
              <View
                key={badge.id}
                className="items-center justify-center rounded-[10px] px-2.5 py-1.5"
                style={{
                  backgroundColor:
                    badge.tone === "plum"
                      ? "#F3E8FF"
                      : badge.tone === "sky"
                        ? "#E0F2FE"
                        : "#083344",
                }}
              >
                <AppText
                  className="text-[11px] font-cairo-bold"
                  style={{
                    color:
                      badge.tone === "plum"
                        ? "#A21CAF"
                        : badge.tone === "sky"
                          ? "#0284C7"
                          : "#FFFFFF",
                  }}
                >
                  {badge.label}
                </AppText>
              </View>
            ))}
          </View>

          <AppText className="text-right text-[18px] font-cairo-medium" style={{ color: theme.colors.inkSoft }}>
            {broker.company}
          </AppText>
          <AppText className="text-right text-[14px] font-cairo-medium" style={{ color: theme.colors.inkMuted }}>
            {broker.languages.join(" • ")}
          </AppText>
        </View>

        <View className="flex-row-reverse gap-3 pt-3">
          <QuickAction
            label="اتصال"
            icon={<Phone size={18} color={theme.colors.primary} />}
            onPress={() => onPressCall(broker)}
          />
          <QuickAction
            label="واتساب"
            icon={<MessageCircle size={18} color={theme.colors.teal} />}
            onPress={() => onPressWhatsApp(broker)}
          />
        </View>
      </View>
    </Pressable>
  );
}

function QuickAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      className="flex-1 flex-row-reverse items-center justify-center gap-2 px-3 py-3"
      style={({ pressed }) => ({
        borderRadius: theme.radii.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceMuted,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      {icon}
      <AppText className="text-[16px] font-cairo-bold" style={{ color: theme.colors.primary }}>
        {label}
      </AppText>
    </Pressable>
  );
}
