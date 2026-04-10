import React, { memo } from "react";
import { BedDouble, ChevronLeft, MapPin, ShieldCheck } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { CursorCardAction, CursorCardShell } from "@/components/property/CursorCardShell";
import { CursorPropertyMediaViewer } from "@/components/property/CursorPropertyMediaViewer";
import { AppText } from "@/components/ui/AppText";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/formatters";
import { formatMobileCopy } from "@/lib/i18n";
import { getPropertyHeroImage, getPropertyLocationLabel } from "@/lib/mobileData";
import { useMobileLayout } from "@/lib/mobileLayout";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";
import type { MobileProperty } from "@/types/mobile";

export type MobilePropertyCardVariant = "compact" | "featured" | "generated";

export type MobilePropertyCardProps = {
  variant: MobilePropertyCardVariant;
  property: MobileProperty;
  onPress: (property: MobileProperty) => void;
  onActionPress?: (property: MobileProperty) => void;
  actionDisabled?: boolean;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  actionLabel?: string;
  ambientBackgroundColor?: string;
};

/**
 * WHY:   Mobile property results should feel like one consistent object across assistant, AG-UI, search, and spotlight surfaces.
 * WHAT:  Renders the canonical mobile property card with compact and featured variants on top of the shared cursor-card shell.
 * HOW:   Centralizes media, facts, verified badge treatment, CTA handling, and gallery/detail action separation so every mobile surface reuses one renderer.
 */
export const MobilePropertyCard = memo(function MobilePropertyCard({
  variant,
  property,
  onPress,
  onActionPress,
  actionDisabled = false,
  onOpenGallery,
  actionLabel,
  ambientBackgroundColor,
}: MobilePropertyCardProps) {
  const layout = useMobileLayout();
  const theme = useAppTheme();
  const { locale, dictionary, isRtl } = useMobileLocale();
  const propertyImages = property.media.length > 0 ? property.media : [getPropertyHeroImage(property)];
  const detailHandler = () => onPress(property);
  const actionHandler = onActionPress ? () => onActionPress(property) : detailHandler;
  const galleryHandler = onOpenGallery ? (initialIndex: number) => onOpenGallery(property, initialIndex) : undefined;
  const compact = variant === "compact";
  const generated = variant === "generated";
  const compactFacts = [
    formatMobileCopy(dictionary.property.rooms, { count: property.beds }),
    formatMobileCopy(dictionary.property.baths, { count: property.baths }),
  ];
  if (property.sqft) compactFacts.push(formatMobileCopy(dictionary.property.sqft, { count: property.sqft }));
  const imageWidth = layout.isCompact ? 96 : 104;
  const compactImageHeight = layout.isCompact ? 104 : 112;
  const featuredImageHeight = layout.isCompact ? 160 : 180;
  const generatedImageHeight = Math.round(layout.propertyCardWidth);
  const ChevronIcon = ChevronLeft;
  const verifiedBadge = property.owner.isVerified ? (
    <View
      className={cn("absolute top-3 items-center gap-1.5 px-2.5 py-1", isRtl ? "right-3 flex-row-reverse" : "left-3 flex-row")}
      style={{
        backgroundColor: theme.isDark ? "rgba(9, 9, 11, 0.88)" : "rgba(255, 255, 255, 0.92)",
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: theme.isDark ? theme.colors.borderStrong : theme.colors.border,
      }}
    >
      <ShieldCheck size={compact ? 11 : 12} color={theme.colors.teal} />
      <AppText className="font-cairo-bold" style={{ color: theme.colors.teal, fontSize: compact ? 10 : 11 }}>
        {dictionary.common.verified}
      </AppText>
    </View>
  ) : null;

  return (
    <CursorCardShell
      ambientBackgroundColor={ambientBackgroundColor}
      contentStyle={{ backgroundColor: theme.cursorCard.surfaceColor }}
    >
      <View>
        {compact ? (
          <View
            className={cn(isRtl ? "flex-row-reverse" : "flex-row", "items-center gap-4")}
            style={{
              paddingHorizontal: 14,
              paddingTop: 14,
              paddingBottom: actionLabel ? 8 : 14,
            }}
          >
            <CursorPropertyMediaViewer
              images={propertyImages}
              width={imageWidth}
              height={compactImageHeight}
              borderRadius={theme.radii.card}
              backgroundColor={theme.colors.surfaceMuted}
              overlay={verifiedBadge}
              showCounter={false}
              onOpenGallery={galleryHandler}
            />

            <Pressable
              onPress={detailHandler}
              className="flex-1"
              style={({ pressed }) => ({
                opacity: pressed ? 0.94 : 1,
                transform: [{ scale: pressed ? 0.995 : 1 }],
              })}
            >
              <View className={cn(isRtl ? "items-end" : "items-start", "justify-center")}>
                <View className={cn("w-full items-start justify-between gap-2", isRtl ? "flex-row-reverse" : "flex-row")}>
                  <ChevronIcon size={16} color={theme.colors.inkMuted} style={{ marginTop: 2, marginRight: isRtl ? -4 : 0, marginLeft: isRtl ? 0 : -4 }} />
                  <View className={cn("flex-1", isRtl ? "items-end" : "items-start")}>
                    <AppText
                      className={cn(isRtl ? "text-right" : "text-left", "font-cairo-bold")}
                      style={{ color: theme.colors.ink, fontSize: 16, lineHeight: 26 }}
                      numberOfLines={2}
                    >
                      {property.title}
                    </AppText>
                    <AppText
                      className={cn(isRtl ? "text-right" : "text-left", "mt-1 font-cairo-bold")}
                      style={{ color: theme.colors.primary, fontSize: 17, lineHeight: 24 }}
                    >
                      {formatCurrency(property.price, locale)}
                    </AppText>
                  </View>
                </View>

                <View className={cn("mt-2 w-full items-center gap-1.5 opacity-80", isRtl ? "flex-row-reverse" : "flex-row")}>
                  <MapPin size={13} color={theme.colors.inkMuted} />
                  <AppText className={cn("flex-1 font-medium", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.inkSoft, fontSize: 12 }} numberOfLines={1}>
                    {getPropertyLocationLabel(property)}
                  </AppText>
                </View>

                <View className={cn("mt-1 w-full items-center opacity-80", isRtl ? "flex-row-reverse" : "flex-row")}>
                  <AppText className={cn("font-medium", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.inkSoft, fontSize: 12 }}>
                    {compactFacts.join(" • ")}
                  </AppText>
                </View>
              </View>
            </Pressable>
          </View>
        ) : generated ? (
          <View>
            <CursorPropertyMediaViewer
              images={propertyImages}
              height={generatedImageHeight}
              borderRadius={0}
              backgroundColor={theme.colors.surfaceMuted}
              overlay={verifiedBadge}
              onOpenGallery={galleryHandler}
            />

            <Pressable
              onPress={detailHandler}
              style={({ pressed }) => ({
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.995 : 1 }],
              })}
            >
              <View className="gap-4 px-4 pt-4 pb-3">
                <View className="gap-2">
                  <View className={cn("items-start justify-between gap-3", isRtl ? "flex-row-reverse" : "flex-row")}>
                    <ChevronIcon size={17} color={theme.colors.inkMuted} style={{ marginTop: 2 }} />
                    <View className={cn("flex-1", isRtl ? "items-end" : "items-start")}>
                      <AppText
                        className={cn(isRtl ? "text-right" : "text-left", "font-cairo-bold")}
                        style={{ color: theme.colors.ink, fontSize: 17, lineHeight: 28 }}
                        numberOfLines={2}
                      >
                        {property.title}
                      </AppText>
                    </View>
                  </View>

                  <AppText className={cn(isRtl ? "text-right" : "text-left", "font-cairo-black")} style={{ color: theme.colors.primary, fontSize: 20, lineHeight: 28 }}>
                    {formatCurrency(property.price, locale)}
                  </AppText>
                </View>

                <View className={cn("items-center gap-1.5", isRtl ? "flex-row-reverse" : "flex-row")}>
                  <MapPin size={14} color={theme.colors.inkMuted} />
                  <AppText
                    className={cn("flex-1 font-medium", isRtl ? "text-right" : "text-left")}
                    style={{ color: theme.colors.inkSoft, fontSize: 13, lineHeight: 20 }}
                    numberOfLines={1}
                  >
                    {getPropertyLocationLabel(property)}
                  </AppText>
                </View>

                <View className={cn(isRtl ? "flex-row-reverse" : "flex-row", "flex-wrap gap-2")}>
                  {compactFacts.map((fact) => (
                    <View
                      key={fact}
                      className="px-3 py-1.5"
                      style={{
                        borderRadius: theme.radii.pill,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surfaceMuted,
                      }}
                    >
                      <AppText className="font-cairo-bold text-[12px]" style={{ color: theme.colors.inkSoft }}>
                        {fact}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          </View>
        ) : (
          <View>
            <CursorPropertyMediaViewer
              images={propertyImages}
              height={featuredImageHeight}
              borderRadius={0}
              backgroundColor={theme.colors.surfaceMuted}
              overlay={verifiedBadge}
              onOpenGallery={galleryHandler}
            />

            <Pressable
              onPress={detailHandler}
              style={({ pressed }) => ({
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.995 : 1 }],
              })}
            >
                <View className="gap-3 px-4 pt-4 pb-3">
                <View className={cn("items-start justify-between gap-4", isRtl ? "flex-row-reverse" : "flex-row")}>
                  <AppText className={cn("flex-1 font-cairo-bold text-[17px] leading-tight", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.ink }}>
                    {property.title}
                  </AppText>
                  <AppText className="font-cairo-black text-[17px]" style={{ color: theme.colors.primary }}>
                    {formatCurrency(property.price, locale)}
                  </AppText>
                </View>

                <View className={cn("items-center gap-1.5", isRtl ? "flex-row-reverse" : "flex-row")}>
                  <MapPin size={13} color={theme.colors.inkMuted} />
                  <AppText className={cn("font-medium text-[13px]", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.inkMuted }}>
                    {getPropertyLocationLabel(property)}
                  </AppText>
                  <View className="mx-1 h-1 w-1 rounded-full" style={{ backgroundColor: theme.colors.borderStrong }} />
                  <BedDouble size={13} color={theme.colors.inkMuted} />
                  <AppText className="text-[13px] font-medium" style={{ color: theme.colors.inkMuted }}>
                    {compactFacts.slice(0, 2).join(" • ")}
                  </AppText>
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {actionLabel ? (
          <View
            className="px-4 pb-4"
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              paddingTop: compact ? 10 : 12,
            }}
          >
            <CursorCardAction
              label={actionLabel}
              onPress={actionHandler}
              ambientBackgroundColor={ambientBackgroundColor}
              emphasis="primary"
              disabled={actionDisabled}
              style={{ alignSelf: "flex-end" }}
            />
          </View>
        ) : null}
      </View>
    </CursorCardShell>
  );
});
