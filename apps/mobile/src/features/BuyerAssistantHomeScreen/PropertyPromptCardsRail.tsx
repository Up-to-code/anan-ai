import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Plus, Scale3d, X } from "lucide-react-native";
import { CursorPropertyMediaViewer } from "@/components/property/CursorPropertyMediaViewer";
import { AppText } from "@/components/ui/AppText";
import { getPropertyHeroImage } from "@/lib/mobileData";
import { useMobileLocale } from "@/lib/mobileLocale";
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
 * WHY:   The composer needs one calm selection rail that feels like chat context, not a second comparison workspace.
 * WHAT:  Renders selected-property chips plus explicit select-more and compare actions.
 * HOW:   Uses one generous touch target per chip, a trailing remove button, and only shows compare once multi-select is complete.
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
  const { dictionary, locale, isRtl } = useMobileLocale();

  if (properties.length === 0) return null;

  const canAddMore = properties.length < maxCompareProperties;
  const tabCircleSize = 40;
  const tabMediaSize = 36;
  const fadeWidth = 26;
  const railFadeColor = theme.colors.surface;
  const inactiveTabSurface = theme.colors.glassBg;
  const inactiveTextColor = theme.colors.inkSoft;
  const showCompareAction = properties.length >= 2 && !comparePicking && Boolean(onPressCompare);
  const showSelectionToggle = Boolean(onToggleComparePicking) && (comparePicking || canAddMore);
  const selectionToggleLabel = comparePicking ? dictionary.assistant.doneSelecting : dictionary.assistant.selectProperty;

  return (
    <View style={{ position: "relative" }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: "row-reverse",
          gap: 12,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}
      >
        {showCompareAction ? (
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
                minHeight: 48,
                borderRadius: theme.radii.pill,
                borderWidth: 1,
                borderColor: theme.colors.primaryMuted,
                backgroundColor: theme.colors.primarySoft,
                paddingLeft: 14,
                paddingRight: 12,
              }}
            >
              <View
                style={{
                  borderRadius: 999,
                  width: 34,
                  height: 34,
                  backgroundColor: theme.colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Scale3d size={16} color={theme.colors.primary} />
              </View>
              <AppText className="text-[12px] font-cairo-bold" numberOfLines={1} style={{ maxWidth: 96, color: theme.colors.primary }}>
                {dictionary.assistant.compareNow}
              </AppText>
            </View>
          </Pressable>
        ) : null}

        {properties.map((property, index) => {
          const propertyImages = property.media.length > 0 ? property.media : [getPropertyHeroImage(property)];
          const isPrimaryProperty = index === 0;

          return (
            <View key={property.id} className="items-center">
              <View
                className="flex-row-reverse items-center gap-2"
                style={{
                  minHeight: 48,
                  borderRadius: theme.radii.pill,
                  borderWidth: 1,
                  borderColor: isPrimaryProperty ? theme.colors.primaryMuted : theme.colors.border,
                  backgroundColor: isPrimaryProperty ? theme.colors.primarySoft : inactiveTabSurface,
                  paddingLeft: 6,
                  paddingRight: 8,
                }}
              >
                <Pressable
                  onPress={() => onPressProperty(property)}
                  className={`items-center gap-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.92 : 1,
                    paddingLeft: 4,
                    paddingRight: 4,
                  })}
                >
                  <View
                    style={{
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
                  </View>

                  <AppText
                    className="text-[12px] font-cairo-bold"
                    numberOfLines={1}
                    style={{
                      maxWidth: 112,
                      color: isPrimaryProperty ? theme.colors.primary : inactiveTextColor,
                    }}
                  >
                    {property.title}
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={() => onRemoveProperty(property.id)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    locale === "en" ? `Remove ${property.title}` : `إزالة ${property.title}`
                  }
                  className="items-center justify-center rounded-full"
                  hitSlop={8}
                  style={({ pressed }) => ({
                    width: 32,
                    height: 32,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    opacity: pressed ? 0.74 : 1,
                  })}
                >
                  <X size={15} color={theme.colors.inkMuted} />
                </Pressable>
              </View>
            </View>
          );
        })}

        {showSelectionToggle ? (
          <Pressable
            onPress={onToggleComparePicking}
            accessibilityRole="button"
            accessibilityLabel={selectionToggleLabel}
            className="items-center"
            style={({ pressed }) => ({
              opacity: pressed ? 0.84 : 1,
            })}
          >
            <View
              className="flex-row-reverse items-center gap-2"
              style={{
                minHeight: 48,
                borderRadius: theme.radii.pill,
                borderWidth: 1,
                borderColor: comparePicking ? theme.colors.primaryMuted : theme.colors.border,
                backgroundColor: comparePicking ? theme.colors.primarySoft : inactiveTabSurface,
                paddingLeft: 14,
                paddingRight: 12,
              }}
            >
              <View
                className="items-center justify-center rounded-full"
                style={{
                  width: 34,
                  height: 34,
                  backgroundColor: theme.colors.surface,
                }}
              >
                {comparePicking ? (
                  <Check size={16} color={theme.colors.primary} />
                ) : (
                  <Plus size={18} color={theme.colors.inkMuted} />
                )}
              </View>
              <AppText className="text-[12px] font-cairo-bold" style={{ color: comparePicking ? theme.colors.primary : theme.colors.inkSoft }}>
                {selectionToggleLabel}
              </AppText>
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
