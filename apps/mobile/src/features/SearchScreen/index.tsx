import { useMemo } from "react";
import { ArrowLeft, Search, Sparkles, X } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Pressable, TextInput, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobilePill, MobileSectionHeading, MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { SearchResultCard } from "@/features/SearchScreen/SearchResultCard";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import { buildSearchRouteParams, parseSearchRouteParams } from "@/lib/mobileSearch";
import { mobileTheme } from "@/lib/mobileTheme";
import type { MobileProperty } from "@/types/mobile";

/**
 * WHY:   Search should feel like a normal listing results page even when it is opened from the assistant.
 * WHAT:  Renders a query-aware mobile search screen with a top search field, flat filter rows, and assistant-aligned result items.
 * HOW:   Hydrates from assistant route context when present and preserves that context when opening properties or returning to chat.
 */
export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
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
  const sourceProperty = searchContext?.sourcePropertyId ? search.findPropertyById(searchContext.sourcePropertyId) : null;
  const screenBackground = isDark ? "#0B0C10" : mobileTheme.colors.canvas;
  const sectionBackground = isDark ? "#151821" : "#FFFFFF";
  const mutedSectionBackground = isDark ? "#111318" : "#F3F4F6";

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
    router.replace({
      pathname: "/",
      params: {
        ...(searchContext?.threadId ? { threadId: searchContext.threadId } : {}),
        ...(searchContext?.sourcePropertyId ? { propertyId: searchContext.sourcePropertyId } : {}),
      },
    });
  }

  return (
    <View className="flex-1" style={{ backgroundColor: screenBackground }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={screenBackground}
        borderColor={isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.borderStrong}
        title="البحث"
        subtitle={searchContext ? "مرتبط بطلب المحادثة الحالي" : "نتائج السوق"}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone={isDark ? "inversePanel" : "panel"} />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <View className="px-5 pb-4 pt-5">
        <View>
          <View className="relative">
            <TextInput
              value={search.query}
              onChangeText={search.setQuery}
              placeholder="ابحث عن شقة أو منطقة أو مدينة"
              placeholderTextColor={mobileTheme.colors.inkMuted}
              cursorColor={mobileTheme.colors.primary}
              className="h-14 w-full px-12 text-right font-cairo-medium text-[15px] text-slate-900"
              style={{
                borderRadius: 22,
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.border,
                backgroundColor: mutedSectionBackground,
              }}
            />
            <View className="absolute left-4 top-0 h-full items-center justify-center">
              <Search size={18} color={mobileTheme.colors.inkMuted} />
            </View>
            {search.query.length > 0 ? (
              <Pressable
                onPress={() => search.setQuery("")}
                className="absolute right-4 top-0 h-full items-center justify-center"
              >
                <X size={18} color={mobileTheme.colors.inkMuted} />
              </Pressable>
            ) : null}
          </View>

          {searchContext ? (
            <AssistantQueryBar summary={searchContext.searchSummary} sourcePropertyTitle={sourceProperty?.title} onContinueToAssistant={continueToAssistant} />
          ) : (
            <View className="mt-4">
              <MobileSectionHeading
                eyebrow="MARKET SEARCH"
                title="صفحة بحث عادية"
                description="ابحث، صفّ النتائج، ثم افتح العقار أو ارجع إلى المساعد وقتما تريد."
              />
            </View>
          )}

          <View className="mt-5 gap-4">
            <FilterRow
              title="المنطقة"
              values={search.areas}
              selectedValue={search.selectedArea}
              onSelect={search.setSelectedArea}
            />
            <FilterRow
              title="نوع الجهة"
              values={search.ownerTypes}
              selectedValue={search.selectedOwnerType}
              onSelect={search.setSelectedOwnerType}
            />
          </View>
        </View>
      </View>

      <View className="flex-1 px-5 pt-2">
        <View className="mb-5 flex-row-reverse items-end justify-between">
          <View>
            <AppText className="text-right text-[28px] font-cairo-black text-slate-900">
              {searchContext ? "نتائج مرتبطة بالمحادثة" : "نتائج البحث"}
            </AppText>
            <AppText className="mt-1 text-right text-[14px] font-medium text-slate-500">
              {search.results.length} عقار
            </AppText>
          </View>
          {searchContext ? (
            <MobilePill label="العودة للمحادثة" tone="teal" active onPress={continueToAssistant} />
          ) : null}
        </View>

        <FlashList
          data={search.results}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 72 }}
          renderItem={({ item }) => (
            <View className="mb-5">
              <SearchResultCard
                property={item}
                onOpenDetails={openProperty}
                onTakeAction={takeAction}
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
                  backgroundColor: mobileTheme.colors.surface,
                }}
              >
                <Search size={24} color="#94A3B8" />
              </View>
              <AppText className="text-center text-xl font-cairo-black text-slate-900">
                لا توجد نتائج مطابقة
              </AppText>
              <AppText className="mt-3 max-w-[260px] text-center text-[15px] font-medium leading-relaxed text-slate-500">
                عدّل المنطقة أو النص حتى نعرض خيارات أقرب لطلبك.
              </AppText>
            </MobileSurface>
          }
        />
      </View>
    </View>
  );
}

function AssistantQueryBar({
  summary,
  sourcePropertyTitle,
  onContinueToAssistant,
}: {
  summary: string;
  sourcePropertyTitle?: string;
  onContinueToAssistant: () => void;
}) {
  return (
    <View
      className="mt-4 flex-row-reverse items-center justify-between gap-3 px-1 pb-2"
      style={{ borderBottomWidth: 1, borderBottomColor: mobileTheme.colors.border }}
    >
      <View className="flex-row-reverse items-center gap-2">
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 30, height: 30, backgroundColor: mobileTheme.colors.primarySoft }}
        >
          <Sparkles size={15} color={mobileTheme.colors.primary} />
        </View>
        <View className="items-end">
          <AppText className="text-right text-[14px] font-cairo-black text-slate-900">نتائج مرتبطة بالمحادثة</AppText>
          <AppText className="text-right text-[12px] font-bold text-slate-500" numberOfLines={1}>
            {sourcePropertyTitle ? `${summary} - ${sourcePropertyTitle}` : summary}
          </AppText>
        </View>
      </View>
      <MobilePill label="العودة للمحادثة" tone="teal" active onPress={onContinueToAssistant} />
    </View>
  );
}

function FilterRow({
  title,
  values,
  selectedValue,
  onSelect,
}: {
  title: string;
  values: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={{ direction: "rtl" }}>
      <AppText className="mb-3 text-right text-[14px] font-cairo-black text-slate-900">{title}</AppText>
      <FlashList
        horizontal
        data={values}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        // @ts-ignore
        inverted={true}
        renderItem={({ item }) => {
          const selected = item === selectedValue;
          return (
            <View className="ml-3">
              <MobilePill
                label={item}
                tone={selected ? "teal" : "default"}
                active={selected}
                onPress={() => onSelect(item)}
              />
            </View>
          );
        }}
      />
    </View>
  );
}
