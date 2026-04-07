import { useEffect, useMemo, useRef } from "react";
import { FlatList, ListRenderItemInfo, Pressable, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";

type GalleryViewportProps = {
  images: string[];
  currentIndex: number;
  initialIndex: number;
  onIndexChange: (index: number) => void;
  viewportHeight?: number;
  viewportWidth?: number;
  contentFit?: "cover" | "contain";
  backgroundColor?: string;
  onPressImage?: (index: number) => void;
};

/**
 * WHY:   The gallery needs one immersive media stage that behaves like a native photo viewer.
 * WHAT:  Renders a paged horizontal image viewport and reports the currently visible slide.
 * HOW:   Uses a horizontal FlatList with paging enabled, scrolls to the requested index, and updates selection when the page settles.
 */
export function GalleryViewport({
  images,
  currentIndex,
  initialIndex,
  onIndexChange,
  viewportHeight,
  viewportWidth,
  contentFit = "cover",
  backgroundColor = "transparent",
  onPressImage,
}: GalleryViewportProps) {
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<string> | null>(null);
  const itemWidth = Math.max(viewportWidth ?? width, 1);
  const imageHeight = viewportHeight ?? Math.min(Math.max(height * 0.5, 320), 520);
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

  function renderItem({ item, index }: ListRenderItemInfo<string>) {
    const imageNode = (
      <View
        style={{
          width: itemWidth,
          height: imageHeight,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor,
        }}
      >
        <Image
          source={item}
          style={{ width: itemWidth, height: imageHeight }}
          contentFit={contentFit}
          transition={180}
        />
      </View>
    );

    if (!onPressImage) {
      return imageNode;
    }

    return (
      <Pressable onPress={() => onPressImage(index)}>
        {imageNode}
      </Pressable>
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
