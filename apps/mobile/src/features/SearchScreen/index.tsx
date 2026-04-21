import React, { useMemo } from "react";
import { ArrowLeft, Search, SlidersHorizontal, Sparkles, X } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { SearchResultCard } from "@/features/SearchScreen/SearchResultCard";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import { cn } from "@/lib/cn";
import { buildSearchRouteParams, parseSearchRouteParams } from "@/lib/mobileSearch";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";
import type { MobileProperty } from "@/types/mobile";

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { dictionary, isRtl } = useMobileLocale();
  const params = useLocalSearchParams<{
    threadId?: string;
    sourcePropertyId?: string;
    searchSummary?: string;
    searchQuery?: string;
    searchArea?: string;
    searchOwnerType?: string;
  }>();
  const searchContext = useMemo(
    () => parseSearchRouteParams(params),
    [params.searchArea, params.searchOwnerType, params.searchQuery, params.searchSummary, params.sourcePropertyId, params.threadId],
  );
  const search = usePropertySearch(searchContext);

  function openFilters() {
    router.push({
      pathname: "/search/filters",
      params: {
        area: search.selectedArea,
        ownerType: search.selectedOwnerType,
        ...buildSearchRouteParams(searchContext),
      },
    });
  }

  function openProperty(property: MobileProperty) {
    router.push({
      pathname: "/property/[id]",
      params: {
        id: property.id,
        ...buildSearchRouteParams(searchContext),
      },
    });
  }

  function takeAction(property: MobileProperty) {
    router.push({
      pathname: "/",
      params: {
        propertyId: property.id,
        ...(searchContext?.threadId ? { threadId: searchContext.threadId } : {}),
      },
    });
  }

  function continueToAssistant() {
    router.push({
      pathname: "/",
      params: {
        ...(searchContext?.threadId ? { threadId: searchContext.threadId } : {}),
        ...(searchContext?.sourcePropertyId ? { propertyId: searchContext.sourcePropertyId } : {}),
      },
    });
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.borderStrong}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        centerSlot={
          <View className="relative flex-1">
            <TextInput
              value={search.query}
              onChangeText={search.setQuery}
              placeholder={dictionary.search.smartPlaceholder}
              placeholderTextColor={theme.colors.inkMuted}
              cursorColor={theme.colors.primary}
              className={cn("h-11 w-full px-10 font-cairo-bold text-[14px]", isRtl ? "text-right" : "text-left")}
              style={{
                borderRadius: theme.radii.pill,
                borderWidth: 1,
                borderColor: search.query.startsWith("/") ? theme.colors.primary : theme.colors.border,
                backgroundColor: theme.colors.surfaceMuted,
                color: theme.colors.ink,
              }}
            />
            <View className={cn("absolute top-0 h-full items-center justify-center", isRtl ? "left-3" : "right-3")}>
              {search.query.startsWith("/") ? (
                <Sparkles size={16} color={theme.colors.primary} />
              ) : (
                <Search size={16} color={theme.colors.inkMuted} />
              )}
            </View>
            {search.query.length > 0 ? (
              <Pressable
                onPress={() => search.setQuery("")}
                className={cn("absolute top-0 h-full items-center justify-center", isRtl ? "right-3" : "left-3")}
              >
                <X size={16} color={theme.colors.inkMuted} />
              </Pressable>
            ) : null}
          </View>
        }
        trailing={<IconButton icon={SlidersHorizontal} onPress={openFilters} tone="panel" />}
      />

      <View className="flex-1 px-5 pt-6">
        <View className={cn("mb-4 items-center justify-between", isRtl ? "flex-row-reverse" : "flex-row")}>
          <View className={cn("items-center gap-2", isRtl ? "flex-row-reverse" : "flex-row")}>
            <AppText className={cn("text-[22px] font-cairo-bold", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.ink }}>
              {searchContext ? dictionary.search.suggestedResultsTitle : dictionary.search.resultsTitle}
            </AppText>
            <View 
              className="px-2 py-0.5 rounded-full" 
              style={{ backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border }}
            >
              <AppText className="text-[12px] font-bold" style={{ color: theme.colors.inkMuted }}>
                {search.results.length}
              </AppText>
            </View>
          </View>
          
          {searchContext ? (
            <Pressable onPress={continueToAssistant} className={cn("items-center gap-1.5 opacity-80", isRtl ? "flex-row-reverse" : "flex-row")}>
              <Sparkles size={14} color={theme.colors.primary} />
              <AppText className="text-[13px] font-cairo-bold" style={{ color: theme.colors.primary }}>{dictionary.search.continueInChat}</AppText>
            </Pressable>
          ) : null}
        </View>

        <View className="flex-1" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <FlashList
            data={search.results}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 72 }}
            renderItem={({ item }) => (
              <View className="mb-4">
                <SearchResultCard
                  property={item}
                  onOpenDetails={openProperty}
                  onTakeAction={takeAction}
                  ambientBackgroundColor={theme.colors.canvas}
                />
              </View>
            )}
            ListEmptyComponent={
              <MobileSurface tone="muted" radius="hero" className="items-center px-8 py-16">
                <View
                  className="mb-5 items-center justify-center rounded-full"
                  style={{
                    width: 64,
                    height: 64,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Search size={24} color={theme.colors.inkSoft} />
                </View>
                <AppText className="text-center text-xl font-cairo-bold" style={{ color: theme.colors.ink }}>
                  {dictionary.search.noResultsTitle}
                </AppText>
                <AppText className="mt-2 text-center text-[14px] font-medium" style={{ color: theme.colors.inkSoft }}>
                  {dictionary.search.noResultsBody}
                </AppText>
              </MobileSurface>
            }
          />
        </View>
      </View>
    </View>
  );
}
