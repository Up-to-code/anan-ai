import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { PropertyMediaPager } from "@/components/features/PropertyMediaPager";
import { AppText } from "@/components/ui/AppText";
import { MobilePropertyFeedItem } from "@/types/mobile";
import { Heart, BedDouble, Bath, MapPin } from "lucide-react-native";

type PropertyChatCardProps = {
  property: MobilePropertyFeedItem;
  onPress?: () => void;
};

const SAR_PRICE_FORMATTER = new Intl.NumberFormat("en-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

function PropertyMetaItem({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string | number;
}) {
  return (
    <View className="flex-row items-center gap-1">
      {icon}
      <AppText className="text-xs text-slate-500">{value}</AppText>
    </View>
  );
}

/**
 * Rich property card rendered inside chat messages.
 * Shows swipeable media + key details. Tapping navigates to full property detail.
 */
export function PropertyChatCard({ property, onPress }: PropertyChatCardProps) {
  const router = useRouter();
  const handlePress = onPress ?? (() => router.push(`/property/${property.id}` as any));
  return (
    <Pressable onPress={handlePress} className="bg-white overflow-hidden" style={{ borderWidth: 0.5, borderColor: "#e2e8f0" }}>
      {/* Swipeable Media */}
      <PropertyMediaPager media={property.media} />

      {/* Details */}
      <View className="p-3 gap-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <AppText className="font-cairo-bold text-base text-slate-900" numberOfLines={2}>
              {property.title}
            </AppText>
          </View>
          <Heart size={18} color="#94a3b8" strokeWidth={1.5} />
        </View>

        <AppText className="text-lg font-cairo-bold text-brand">
          {SAR_PRICE_FORMATTER.format(property.price)}
        </AppText>

        <View className="flex-row items-center gap-3">
          <PropertyMetaItem icon={<MapPin size={12} color="#94a3b8" />} value={property.area ?? property.location} />
          <PropertyMetaItem icon={<BedDouble size={12} color="#94a3b8" />} value={property.beds} />
          <PropertyMetaItem icon={<Bath size={12} color="#94a3b8" />} value={property.baths} />
        </View>

        {property.owner.name ? (
          <AppText className="text-xs text-slate-400 mt-1">{property.owner.name}</AppText>
        ) : null}
      </View>
    </Pressable>
  );
}
