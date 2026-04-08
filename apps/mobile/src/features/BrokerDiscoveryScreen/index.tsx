import React, { useMemo, useState } from "react";
import { Share, TextInput, View } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { ArrowRight, MapPin, Search, Share2, SlidersHorizontal } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileBrokerCard } from "@/components/brokers/MobileBrokerCard";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { filterMockBrokers, getMockBrokers } from "@/lib/mockBrokers";
import { useAppTheme } from "@/lib/mobileTheme";

const ALL_LOCATIONS = "كل المناطق";
const LOCATION_OPTIONS = [ALL_LOCATIONS, "القاهرة الجديدة", "الشيخ زايد", "المعادي"];

export default function BrokerDiscoveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(ALL_LOCATIONS);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const brokers = useMemo(
    () =>
      filterMockBrokers({
        brokers: getMockBrokers(),
        query,
        location: selectedLocation,
        verifiedOnly,
      }),
    [query, selectedLocation, verifiedOnly],
  );

  function cycleLocation() {
    const currentIndex = LOCATION_OPTIONS.indexOf(selectedLocation);
    const nextIndex = (currentIndex + 1) % LOCATION_OPTIONS.length;
    setSelectedLocation(LOCATION_OPTIONS[nextIndex] ?? ALL_LOCATIONS);
  }

  function openBrokerProfile(brokerId: string) {
    router.push({
      pathname: "/broker/[id]",
      params: { id: brokerId },
    });
  }

  function openCall(phone: string) {
    void Linking.openURL(`tel:${phone}`);
  }

  function openWhatsApp(phone: string) {
    const sanitized = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
    void Linking.openURL(`https://wa.me/${sanitized}`);
  }

  async function shareScreen() {
    await Share.share({
      message: "اكتشف الوسطاء المناسبين في عنان.",
    });
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.borderStrong}
        leading={<IconButton icon={Share2} onPress={() => void shareScreen()} tone="ghost" />}
        trailing={<IconButton icon={ArrowRight} onPress={() => router.back()} tone="ghost" />}
        centerSlot={
          <AppText className="text-center text-[20px] font-cairo-black" style={{ color: theme.colors.ink }}>
            ابحث عن الوكيل
          </AppText>
        }
      />

      <View className="flex-1 px-5 pt-4">
        <View className="flex-row-reverse gap-3">
          <View style={{ flex: 1 }}>
            <Button
              label={verifiedOnly ? "تصفية البحث" : "عرض الكل"}
              variant="secondary"
              onPress={() => setVerifiedOnly((current) => !current)}
              textClassName="text-[15px]"
              style={{ backgroundColor: verifiedOnly ? theme.colors.primarySoft : undefined }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label={selectedLocation === ALL_LOCATIONS ? "حدد الموقع" : selectedLocation}
              variant="secondary"
              onPress={cycleLocation}
              textClassName="text-[15px]"
            />
          </View>
        </View>

        <View
          className="mt-3 flex-row-reverse items-center gap-3 px-4"
          style={{
            minHeight: 52,
            borderRadius: theme.radii.hero,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Search size={18} color={theme.colors.inkMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث باسم الوكيل أو الشركة"
            placeholderTextColor={theme.colors.inkMuted}
            cursorColor={theme.colors.primary}
            className="flex-1 text-right font-cairo-medium text-[15px]"
            style={{ color: theme.colors.ink }}
          />
        </View>

        <View className="mt-5 flex-row-reverse items-center justify-between">
          <AppText className="text-right text-[15px] font-cairo-medium" style={{ color: theme.colors.inkMuted }}>
            {`${brokers.length.toLocaleString("en-US")}+ عرض وكيل`}
          </AppText>
          <View className="flex-row-reverse items-center gap-2">
            <SlidersHorizontal size={16} color={theme.colors.inkMuted} />
            <MapPin size={16} color={theme.colors.inkMuted} />
          </View>
        </View>

        <View className="flex-1 pt-4" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
          <FlashList
            data={brokers}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 72 }}
            renderItem={({ item }) => (
              <View className="mb-4">
                <MobileBrokerCard
                  broker={item}
                  onPress={(broker) => openBrokerProfile(broker.id)}
                  onPressCall={(broker) => openCall(broker.phone)}
                  onPressWhatsApp={(broker) => openWhatsApp(broker.whatsapp)}
                />
              </View>
            )}
            ListEmptyComponent={
              <MobileSurface tone="muted" radius="hero" className="items-center gap-3 px-8 py-14">
                <AppText className="text-center text-[20px] font-cairo-black" style={{ color: theme.colors.ink }}>
                  لا يوجد وكلاء مطابقون
                </AppText>
                <AppText className="text-center text-[14px] font-cairo-medium" style={{ color: theme.colors.inkMuted }}>
                  جرّب اسماً آخر أو بدّل الموقع أو ألغِ التصفية الحالية.
                </AppText>
              </MobileSurface>
            }
          />
        </View>
      </View>
    </View>
  );
}
