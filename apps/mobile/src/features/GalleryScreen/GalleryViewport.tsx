import { useEffect, useMemo, useRef } from "react";
import { FlatList, ListRenderItemInfo, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";

type GalleryViewportProps = {
  images: string[];
  currentIndex: number;
  initialIndex: number;
  onIndexChange: (index: number) => void;
};

/**
 * WHY:   The gallery needs one immersive media stage that behaves like a native photo viewer.
 * WHAT:  Renders a paged horizontal image viewport and reports the currently visible slide.
 * HOW:   Uses a horizontal FlatList with paging enabled, scrolls to the requested index, and updates selection when the page settles.
 */
export function GalleryViewport({ images, currentIndex, initialIndex, onIndexChange }: GalleryViewportProps) {
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<string> | null>(null);
  const itemWidth = Math.max(width, 1);
  const imageHeight = Math.min(Math.max(height * 0.5, 320), 520);
  const mountedPropertyKey = useMemo(() => images.join("|"), [images]);

  useEffect(() => {
    if (!listRef.current) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: initialIndex, animated: false });
    });
  }, [initialIndex, mountedPropertyKey]);

  useEffect(() => {
    if (!listRef.current) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: currentIndex, animated: true });
    });
  }, [currentIndex]);

  function renderItem({ item }: ListRenderItemInfo<string>) {
    return (
      <View style={{ width: itemWidth, alignItems: "center", justifyContent: "center" }}>
        <Image
          source={item}
          style={{ width: itemWidth, height: imageHeight }}
          contentFit="cover"
          transition={180}
        />
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={images}
      keyExtractor={(item, index) => `${item}-${index}`}
      horizontal
      pagingEnabled
      initialScrollIndex={initialIndex}
      showsHorizontalScrollIndicator={false}
      renderItem={renderItem}
      onMomentumScrollEnd={(event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const nextIndex = Math.round(offsetX / itemWidth);
        if (nextIndex !== currentIndex) {
          onIndexChange(nextIndex);
        }
      }}
      getItemLayout={(_, index) => ({
        length: itemWidth,
        offset: itemWidth * index,
        index,
      })}
      contentContainerStyle={{ alignItems: "center" }}
    />
  );
}
