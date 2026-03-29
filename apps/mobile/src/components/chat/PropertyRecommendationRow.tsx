import { ScrollView, View } from "react-native";
import { PropertyResultCard } from "@/components/chat/PropertyResultCard";
import type { MobileProperty } from "@/types/mobile";

type PropertyRecommendationRowProps = {
  properties: MobileProperty[];
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
};

/**
 * WHY:   Property recommendations should feel like a compact shortlist inside the conversation instead of a stacked listing feed.
 * WHAT:  Renders one horizontally scrollable row of recommendation cards sized for small phones.
 * HOW:   Reuses the shared property card primitive and applies RTL-friendly spacing inside a horizontal scroll view.
 */
export function PropertyRecommendationRow({
  properties,
  onPropertyPress,
  onOpenProperty,
}: PropertyRecommendationRowProps) {
  if (properties.length === 0) return null;

  return (
    <View className="w-full gap-3">
      {properties.map((property) => (
        <PropertyResultCard key={property.id} property={property} onPress={onPropertyPress} onOpenDetails={onOpenProperty} />
      ))}
    </View>
  );
}
