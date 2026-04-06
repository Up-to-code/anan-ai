import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, View, type LayoutChangeEvent } from "react-native";
import { Image } from "expo-image";
import { AppText } from "@/components/ui/AppText";
import { GalleryViewport } from "@/features/GalleryScreen/GalleryViewport";
import { useAppTheme } from "@/lib/mobileTheme";

type CursorPropertyMediaViewerProps = {
  images: string[];
  height: number;
  width?: number;
  borderRadius: number;
  backgroundColor?: string;
  showCounter?: boolean;
  overlay?: ReactNode;
  onOpenGallery?: (initialIndex: number) => void;
};

function clampIndex(index: number, imageCount: number) {
  if (imageCount <= 0) return 0;
  return Math.min(Math.max(index, 0), imageCount - 1);
}

/**
 * WHY:   Mobile cursor cards need one shared media viewer so chat-generated property cards can swipe images without inventing a second gallery pattern.
 * WHAT:  Renders an inline property media stage with local paging, an optional counter, and tap-to-open support for the fullscreen gallery.
 * HOW:   Reuses the shared gallery viewport when multiple images are available and falls back to a single static image when the media set is small or the layout width is still measuring.
 */
export function CursorPropertyMediaViewer({
  images,
  height,
  width,
  borderRadius,
  backgroundColor = "transparent",
  showCounter = true,
  overlay,
  onOpenGallery,
}: CursorPropertyMediaViewerProps) {
  const theme = useAppTheme();
  const media = images.length > 0 ? images : [""];
  const mediaKey = useMemo(() => media.join("|"), [media]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(width ?? null);
  const resolvedWidth = width ?? measuredWidth;
  const hasMultipleImages = media.length > 1;
  const shouldShowCounter = showCounter && hasMultipleImages;

  useEffect(() => {
    setCurrentIndex((previousIndex) => clampIndex(previousIndex, media.length));
  }, [media.length, mediaKey]);

  useEffect(() => {
    if (width !== undefined) {
      setMeasuredWidth(width);
    }
  }, [width]);

  function handleLayout(event: LayoutChangeEvent) {
    if (width !== undefined) return;
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (!nextWidth || nextWidth === measuredWidth) return;
    setMeasuredWidth(nextWidth);
  }

  const fallbackImage = media[currentIndex] || media[0];

  return (
    <View
      onLayout={handleLayout}
      style={{
        width: width ?? "100%",
        height,
        borderRadius,
        overflow: "hidden",
        backgroundColor,
        position: "relative",
      }}
    >
      {hasMultipleImages && resolvedWidth ? (
        <GalleryViewport
          key={`${mediaKey}-${resolvedWidth}`}
          images={media}
          currentIndex={currentIndex}
          initialIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          viewportHeight={height}
          viewportWidth={resolvedWidth}
          backgroundColor={backgroundColor}
          onPressImage={onOpenGallery}
        />
      ) : fallbackImage ? (
        onOpenGallery ? (
          <Pressable onPress={() => onOpenGallery(currentIndex)}>
            <Image source={fallbackImage} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={180} />
          </Pressable>
        ) : (
          <Image source={fallbackImage} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={180} />
        )
      ) : null}

      {shouldShowCounter ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            borderRadius: theme.radii.pill,
            backgroundColor: "rgba(9, 9, 11, 0.58)",
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <AppText className="text-[11px] font-cairo-bold text-white">
            {currentIndex + 1} / {media.length}
          </AppText>
        </View>
      ) : null}

      {overlay ? (
        <View pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
          {overlay}
        </View>
      ) : null}
    </View>
  );
}
