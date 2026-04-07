import React from "react";
import { View, Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { MobilePropertyCard, type MobilePropertyCardVariant } from "@/components/property/MobilePropertyCard";
import { AppText } from "@/components/ui/AppText";
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
};

/**
 * WHY:   Assistant shortlist rows should reuse one shared list wrapper even when individual card layouts differ by surface.
 * WHAT:  Renders a vertical preview list of property cards with an optional "Show more" action.
 * HOW:   Limits the inline preview count, forwards the requested card variant, and keeps the CTA treatment consistent across assistant renderers.
 */
export function PropertyRecommendationRow({
  properties,
  onPropertyPress,
  onOpenProperty,
  onOpenGallery,
  onShowMore,
  ambientBackgroundColor,
  cardVariant = "compact",
}: PropertyRecommendationRowProps) {
  const theme = useAppTheme();

  if (properties.length === 0) return null;

  const displayProperties = properties.slice(0, 2);

  return (
    <View className="w-full gap-5">
      <View className="gap-4">
        {displayProperties.map((property) => (
          <MobilePropertyCard
            key={property.id}
            variant={cardVariant}
            property={property}
            onPress={onOpenProperty ?? onPropertyPress}
            onActionPress={onPropertyPress}
            onOpenGallery={onOpenGallery}
            actionLabel="متابعة"
            ambientBackgroundColor={ambientBackgroundColor}
          />
        ))}
      </View>

      {properties.length > 2 && (
        <View className="items-center">
          <Pressable
            className="flex-row-reverse items-center justify-center px-8 py-3"
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
            <AppText className="font-cairo-bold text-[14px] ml-2" style={{ color: theme.colors.ink }}>
              عرض كافة النتائج ({properties.length})
            </AppText>
            <ChevronLeft size={16} color={theme.colors.ink} />
          </Pressable>
        </View>
      )}
    </View>
  );
}
