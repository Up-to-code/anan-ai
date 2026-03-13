import { Image } from "expo-image";
import { ResizeMode, Video } from "expo-av";
import { useRef, useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";

const CARD_WIDTH = Dimensions.get("window").width - 48; // account for message padding

type PropertyMediaPagerProps = {
  media: string[];
  width?: number;
};

/**
 * Swipeable horizontal media carousel. Edge-to-edge within its container.
 * Dots at bottom for orientation. Simple horizontal ScrollView with paging.
 */
export function PropertyMediaPager({ media, width }: PropertyMediaPagerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const mediaWidth = width ?? CARD_WIDTH;

  if (!media.length) return null;

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / mediaWidth);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={mediaWidth}
      >
        {media.map((uri, i) => {
          const isVideo = /\.(mp4|m4v|mov|webm)(\?.*)?$/i.test(uri);
          return (
            <View key={i} style={{ width: mediaWidth, height: mediaWidth * 0.65 }} className="bg-black overflow-hidden">
              {isVideo ? (
                <Video
                  source={{ uri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={i === activeIndex}
                  isLooping
                  isMuted
                />
              ) : (
                <Image source={uri} contentFit="cover" className="h-full w-full" />
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Dot indicators */}
      {media.length > 1 ? (
        <View className="flex-row justify-center gap-1 mt-2">
          {media.map((_, i) => (
            <View
              key={i}
              className={`h-1 rounded-full ${i === activeIndex ? "w-4 bg-brand" : "w-2 bg-slate-300"}`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
