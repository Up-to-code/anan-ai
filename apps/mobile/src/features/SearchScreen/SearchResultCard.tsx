import { MobilePropertyCard } from "@/components/property/MobilePropertyCard";
import { useMobileLocale } from "@/lib/mobileLocale";
import type { MobileProperty } from "@/types/mobile";

type SearchResultCardProps = {
  property: MobileProperty;
  onOpenDetails: (property: MobileProperty) => void;
  onTakeAction: (property: MobileProperty) => void;
  ambientBackgroundColor?: string;
};

/**
 * WHY:   Search results should match the same lightweight shortlist pattern that users already saw inside the assistant.
 * WHAT:  Renders one search listing as a clean horizontal property row.
 * HOW:   Delegates to the shared mobile property list item so chat and search stay visually aligned while keeping screen-specific callbacks.
 */
export function SearchResultCard({ property, onOpenDetails, onTakeAction, ambientBackgroundColor }: SearchResultCardProps) {
  const { dictionary } = useMobileLocale();
  return (
    <MobilePropertyCard
      variant="compact"
      property={property}
      onPress={onOpenDetails}
      onActionPress={onTakeAction}
      actionLabel={dictionary.search.continueInChat}
      ambientBackgroundColor={ambientBackgroundColor}
    />
  );
}
