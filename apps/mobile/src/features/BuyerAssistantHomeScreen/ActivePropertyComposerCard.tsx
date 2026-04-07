import React from "react";
import { MapPin, X } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { CursorCardShell } from "@/components/property/CursorCardShell";
import { CursorPropertyMediaViewer } from "@/components/property/CursorPropertyMediaViewer";
import { AppText } from "@/components/ui/AppText";
import { getPropertyHeroImage, getPropertyLocationLabel } from "@/lib/mobileData";
import { useAppTheme } from "@/lib/mobileTheme";
import type { MobileProperty } from "@/types/mobile";

type ActivePropertyComposerCardProps = {
  property: MobileProperty;
  onPress: (property: MobileProperty) => void;
  onDismiss?: () => void;
  ambientBackgroundColor?: string;
};

/**
 * WHY:   Users need to see the active property at the exact moment they continue typing so the conversation format feels obvious.
 * WHAT:  Renders a compact property helper card above the chat composer with one example prompt line.
 * HOW:   Reuses the shared cursor-card shell and media viewer, keeps the layout lightweight, and makes the whole card tappable to apply a ready-to-edit prompt.
 */
export function ActivePropertyComposerCard({
  property,
  onPress,
  onDismiss,
  ambientBackgroundColor,
}: ActivePropertyComposerCardProps) {
  const theme = useAppTheme();
  const propertyImages = property.media.length > 0 ? property.media : [getPropertyHeroImage(property)];

  return (
    <CursorCardShell
      ambientBackgroundColor={ambientBackgroundColor}
      contentStyle={{ backgroundColor: theme.cursorCard.surfaceColor }}
    >
      <View className="flex-row-reverse items-center gap-2 px-2.5 py-2">
        {onDismiss ? (
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="إخفاء مرجع العقار"
            className="items-center justify-center self-start"
            style={({ pressed }) => ({
              width: 28,
              height: 28,
              borderRadius: 999,
              backgroundColor: theme.colors.surfaceMuted,
              opacity: pressed ? 0.78 : 1,
            })}
          >
            <X size={14} color={theme.colors.inkMuted} />
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => onPress(property)}
          accessibilityRole="button"
          className="flex-1 active:opacity-95"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.992 : 1 }],
          })}
        >
          <View className="flex-row-reverse items-center gap-2.5">
          <CursorPropertyMediaViewer
            images={propertyImages}
            width={54}
            height={54}
            borderRadius={12}
            backgroundColor={theme.colors.surfaceMuted}
            showCounter={false}
          />

          <View className="flex-1 gap-1">
            <View className="items-end">
              <AppText
                className="text-[13px] font-cairo-bold text-right"
                numberOfLines={1}
                style={{ color: theme.colors.ink }}
              >
                {property.title}
              </AppText>
            </View>

            <View className="flex-row-reverse items-center gap-1.5">
              <MapPin size={13} color={theme.colors.primary} />
              <AppText
                className="flex-1 text-[12px] font-medium text-right"
                numberOfLines={1}
                style={{ color: theme.colors.inkMuted }}
              >
                {getPropertyLocationLabel(property)}
              </AppText>
            </View>

            <AppText className="text-[10.5px] font-cairo-bold text-right" numberOfLines={1} style={{ color: theme.colors.inkSoft }}>
              اسأل الآن عن التفاصيل أو السعر أو التمويل
            </AppText>
          </View>
          </View>
        </Pressable>
      </View>
    </CursorCardShell>
  );
}
