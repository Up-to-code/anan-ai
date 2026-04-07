import { useEffect, useState } from "react";
import { ActivityIndicator, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Images } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { GalleryViewport } from "@/features/GalleryScreen/GalleryViewport";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";
import { mobileTheme } from "@/lib/mobileTheme";

function clampInitialIndex(rawValue: string | undefined, imageCount: number) {
  const parsed = Number.parseInt(rawValue ?? "0", 10);
  if (!Number.isFinite(parsed)) return 0;
  if (imageCount <= 0) return 0;
  return Math.min(Math.max(parsed, 0), imageCount - 1);
}

/**
 * WHY:   Buyers need a distraction-free fullscreen photo swipe that feels like a native viewer.
 * WHAT:  Renders a black-screen gallery with only the image stage, a back button, and a simple slide counter.
 * HOW:   Loads the property media from route params, keeps the active index in local state, and reuses the shared paged viewport in contain mode.
 */
export default function GalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const params = useLocalSearchParams<{
    propertyId?: string;
    initialIndex?: string;
  }>();
  const { property, isLoading } = usePropertyDetail(params.propertyId);
  const images = property?.media ?? [];
  const initialIndex = clampInitialIndex(params.initialIndex, images.length);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, params.propertyId]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: "#000000" }}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={mobileTheme.colors.white} />
      </View>
    );
  }

  if (!property || images.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: "#000000" }}>
        <StatusBar style="light" />
        <View
          className="items-center gap-4 rounded-[28px] px-8 py-10"
          style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}
        >
          <Images size={28} color="rgba(255,255,255,0.82)" />
          <AppText className="text-center text-[20px] font-cairo-bold text-white">لا توجد صور حالياً</AppText>
        </View>
        <View style={{ position: "absolute", top: insets.top + 12, left: 16 }}>
          <IconButton icon={ArrowLeft} onPress={() => router.back()} tone="inversePanel" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#000000" }}>
      <StatusBar style="light" />

      <GalleryViewport
        images={images}
        currentIndex={currentIndex}
        initialIndex={initialIndex}
        onIndexChange={setCurrentIndex}
        viewportHeight={height}
        contentFit="contain"
        backgroundColor="#000000"
      />

      <View style={{ position: "absolute", top: insets.top + 12, left: 16 }}>
        <IconButton icon={ArrowLeft} onPress={() => router.back()} tone="inversePanel" />
      </View>

      <View
        className="absolute self-center px-4 py-2"
        style={{
          top: insets.top + 14,
          borderRadius: mobileTheme.radii.pill,
          backgroundColor: "rgba(255,255,255,0.12)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.14)",
        }}
      >
        <AppText className="text-[13px] font-cairo-bold text-white">
          {currentIndex + 1} / {images.length}
        </AppText>
      </View>
    </View>
  );
}
