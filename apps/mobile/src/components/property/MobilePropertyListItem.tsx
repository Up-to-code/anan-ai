import { Bath, BedDouble, Building2, ChevronLeft, MapPin, Ruler, User } from "lucide-react-native";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { formatCurrency } from "@/lib/formatters";
import { getPropertyHeroImage, getPropertyLocationLabel } from "@/lib/mobileData";
import { useMobileLayout } from "@/lib/mobileLayout";
import { mobileTheme } from "@/lib/mobileTheme";
import type { MobileProperty } from "@/types/mobile";

type MobilePropertyListItemProps = {
  property: MobileProperty;
  onPress: (property: MobileProperty) => void;
  onActionPress?: (property: MobileProperty) => void;
  actionLabel?: string;
  compact?: boolean;
};

/**
 * WHY:   Buyer screens need one clean property row pattern instead of re-creating heavy vertical cards in chat, search, and detail-linked sections.
 * WHAT:  Renders a responsive horizontal listing item with media, concise facts, and one compact secondary action.
 * HOW:   Uses a flat bordered row, a small owner/avatar badge over the image, and a single compact CTA while the whole row remains tappable.
 */
export function MobilePropertyListItem({
  property,
  onPress,
  onActionPress,
  actionLabel = "ابدأ من هنا",
  compact = false,
}: MobilePropertyListItemProps) {
  const layout = useMobileLayout();
  const imageWidth = compact ? (layout.isCompact ? 96 : 104) : layout.isCompact ? 112 : 120;
  const imageHeight = compact ? (layout.isCompact ? 104 : 112) : layout.isCompact ? 120 : 128;
  const titleSize = compact ? 16 : 17;
  const metaSize = compact ? 12 : 13;
  const priceSize = compact ? 17 : 19;
  const facts = [
    { label: `${property.beds}`, icon: <BedDouble size={13} color={mobileTheme.colors.inkMuted} /> },
    { label: `${property.baths}`, icon: <Bath size={13} color={mobileTheme.colors.inkMuted} /> },
    { label: `${property.sqft ?? 0} م`, icon: <Ruler size={13} color={mobileTheme.colors.inkMuted} /> },
  ];
  const OwnerIcon = property.owner.type === "broker" ? User : Building2;

  return (
    <Pressable
      onPress={() => onPress(property)}
      className="active:opacity-95"
      style={{
        borderRadius: compact ? 20 : 22,
        borderWidth: 1,
        borderColor: mobileTheme.colors.border,
        backgroundColor: mobileTheme.colors.surface,
      }}
    >
      <View
        className="flex-row items-start gap-3"
        style={{
          paddingHorizontal: compact ? 12 : 14,
          paddingVertical: compact ? 12 : 14,
        }}
      >
        <View>
          <View className="relative overflow-hidden" style={{ borderRadius: compact ? 16 : 18 }}>
            <Image
              source={getPropertyHeroImage(property)}
              style={{ width: imageWidth, height: imageHeight }}
              contentFit="cover"
              transition={140}
            />
            <View
              className="absolute left-2 top-2 items-center justify-center rounded-full"
              style={{
                width: compact ? 24 : 26,
                height: compact ? 24 : 26,
                backgroundColor: "rgba(255,255,255,0.96)",
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <OwnerIcon size={compact ? 12 : 13} color={mobileTheme.colors.primary} />
            </View>
          </View>
        </View>

        <View className="flex-1 items-end">
          <View className="w-full flex-row-reverse items-start justify-between gap-2">
            <ChevronLeft size={16} color={mobileTheme.colors.inkMuted} style={{ marginTop: 2 }} />
            <View className="flex-1 items-end">
              <AppText
                className="text-right font-cairo-black text-slate-950"
                style={{ fontSize: titleSize, lineHeight: compact ? 26 : 28 }}
                numberOfLines={2}
              >
                {property.title}
              </AppText>
              <AppText
                className="mt-1 text-right font-cairo-black text-slate-950"
                style={{ fontSize: priceSize, lineHeight: compact ? 24 : 26 }}
              >
                {formatCurrency(property.price)}
              </AppText>
            </View>
          </View>

          <View className="mt-2 w-full flex-row-reverse items-center gap-1.5">
            <MapPin size={13} color={mobileTheme.colors.primary} />
            <AppText
              className="flex-1 text-right font-bold text-slate-500"
              style={{ fontSize: metaSize, lineHeight: compact ? 18 : 20 }}
              numberOfLines={1}
            >
              {getPropertyLocationLabel(property)}
            </AppText>
          </View>

          <View className="mt-2 w-full flex-row-reverse flex-wrap items-center gap-x-3 gap-y-1.5">
            {facts.map((fact, index) => (
              <View key={`${property.id}-fact-${index}`} className="flex-row-reverse items-center gap-1">
                {fact.icon}
                <AppText className="text-[12px] font-cairo-black text-slate-600">{fact.label}</AppText>
              </View>
            ))}
          </View>

          {onActionPress ? (
            <View className="mt-3 w-full items-end">
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  onActionPress(property);
                }}
                className="items-center justify-center rounded-full px-4 py-2.5 active:opacity-90"
                style={{
                  borderWidth: 1,
                  borderColor: mobileTheme.colors.primaryMuted,
                  backgroundColor: mobileTheme.colors.primarySoft,
                }}
              >
                <AppText className="text-[12px] font-cairo-black text-blue-700">{actionLabel}</AppText>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
