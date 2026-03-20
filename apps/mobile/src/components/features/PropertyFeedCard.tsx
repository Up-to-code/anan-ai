import { Heart, Share2, MessageCircle } from "lucide-react-native";
import { View, Pressable } from "react-native";
import { PropertyMediaPager } from "@/components/features/PropertyMediaPager";
import { AppText } from "@/components/ui/AppText";
import { MobilePropertyFeedItem } from "@/types/mobile";

type PropertyFeedCardProps = {
  property: MobilePropertyFeedItem;
};

const overlayShadow = {
  textShadowColor: "rgba(0,0,0,0.7)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
} as const;

const subtleOverlayShadow = {
  textShadowColor: "rgba(0,0,0,0.5)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
} as const;

function formatPropertyPrice(price: number) {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(price);
}

function PropertyTextOverlay({ property }: PropertyFeedCardProps) {
  return (
    <View className="absolute bottom-24 left-5 right-16 z-10">
      <AppText className="text-2xl font-cairo-bold text-white" numberOfLines={2} style={overlayShadow}>
        {property.title}
      </AppText>
      <AppText className="mt-1 text-lg font-cairo-bold text-white" style={overlayShadow}>
        {formatPropertyPrice(property.price)}
      </AppText>
      <AppText className="mt-1 text-sm text-white/80" style={subtleOverlayShadow}>
        {property.area ?? property.location ?? property.address}
      </AppText>
      <AppText className="mt-1 text-xs text-white/60" style={subtleOverlayShadow}>
        {property.owner.name}
      </AppText>
    </View>
  );
}

function PropertyActionRail() {
  return (
    <View className="absolute right-4 bottom-28 z-10 items-center gap-6">
      <Pressable className="items-center">
        <Heart size={28} color="#FFFFFF" strokeWidth={1.5} />
      </Pressable>
      <Pressable className="items-center">
        <Share2 size={26} color="#FFFFFF" strokeWidth={1.5} />
      </Pressable>
      <Pressable className="items-center">
        <MessageCircle size={26} color="#FFFFFF" strokeWidth={1.5} />
      </Pressable>
    </View>
  );
}

function PropertyBottomOverlay() {
  return (
    <View
      className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t pointer-events-none"
      style={{ backgroundColor: "transparent" }}
    />
  );
}

/**
 * Immersive TikTok-style property card. Media fills the screen edge-to-edge.
 * Text overlays directly on media with text shadows. No panels, no borders.
 */
export function PropertyFeedCard({ property }: PropertyFeedCardProps) {
  return (
    <View className="flex-1 bg-black">
      <PropertyMediaPager media={property.media} />
      <PropertyTextOverlay property={property} />
      <PropertyActionRail />
      <PropertyBottomOverlay />
    </View>
  );
}
