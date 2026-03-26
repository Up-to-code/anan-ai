import type { ReactNode } from "react";
import { Image } from "expo-image";
import { MapPin } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { formatCurrency } from "@/lib/mvp/formatters";
import { AppText } from "@/components/ui/AppText";
import type { PropertyPreview } from "@/types/chat";

type PropertyResultCardProps = {
  property: PropertyPreview;
  onPress: (property: PropertyPreview) => void;
};

/**
 * WHY:   The Nexus PropertyResultCard must look premium and distinct from standard listings.
 * WHAT:  Modernizes the card with rounded-3xl geometry, large typography, and integrated metadata.
 * HOW:   Uses rounded-[32px] for the container and Cairo-black for the title/price hierarchy.
 */
export function PropertyResultCard({ property, onPress }: PropertyResultCardProps) {
  return (
    <Pressable
      className="overflow-hidden py-4"
      onPress={() => onPress(property)}
    >
      <View className="relative">
        <Image
          source={property.heroImage}
          style={{ width: "100%", height: 180, borderRadius: 24 }}
          contentFit="cover"
          transition={200}
        />
      </View>

      <View className="gap-2 px-2 pt-4">
        <View className="flex-row-reverse items-start justify-between gap-4">
          <View className="flex-1">
            <AppText className="text-lg font-cairo-black text-slate-900 dark:text-slate-50 leading-7 text-right">
              {property.title}
            </AppText>
            <View className="mt-1 flex-row-reverse items-center gap-1.5">
              <MapPin size={14} color="#94A3B8" />
              <AppText className="text-[13px] font-bold text-slate-400 dark:text-slate-500">{property.area}، {property.city}</AppText>
            </View>
          </View>
          <View className="items-end">
            <AppText className="text-lg font-cairo-black text-primary">
              {formatCurrency(property.price)}
            </AppText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
