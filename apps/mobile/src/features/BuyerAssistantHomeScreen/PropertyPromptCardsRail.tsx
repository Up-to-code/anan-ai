import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Scale3d, X } from "lucide-react-native";
import { CursorPropertyMediaViewer } from "@/components/property/CursorPropertyMediaViewer";
import { AppText } from "@/components/ui/AppText";
import { getPropertyHeroImage } from "@/lib/mobileData";
import { useAppTheme } from "@/lib/mobileTheme";
import type { MobileProperty } from "@/types/mobile";

type PropertyPromptCardsRailProps = {
  properties: MobileProperty[];
  comparePicking?: boolean;
  maxCompareProperties?: number;
  onPressProperty: (property: MobileProperty) => void;
  onPressCompare?: () => void;
  onRemoveProperty: (propertyId: string) => void;
  onToggleComparePicking?: () => void;
};

/**
 * WHY:   The composer needs a minimal property-context strip that users can scroll without introducing a second card-heavy workspace.
 * WHAT:  Renders a raw horizontal rail of circular property prompt tabs with one optional compare shortcut.
 * HOW:   Keeps each item closer to a page switcher than a card: circular image, short inline title, and one lightweight plus control for selecting more.
 */
export function PropertyPromptCardsRail({
  properties,
  comparePicking = false,
  maxCompareProperties = 3,
  onPressProperty,
  onPressCompare,
  onRemoveProperty,
  onToggleComparePicking,
}: PropertyPromptCardsRailProps) {
  const theme = useAppTheme();

  if (properties.length === 0) return null;

  const canAddMore = properties.length < maxCompareProperties;
  const tabCircleSize = 38;
  const tabMediaSize = 34;
  const fadeWidth = 26;
  const railFadeColor = theme.colors.surface;
  const inactiveTabSurface = theme.colors.glassBg;
  const inactiveTextColor = theme.colors.inkSoft;

  return (
    <View style={{ position: "relative" }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: "row-reverse",
          gap: 12,
          paddingHorizontal: 10,
          paddingVertical: 2,
        }}
      >
        {properties.length > 1 && onPressCompare ? (
          <Pressable
            onPress={onPressCompare}
            className="items-center"
            style={({ pressed }) => ({
              opacity: pressed ? 0.92 : 1,
            })}
          >
            <View
              className="flex-row-reverse items-center gap-2"
              style={{
                minHeight: 46,
                borderRadius: theme.radii.pill,
                borderWidth: 1,
                borderColor: theme.colors.primaryMuted,
                backgroundColor: theme.colors.primarySoft,
                paddingLeft: 12,
                paddingRight: 7,
              }}
            >
              <View
                style={{
                  borderRadius: 999,
                  width: tabCircleSize,
                  height: tabCircleSize,
                  backgroundColor: theme.colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Scale3d size={16} color={theme.colors.primary} />
              </View>
              <AppText className="text-[11px] font-cairo-bold" numberOfLines={1} style={{ maxWidth: 78, color: theme.colors.primary }}>
                مقارنة
              </AppText>
            </View>
          </Pressable>
        ) : null}

        {properties.map((property, index) => {
          const propertyImages = property.media.length > 0 ? property.media : [getPropertyHeroImage(property)];
          const isPrimaryProperty = index === 0;

          return (
            <Pressable
              key={property.id}
              onPress={() => onPressProperty(property)}
              className="items-center"
              style={({ pressed }) => ({
                opacity: pressed ? 0.92 : 1,
              })}
            >
              <View
                className="flex-row-reverse items-center gap-2"
                style={{
                  minHeight: 46,
                  borderRadius: theme.radii.pill,
                  borderWidth: 1,
                  borderColor: isPrimaryProperty ? theme.colors.primaryMuted : theme.colors.border,
                  backgroundColor: isPrimaryProperty ? theme.colors.primarySoft : inactiveTabSurface,
                  paddingLeft: 12,
                  paddingRight: 7,
                }}
              >
                <View
                  style={{
                    position: "relative",
                    borderRadius: 999,
                    width: tabCircleSize,
                    height: tabCircleSize,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <CursorPropertyMediaViewer
                    images={propertyImages}
                    width={tabMediaSize}
                    height={tabMediaSize}
                    borderRadius={999}
                    backgroundColor={theme.colors.surfaceMuted}
                    showCounter={false}
                    interactionMode="static"
                  />

                  <Pressable
                    onPress={() => onRemoveProperty(property.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`إزالة ${property.title}`}
                    className="items-center justify-center rounded-full"
                    style={({ pressed }) => ({
                      position: "absolute",
                      top: -4,
                      left: -4,
                      width: 16,
                      height: 16,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                      opacity: pressed ? 0.74 : 1,
                    })}
                  >
                    <X size={10} color={theme.colors.inkMuted} />
                  </Pressable>
                </View>

                <AppText
                  className="text-[11px] font-cairo-bold"
                  numberOfLines={1}
                  style={{
                    maxWidth: 112,
                    color: isPrimaryProperty ? theme.colors.primary : inactiveTextColor,
                  }}
                >
                  {property.title}
                </AppText>
              </View>
            </Pressable>
          );
        })}

        {onToggleComparePicking && (comparePicking || canAddMore) ? (
          <Pressable
            onPress={onToggleComparePicking}
            accessibilityRole="button"
            accessibilityLabel={comparePicking ? "إنهاء اختيار المزيد" : "اختيار المزيد"}
            className="items-center"
            style={({ pressed }) => ({
              opacity: pressed ? 0.84 : 1,
            })}
          >
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: 42,
                height: 42,
                borderWidth: 1,
                borderColor: comparePicking ? theme.colors.primaryMuted : theme.colors.border,
                backgroundColor: comparePicking ? theme.colors.primarySoft : inactiveTabSurface,
              }}
            >
              <Plus size={18} color={comparePicking ? theme.colors.primary : theme.colors.inkMuted} />
            </View>
          </Pressable>
        ) : null}
      </ScrollView>

      <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: fadeWidth }}>
        <LinearGradient
          colors={[railFadeColor, "transparent"]}
          start={{ x: 1, y: 0.5 }}
          end={{ x: 0, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </View>

      <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: fadeWidth }}>
        <LinearGradient
          colors={[railFadeColor, "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
