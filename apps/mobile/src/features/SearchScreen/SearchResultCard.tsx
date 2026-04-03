import { MobilePropertyListItem } from "@/components/property/MobilePropertyListItem";
import type { MobileProperty } from "@/types/mobile";

type SearchResultCardProps = {
  property: MobileProperty;
  onOpenDetails: (property: MobileProperty) => void;
  onTakeAction: (property: MobileProperty) => void;
};

/**
 * WHY:   Search results should match the same lightweight shortlist pattern that users already saw inside the assistant.
 * WHAT:  Renders one search listing as a clean horizontal property row.
 * HOW:   Delegates to the shared mobile property list item so chat and search stay visually aligned while keeping screen-specific callbacks.
 */
export function SearchResultCard({ property, onOpenDetails, onTakeAction }: SearchResultCardProps) {
  return (
    <MobilePropertyListItem
      property={property}
      onPress={onOpenDetails}
      onActionPress={onTakeAction}
      actionLabel="ابدأ من هذا العقار"
    />
  );
}
