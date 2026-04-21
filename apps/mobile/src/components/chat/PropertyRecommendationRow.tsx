import React, { memo, useMemo } from "react";
import { View, Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { MobilePropertyCard, type MobilePropertyCardVariant } from "@/components/property/MobilePropertyCard";
import { AppText } from "@/components/ui/AppText";
import { useMobileLocale } from "@/lib/mobileLocale";
import { getMobileShadow, useAppTheme } from "@/lib/mobileTheme";
import type { MobileProperty } from "@/types/mobile";

type PropertyRecommendationRowProps = {
  properties: MobileProperty[];
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  onShowMore?: () => void;
  ambientBackgroundColor?: string;
  cardVariant?: MobilePropertyCardVariant;
  selectionEnabled?: boolean;
  selectedPropertyIds?: string[];
  onAddPropertyToSelection?: (property: MobileProperty) => void;
};

/**
 * WHY:   Assistant shortlist rows should reuse one shared list wrapper even when individual card layouts differ by surface.
 * WHAT:  Renders a vertical preview list of property cards with an optional "Show more" action.
 * HOW:   Limits the inline preview count, forwards the requested card variant, and keeps the CTA treatment consistent across assistant renderers.
 */
export const PropertyRecommendationRow = memo(function PropertyRecommendationRow({
  properties,
  onPropertyPress,
  onOpenProperty,
  onOpenGallery,
  onShowMore,
  ambientBackgroundColor,
  cardVariant = "compact",
  selectionEnabled = false,
  selectedPropertyIds = [],
  onAddPropertyToSelection,
}: PropertyRecommendationRowProps) {
  const theme = useAppTheme();
  const { dictionary, isRtl, locale } = useMobileLocale();
  const selectedActionLabel = locale === "en" ? "Selected" : "تم الاختيار";

  const displayProperties = useMemo(() => properties.slice(0, 2), [properties]);

  return (
    <View className="w-full gap-5">
      <View className="gap-4">
        {displayProperties.map((property) => (
          <MobilePropertyCard
            key={property.id}
            variant={cardVariant}
            property={property}
            onPress={onOpenProperty ?? onPropertyPress}
            onActionPress={selectionEnabled ? onAddPropertyToSelection : onPropertyPress}
            actionDisabled={selectionEnabled && selectedPropertyIds.includes(property.id)}
            onOpenGallery={onOpenGallery}
            actionLabel={
              selectionEnabled
                ? selectedPropertyIds.includes(property.id)
                  ? selectedActionLabel
                  : dictionary.assistant.selectProperty
                : dictionary.common.continue
            }
            ambientBackgroundColor={ambientBackgroundColor}
          />
        ))}
      </View>

      {properties.length > 2 && (
        <View className="items-center">
          <Pressable
            className={`items-center justify-center px-8 py-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
            style={({ pressed }) => ({
              borderRadius: theme.radii.pill,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              transform: [{ scale: pressed ? 0.96 : 1 }],
              ...getMobileShadow("card")
            })}
            onPress={onShowMore}
          >
            <AppText className={`font-cairo-bold text-[14px] ${isRtl ? "ml-2" : "mr-2"}`} style={{ color: theme.colors.ink }}>
              {locale === "en" ? `Show all results (${properties.length})` : `عرض كافة النتائج (${properties.length})`}
            </AppText>
            <ChevronLeft size={16} color={theme.colors.ink} />
          </Pressable>
        </View>
      )}
    </View>
  );
});
