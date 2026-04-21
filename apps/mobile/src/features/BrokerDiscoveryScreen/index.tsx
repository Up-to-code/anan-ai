import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";

export default function BrokerDiscoveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { dictionary } = useMobileLocale();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.borderStrong}
        leading={<View style={{ width: 44, height: 44 }} />}
        trailing={<IconButton icon={ArrowRight} onPress={() => router.back()} tone="ghost" />}
        centerSlot={
          <AppText className="text-center text-[20px] font-cairo-black" style={{ color: theme.colors.ink }}>
            {dictionary.runtime.brokerDirectoryTitle}
          </AppText>
        }
      />

      <View className="flex-1 px-5 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        <MobileSurface tone="muted" radius="hero" className="gap-4 px-6 py-8">
          <AppText className="text-right text-[22px] font-cairo-black" style={{ color: theme.colors.ink }}>
            {dictionary.runtime.brokerUnavailableTitle}
          </AppText>
          <AppText className="text-right text-[15px] leading-8 font-cairo-medium" style={{ color: theme.colors.inkMuted }}>
            {dictionary.runtime.brokerUnavailableBody}
          </AppText>
        </MobileSurface>
      </View>
    </View>
  );
}
