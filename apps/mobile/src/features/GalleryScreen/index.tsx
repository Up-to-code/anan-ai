import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View, useColorScheme } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Images } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobilePill, MobileTopBar } from "@/components/ui/MobileChrome";
import { GalleryThumbnailRail } from "@/features/GalleryScreen/GalleryThumbnailRail";
import { GalleryViewport } from "@/features/GalleryScreen/GalleryViewport";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";
import { getPropertyLocationLabel } from "@/lib/mobileData";
import { buildSearchRouteParams, parseSearchRouteParams } from "@/lib/mobileSearch";
import { mobileTheme } from "@/lib/mobileTheme";

function clampInitialIndex(rawValue: string | undefined, imageCount: number) {
  const parsed = Number.parseInt(rawValue ?? "0", 10);
  if (!Number.isFinite(parsed)) return 0;
  if (imageCount <= 0) return 0;
  return Math.min(Math.max(parsed, 0), imageCount - 1);
}

/**
 * WHY:   The gallery should remain part of the same buyer workspace flow instead of switching into a boxed special mode.
 * WHAT:  Renders the gallery with a simple header, media-first viewport, slim thumbnail rail, and direct route links back to property or assistant.
 * HOW:   Keeps the selected image index synced to route context while minimizing surrounding framing and preserving search/assistant continuity.
 */
export default function GalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const params = useLocalSearchParams<{
    propertyId?: string;
    initialIndex?: string;
    threadId?: string;
    sourcePropertyId?: string;
    searchSummary?: string;
    searchQuery?: string;
    searchArea?: string;
    searchOwnerType?: string;
  }>();
  const searchContext = parseSearchRouteParams(params);
  const { property, isLoading } = usePropertyDetail(params.propertyId);
  const images = property?.media ?? [];
  const initialIndex = clampInitialIndex(params.initialIndex, images.length);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const screenBackground = isDark ? "#090A0C" : mobileTheme.colors.canvas;
  const dividerColor = isDark ? "rgba(255,255,255,0.10)" : mobileTheme.colors.border;
  const textPrimary = isDark ? "#F8FAFC" : mobileTheme.colors.ink;
  const textSecondary = isDark ? "#CBD5E1" : "#64748B";

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, params.propertyId]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: screenBackground }}>
        <ActivityIndicator size="large" color={mobileTheme.colors.primary} />
      </View>
    );
  }

  if (!property || images.length === 0) {
    return (
      <View className="flex-1 px-5" style={{ backgroundColor: screenBackground, paddingBottom: Math.max(insets.bottom, 20) }}>
        <MobileTopBar
          insetTop={insets.top}
          title="الصور"
          subtitle="لا توجد صور حالياً"
          backgroundColor={screenBackground}
          borderColor={dividerColor}
          leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone={isDark ? "inversePanel" : "panel"} />}
          trailing={<View style={{ width: 44, height: 44 }} />}
        />

        <View className="flex-1 items-center justify-center">
          <View className="items-center gap-4">
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 64, height: 64, backgroundColor: mobileTheme.colors.surfaceMuted }}
            >
              <Images size={28} color="#94A3B8" />
            </View>
            <AppText className="text-center text-[22px] font-cairo-black text-slate-900">الصور غير متاحة حالياً</AppText>
            <AppText className="max-w-[280px] text-center text-[15px] leading-8 text-slate-500">
              يمكنك الرجوع لتفاصيل العقار أو متابعة المحادثة في نفس السياق.
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: screenBackground }}>
      <MobileTopBar
        insetTop={insets.top}
        title="معرض الصور"
        subtitle={`${currentIndex + 1} / ${images.length}`}
        backgroundColor={screenBackground}
        borderColor={dividerColor}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone={isDark ? "inversePanel" : "panel"} />}
        trailing={searchContext ? <MobilePill label="النتائج" onPress={() => router.replace({ pathname: "/search", params: buildSearchRouteParams(searchContext) })} /> : <View style={{ width: 44, height: 44 }} />}
      />

      <View className="flex-1 px-5 pt-5">
        <View className="overflow-hidden rounded-[28px]">
          <GalleryViewport
            images={images}
            currentIndex={currentIndex}
            initialIndex={initialIndex}
            onIndexChange={setCurrentIndex}
          />
        </View>

        <View className="mt-5 flex-row-reverse items-start justify-between gap-4">
          <View className="flex-1">
            <AppText className="text-right text-[24px] font-cairo-black" style={{ color: textPrimary }}>
              {property.title}
            </AppText>
            <AppText className="mt-1 text-right text-[14px] font-bold" style={{ color: textSecondary }}>
              {getPropertyLocationLabel(property)}
            </AppText>
          </View>
          <MobilePill label={`${images.length} صور`} tone="primary" active />
        </View>

        <View className="my-5" style={{ height: 1, backgroundColor: dividerColor }} />

        <GalleryThumbnailRail
          images={images}
          activeIndex={currentIndex}
          onSelect={setCurrentIndex}
        />

        <View className="mt-6 flex-row-reverse gap-3">
          <Pressable
            onPress={() =>
              router.replace({
                pathname: "/property/[id]",
                params: {
                  id: property.id,
                  ...(params.threadId ? { threadId: params.threadId } : {}),
                  ...buildSearchRouteParams(searchContext),
                },
              })
            }
            className="flex-1 items-center justify-center rounded-full px-4 py-4 active:opacity-90"
            style={{ backgroundColor: mobileTheme.colors.dark }}
          >
            <AppText className="text-[14px] font-cairo-black text-white">تفاصيل العقار</AppText>
          </Pressable>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/",
                params: {
                  propertyId: property.id,
                  ...(params.threadId ? { threadId: params.threadId } : {}),
                },
              })
            }
            className="flex-1 items-center justify-center rounded-full px-4 py-4 active:opacity-90"
            style={{
              borderWidth: 1,
              borderColor: mobileTheme.colors.border,
              backgroundColor: mobileTheme.colors.surface,
            }}
          >
            <AppText className="text-[14px] font-cairo-black text-blue-700">المساعد</AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
