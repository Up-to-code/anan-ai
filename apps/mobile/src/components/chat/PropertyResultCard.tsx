import type { ReactNode } from "react";
import { Image } from "expo-image";
import { Bath, BedDouble, ChevronLeft, MapPin } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { getPropertyHeroImage, getPropertyLocationLabel } from "@/lib/mobileData";
import { formatCurrency } from "@/lib/formatters";
import { AppText } from "@/components/ui/AppText";
import { useMobileLayout } from "@/lib/mobileLayout";
import { mobileTheme } from "@/lib/mobileTheme";
import type { MobileProperty } from "@/types/mobile";

type PropertyResultCardProps = {
  property: MobileProperty;
  onPress: (property: MobileProperty) => void;
  onOpenDetails?: (property: MobileProperty) => void;
  variant?: "card" | "list";
  actionLabel?: string;
};

/**
 * WHY:   Buyer recommendations need one polished property surface that separates browsing from taking action.
 * WHAT:  Renders a clean property card with a details tap zone and a dedicated assistant/action button.
 * HOW:   Adapts the workspace system UI into mobile: flat white surface, blue accent, strong border, no shadow, and structural spacing.
 */
export function PropertyResultCard({
  property,
  onPress,
  onOpenDetails,
  variant = "card",
  actionLabel = "اتخذ إجراء",
}: PropertyResultCardProps) {
  const layout = useMobileLayout();
  const imageHeight = variant === "card" ? (layout.isCompact ? 152 : 168) : layout.isCompact ? 94 : 102;

  return (
    <View
      className="overflow-hidden"
      style={{
        borderRadius: 24,
        borderWidth: 1,
        borderColor: mobileTheme.colors.border,
        backgroundColor: mobileTheme.colors.surface,
      }}
    >
      <Pressable
        onPress={() => (onOpenDetails ? onOpenDetails(property) : onPress(property))}
        className={variant === "card" ? "" : "flex-row-reverse items-center gap-3 p-4"}
      >
        {variant === "card" ? (
          <View>
            <Image
              source={getPropertyHeroImage(property)}
              style={{ width: "100%", height: imageHeight }}
              contentFit="cover"
              transition={180}
            />

            <View className="gap-4 px-4 py-4">
              <View className="flex-row-reverse items-start justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <AppText className="text-right text-[11px] font-cairo-black tracking-[0.2em] text-slate-400">
                    PROPERTY
                  </AppText>
                  <AppText responsiveRole="bodyStrong" className="mt-2 font-cairo-black text-slate-900 dark:text-slate-50" numberOfLines={2}>
                    {property.title}
                  </AppText>
                  <View className="mt-2 flex-row-reverse items-center gap-1.5">
                    <MapPin size={12} color="#64748B" />
                    <AppText responsiveRole="chip" className="font-medium text-slate-500 dark:text-slate-400" numberOfLines={1}>
                      {getPropertyLocationLabel(property)}
                    </AppText>
                  </View>
                </View>

                <View className="items-end">
                  <AppText className="text-right text-[11px] font-cairo-black tracking-[0.2em] text-slate-400">
                    PRICE
                  </AppText>
                  <AppText responsiveRole="chip" className="mt-2 font-cairo-black text-primary">
                    {formatCurrency(property.price)}
                  </AppText>
                </View>
              </View>

              <View className="flex-row-reverse flex-wrap gap-2">
                <Badge icon={<BedDouble size={12} color="#64748B" />} label={`${property.beds} غرف`} />
                <Badge icon={<Bath size={12} color="#64748B" />} label={`${property.baths} حمام`} />
                {property.owner.name ? <Badge label={property.owner.name} /> : null}
              </View>
            </View>
          </View>
        ) : (
          <>
            <Image
              source={getPropertyHeroImage(property)}
              style={{ width: 96, height: imageHeight, borderRadius: 14 }}
              contentFit="cover"
              transition={160}
            />

            <View className="min-w-0 flex-1 gap-2">
              <View className="flex-row-reverse items-start justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <AppText responsiveRole="bodyStrong" className="font-cairo-black text-slate-900 dark:text-slate-50" numberOfLines={2}>
                    {property.title}
                  </AppText>
                  <View className="mt-1 flex-row-reverse items-center gap-1.5">
                    <MapPin size={12} color="#94A3B8" />
                    <AppText responsiveRole="chip" className="font-medium text-slate-500 dark:text-slate-400" numberOfLines={1}>
                      {getPropertyLocationLabel(property)}
                    </AppText>
                  </View>
                </View>

                <View className="items-end gap-2">
                  <AppText responsiveRole="chip" className="font-cairo-black text-primary">
                    {formatCurrency(property.price)}
                  </AppText>
                  <View
                    className="items-center justify-center rounded-full"
                    style={{ width: 32, height: 32, backgroundColor: mobileTheme.colors.surfaceMuted }}
                  >
                    <ChevronLeft size={16} color="#64748B" />
                  </View>
                </View>
              </View>

              <View className="flex-row-reverse flex-wrap items-center gap-2">
                <Badge icon={<BedDouble size={12} color="#64748B" />} label={`${property.beds} غرف`} />
                <Badge icon={<Bath size={12} color="#64748B" />} label={`${property.baths} حمام`} />
              </View>
            </View>
          </>
        )}
      </Pressable>

      <View className="px-4 py-3" style={{ borderTopWidth: 1, borderTopColor: mobileTheme.colors.border }}>
        <Pressable
          onPress={() => onPress(property)}
          className="items-center justify-center px-4 py-3 active:opacity-90"
          style={{
            borderRadius: 16,
            backgroundColor: mobileTheme.colors.dark,
          }}
        >
          <AppText className="text-[12px] font-cairo-black tracking-[0.2em] text-white">
            {actionLabel}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function Badge({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <View
      className="flex-row-reverse items-center justify-center px-3 py-1.5"
      style={{
        gap: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: mobileTheme.colors.border,
        backgroundColor: mobileTheme.colors.surfaceMuted,
      }}
    >
      {icon ?? null}
      <AppText className="text-[11px] font-cairo-black text-slate-700 dark:text-slate-200" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}
