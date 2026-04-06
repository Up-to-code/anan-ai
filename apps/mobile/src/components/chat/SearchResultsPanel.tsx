import React from "react";
import { View, Pressable } from "react-native";
import { Compass, Sparkles, ChevronLeft } from "lucide-react-native";
import { MobilePropertyCard } from "@/components/property/MobilePropertyCard";
import { AppText } from "@/components/ui/AppText";
import { useAppTheme, getMobileShadow } from "@/lib/mobileTheme";
import type { MobileProperty, MobileSearchContext } from "@/types/mobile";

type SearchResultsPanelProps = {
  searchContext: MobileSearchContext;
  results: MobileProperty[];
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  onShowMore?: () => void;
  ambientBackgroundColor?: string;
};

export function SearchResultsPanel({
  searchContext,
  results,
  onPropertyPress,
  onOpenProperty,
  onOpenGallery,
  onShowMore,
  ambientBackgroundColor,
}: SearchResultsPanelProps) {
  const theme = useAppTheme();

  if (results.length === 0) return null;

  const displayResults = results.slice(0, 2);

  return (
    <View className="mt-5 gap-5">
      <View
        className="overflow-hidden"
        style={{
          borderRadius: theme.radii.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        }}
      >
        <View className="gap-3 px-4 py-4">
          <View className="flex-row-reverse items-center justify-between">
            <View className="flex-row-reverse items-center gap-2">
              <Sparkles size={16} color={theme.colors.accent} />
              <AppText responsiveRole="bodyStrong" className="font-cairo-bold" style={{ color: theme.colors.ink }}>
                نتائج موسّعة من نفس الطلب
              </AppText>
            </View>
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: theme.colors.surfaceMuted }}
            >
              <AppText responsiveRole="meta" className="font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
                {results.length} خيارات
              </AppText>
            </View>
          </View>

          <View className="flex-row-reverse items-start gap-2">
            <View
              className="mt-0.5 items-center justify-center rounded-full"
              style={{ width: 32, height: 32, backgroundColor: theme.colors.surfaceMuted }}
            >
              <Compass size={16} color={theme.colors.primary} />
            </View>
            <View className="flex-1">
              <AppText responsiveRole="body" className="font-medium text-right" style={{ color: theme.colors.inkMuted }}>
                {searchContext.searchSummary}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      <View className="gap-4">
        {displayResults.map((property) => (
          <MobilePropertyCard
            key={property.id}
            variant="compact"
            property={property}
            onPress={onOpenProperty ?? onPropertyPress}
            onActionPress={onPropertyPress}
            onOpenGallery={onOpenGallery}
            actionLabel="متابعة"
            ambientBackgroundColor={ambientBackgroundColor}
          />
        ))}
      </View>

      {results.length > 2 ? (
        <View className="items-center">
          <Pressable
            className="flex-row-reverse items-center justify-center px-8 py-3"
            style={({ pressed }) => ({
              borderRadius: theme.radii.pill,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              transform: [{ scale: pressed ? 0.96 : 1 }],
              ...getMobileShadow("card"),
            })}
            onPress={onShowMore}
          >
            <AppText className="ml-2 font-cairo-bold text-[14px]" style={{ color: theme.colors.ink }}>
              عرض كافة النتائج ({results.length})
            </AppText>
            <ChevronLeft size={16} color={theme.colors.ink} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
