import { Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";

type GalleryThumbnailRailProps = {
  images: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

/**
 * WHY:   Buyers should be able to jump across images without losing context in the full-screen gallery.
 * WHAT:  Renders the compact thumbnail selector shown beneath the property summary.
 * HOW:   Uses a horizontal scroll rail with a brighter active state and passes the selected index back to the screen orchestrator.
 */
export function GalleryThumbnailRail({ images, activeIndex, onSelect }: GalleryThumbnailRailProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexDirection: "row-reverse", gap: 12 }}
    >
      {images.map((image, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={`${image}-${index}`}
            onPress={() => onSelect(index)}
            className={`overflow-hidden rounded-[20px] border ${isActive ? "border-white" : "border-white/10"} ${isActive ? "opacity-100" : "opacity-60"} active:opacity-100`}
          >
            <Image source={image} style={{ width: 72, height: 72 }} contentFit="cover" transition={120} />
            {isActive ? <View className="absolute inset-0 border border-white/40 rounded-[20px]" /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
