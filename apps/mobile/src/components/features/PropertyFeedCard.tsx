import { Heart, Share2, MessageCircle } from "lucide-react-native";
import { View, Pressable } from "react-native";
import { PropertyMediaPager } from "@/components/features/PropertyMediaPager";
import { AppText } from "@/components/ui/AppText";
import { MobilePropertyFeedItem } from "@/types/mobile";

type PropertyFeedCardProps = {
  property: MobilePropertyFeedItem;
};

/**
 * Immersive TikTok-style property card. Media fills the screen edge-to-edge.
 * Text overlays directly on media with text shadows. No panels, no borders.
 */
export function PropertyFeedCard({ property }: PropertyFeedCardProps) {
  return (
    <View className="flex-1 bg-black">
      {/* Full-screen media */}
      <PropertyMediaPager media={property.media} />

      {/* Floating text overlay — bottom left */}
      <View className="absolute bottom-24 left-5 right-16 z-10">
        <AppText
          className="text-2xl font-cairo-bold text-white"
          numberOfLines={2}
          style={{ textShadowColor: "rgba(0,0,0,0.7)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}
        >
          {property.title}
        </AppText>
        <AppText
          className="mt-1 text-lg font-cairo-bold text-white"
          style={{ textShadowColor: "rgba(0,0,0,0.7)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}
        >
          {new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(property.price)}
        </AppText>
        <AppText
          className="mt-1 text-sm text-white/80"
          style={{ textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}
        >
          {property.area ?? property.location ?? property.address}
        </AppText>
        <AppText
          className="mt-1 text-xs text-white/60"
          style={{ textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}
        >
          {property.owner.name}
        </AppText>
      </View>

      {/* Floating action icons — right edge (TikTok style) */}
      <View className="absolute right-4 bottom-28 gap-6 items-center z-10">
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

      {/* Bottom dark gradient for text legibility */}
      <View className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t pointer-events-none"
        style={{ 
          backgroundColor: "transparent",
          // Using a simple opacity layer since RN doesn't support CSS gradients natively
        }}
      />
    </View>
  );
}
