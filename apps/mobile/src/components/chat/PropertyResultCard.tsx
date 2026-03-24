import type { ReactNode } from "react";
import { Image } from "expo-image";
import { BadgeCheck, Bath, BedDouble, Building2, MapPin, Ruler } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { formatCurrency } from "@/lib/mvp/formatters";
import { AppText } from "@/components/ui/AppText";
import type { PropertyPreview } from "@/types/chat";

type PropertyResultCardProps = {
  property: PropertyPreview;
  onPress: (property: PropertyPreview) => void;
};

/**
 * WHY:   Buyers need one reusable property card across chat, search, and fallback states.
 * WHAT:  Renders a compact property preview with image, price, specs, and trust cues.
 * HOW:   Uses cached images, a strict border shell, and concise metadata to keep scanning fast.
 */
export function PropertyResultCard({ property, onPress }: PropertyResultCardProps) {
  return (
    <Pressable
      className="overflow-hidden border border-line bg-white"
      onPress={() => onPress(property)}
    >
      <Image
        source={property.heroImage}
        style={{ width: "100%", height: 184 }}
        contentFit="cover"
        transition={120}
      />
      <View className="gap-3 px-4 py-4">
        <View className="flex-row-reverse items-start justify-between gap-3">
          <View className="flex-1">
            <AppText tone="headline" className="text-lg leading-7">
              {property.title}
            </AppText>
            <View className="mt-1 flex-row-reverse items-center gap-1">
              <MapPin size={14} color="#64748B" />
              <AppText className="text-xs text-muted">{property.area}، {property.city}</AppText>
            </View>
          </View>
          <View className="items-end">
            <AppText tone="headline" className="text-base text-brand">
              {formatCurrency(property.price)}
            </AppText>
            <AppText className="text-xs text-muted">جاهزة للمعاينة</AppText>
          </View>
        </View>

        <AppText className="text-sm leading-6 text-muted">{property.summary}</AppText>

        <View className="flex-row-reverse items-center justify-between border-t border-line pt-3">
          <View className="flex-row-reverse items-center gap-3">
            <Fact icon={<BedDouble size={14} color="#64748B" />} text={`${property.beds} غرف`} />
            <Fact icon={<Bath size={14} color="#64748B" />} text={`${property.baths} حمامات`} />
            <Fact icon={<Ruler size={14} color="#64748B" />} text={`${property.sqft} قدم`} />
          </View>
          <View className="flex-row-reverse items-center gap-1">
            {property.isVerified ? <BadgeCheck size={14} color="#2563EB" /> : <Building2 size={14} color="#64748B" />}
            <AppText className="text-xs text-muted">{property.ownerName}</AppText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function Fact({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <View className="flex-row-reverse items-center gap-1">
      {icon}
      <AppText className="text-xs text-muted">{text}</AppText>
    </View>
  );
}
