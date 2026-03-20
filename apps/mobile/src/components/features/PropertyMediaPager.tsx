import { Image } from "expo-image";
import { ResizeMode, Video } from "expo-av";
import { useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";

const CARD_WIDTH = Dimensions.get("window").width - 48; // account for message padding

type PropertyMediaPagerProps = {
  media: string[];
  width?: number;
};

function MediaSlide({
  uri,
  mediaWidth,
  shouldPlay,
}: {
  uri: string;
  mediaWidth: number;
  shouldPlay: boolean;
}) {
  const isVideo = /\.(mp4|m4v|mov|webm)(\?.*)?$/i.test(uri);
  return (
    <View style={{ width: mediaWidth, height: mediaWidth * 0.65 }} className="overflow-hidden bg-black">
      {isVideo ? (
        <Video
          source={{ uri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode={ResizeMode.COVER}
          shouldPlay={shouldPlay}
          isLooping
          isMuted
        />
      ) : (
        <Image source={uri} contentFit="cover" className="h-full w-full" />
      )}
    </View>
  );
}

function PagerDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  if (count <= 1) return null;
  return (
    <View className="mt-2 flex-row justify-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className={`h-1 rounded-full ${i === activeIndex ? "w-4 bg-brand" : "w-2 bg-slate-300"}`}
        />
      ))}
    </View>
  );
}

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
        {media.map((uri, i) => (
          <MediaSlide key={i} uri={uri} mediaWidth={mediaWidth} shouldPlay={i === activeIndex} />
        ))}
      </ScrollView>
      <PagerDots count={media.length} activeIndex={activeIndex} />
    </View>
  );
}
