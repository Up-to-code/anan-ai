import { useState } from "react";
import { ArrowRight, Check } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileSectionHeading, MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { getPropertyLocationLabel } from "@/lib/mobileData";
import { buildSearchRouteParams, parseSearchRouteParams } from "@/lib/mobileSearch";
import { useAppTheme } from "@/lib/mobileTheme";

const ALL_FILTER = "الكل";

/**
 * WHY:   Search filters need a dedicated mobile sheet-style screen without bloating the Expo route file.
 * WHAT:  Renders the buyer search filter picker for area and owner type.
 * HOW:   Builds the available area options from the current property feed, keeps selection local, and writes the chosen params back into the search route.
 */
export default function SearchFiltersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const params = useLocalSearchParams<{
    area?: string;
    ownerType?: string;
    threadId?: string;
    sourcePropertyId?: string;
    searchSummary?: string;
    searchQuery?: string;
    searchArea?: string;
    searchOwnerType?: string;
  }>();
  const searchContext = parseSearchRouteParams(params);

  const feed = usePropertyFeed();
  const areas = [ALL_FILTER, ...new Set(feed.properties.map((property) => getPropertyLocationLabel(property)))];
  const ownerTypes = [ALL_FILTER, "وسيط", "مطور"];

  const [selectedArea, setSelectedArea] = useState(params.area ?? ALL_FILTER);
  const [selectedOwnerType, setSelectedOwnerType] = useState(params.ownerType ?? ALL_FILTER);

  function applyFilters() {
    router.replace({
      pathname: "/search",
      params: {
        ...buildSearchRouteParams(searchContext),
        searchArea: selectedArea,
        searchOwnerType: selectedOwnerType,
      },
    });
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        title="فلاتر البحث"
        subtitle="اختيارات سريعة داخل نفس الرحلة"
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.border}
        leading={<IconButton icon={ArrowRight} onPress={() => router.back()} tone="panel" />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.gutter,
          paddingTop: theme.spacing.gutter,
          paddingBottom: Math.max(insets.bottom, 20) + 108,
          gap: theme.spacing.section,
        }}
      >
        <MobileSurface tone="muted" radius="hero" className="gap-5">
          <MobileSectionHeading
            eyebrow="تخصيص النتائج"
            title="اختَر ما تريد رؤيته"
            description="غيّر المنطقة أو نوع الجهة ثم ارجع مباشرة إلى النتائج بدون فقدان سياق البحث الحالي."
          />
        </MobileSurface>

        <FilterSection
          title="المنطقة"
          options={areas}
          selectedValue={selectedArea}
          onSelect={setSelectedArea}
        />

        <FilterSection
          title="نوع الجهة"
          options={ownerTypes}
          selectedValue={selectedOwnerType}
          onSelect={setSelectedOwnerType}
        />
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 px-5 pt-4"
        style={{
          paddingBottom: Math.max(insets.bottom, 20),
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.canvas,
        }}
      >
        <Pressable
          onPress={applyFilters}
          className="h-14 items-center justify-center"
          style={{
            borderRadius: theme.radii.panel,
            backgroundColor: theme.colors.primary,
          }}
        >
          <AppText className="text-[16px] font-cairo-bold text-white">عرض النتائج</AppText>
        </Pressable>
      </View>
    </View>
  );
}

function FilterSection({
  title,
  options,
  selectedValue,
  onSelect,
}: {
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  const theme = useAppTheme();

  return (
    <MobileSurface radius="hero" className="gap-4">
      <AppText className="text-right text-[18px] font-cairo-bold" style={{ color: theme.colors.ink }}>
        {title}
      </AppText>

      <View className="gap-2">
        {options.map((option) => {
          const isSelected = option === selectedValue;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              className="h-12 flex-row-reverse items-center justify-between px-4"
              style={{
                borderRadius: theme.radii.card,
                borderWidth: 1,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                backgroundColor: isSelected ? theme.colors.primarySoft : theme.colors.surfaceMuted,
              }}
            >
              <AppText
                className="text-right font-cairo-bold"
                style={{ color: isSelected ? theme.colors.primary : theme.colors.ink, fontSize: 15 }}
              >
                {option}
              </AppText>
              {isSelected ? <Check size={18} color={theme.colors.primary} strokeWidth={3} /> : <View style={{ width: 18, height: 18 }} />}
            </Pressable>
          );
        })}
      </View>
    </MobileSurface>
  );
}
