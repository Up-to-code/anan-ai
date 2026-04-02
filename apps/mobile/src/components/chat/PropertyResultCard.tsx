import type { ReactNode } from "react";
import { Image } from "expo-image";
import { Bath, BedDouble, MapPin } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { getPropertyHeroImage, getPropertyLocationLabel } from "@/lib/mobileData";
import { formatCurrency } from "@/lib/formatters";
import { AppText } from "@/components/ui/AppText";
import { useMobileLayout } from "@/lib/mobileLayout";
import type { MobileProperty } from "@/types/mobile";

type PropertyResultCardProps = {
  property: MobileProperty;
  onPress: (property: MobileProperty) => void;
  onOpenDetails?: (property: MobileProperty) => void;
};

/**
 * WHY:   Recommendations inside the assistant should read like a compact shortlist instead of a full property feed.
 * WHAT:  Renders a smaller horizontally scrollable property card with responsive media, type, and quick actions.
 * HOW:   Uses the shared mobile layout tokens so one card size works across compact phones and larger devices.
 */
export function PropertyResultCard({ property, onPress, onOpenDetails }: PropertyResultCardProps) {
  const layout = useMobileLayout();
  const imageSize = layout.isCompact ? 96 : 104;

  return (
    <View
      className="overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 w-full"
      style={{ borderRadius: layout.cardRadius }}
    >
      <Pressable onPress={() => onPress(property)} className="flex-row-reverse gap-3 p-3">
        <Image
          source={getPropertyHeroImage(property)}
          style={{ width: imageSize, height: imageSize, borderRadius: layout.cardRadius - 6 }}
          contentFit="cover"
          transition={200}
        />

        <View className="flex-1 justify-start py-0.5">
          <View className="gap-1">
            <AppText responsiveRole="body" className="font-cairo-black text-slate-900 dark:text-slate-50" numberOfLines={2}>
              {property.title}
            </AppText>
            <AppText responsiveRole="chip" className="font-cairo-black text-primary">
              {formatCurrency(property.price)}
            </AppText>
          </View>

          <View className="mt-3 flex-row-reverse items-center gap-1.5">
            <Badge icon={<BedDouble size={12} color="#64748B" />} label={`${property.beds}`} />
            <Badge icon={<Bath size={12} color="#64748B" />} label={`${property.baths}`} />
          </View>

          <View className="mt-2 flex-row-reverse items-center">
            <Badge icon={<MapPin size={12} color="#64748B" />} label={getPropertyLocationLabel(property)} />
          </View>
        </View>
      </Pressable>

      <View className="flex-row-reverse gap-2 border-t border-slate-100 px-3 py-3 dark:border-slate-800">
        <ActionButton label="اسأل المساعد" tone="secondary" onPress={() => onPress(property)} />
        {onOpenDetails ? <ActionButton label="عرض الوحدة" tone="primary" onPress={() => onOpenDetails(property)} /> : null}
      </View>
    </View>
  );
}

function Badge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <View
      className="flex-row-reverse items-center justify-center border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-800 dark:bg-slate-950"
      style={{ borderRadius: 8, gap: 4 }}
    >
      {icon}
      <AppText className="text-[10px] font-cairo-black text-slate-700 dark:text-slate-200" style={{ paddingTop: 1 }} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  tone = "primary",
}: {
  label: string;
  onPress: () => void;
  tone?: "primary" | "secondary";
}) {
  const layout = useMobileLayout();

  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center justify-center border ${tone === "primary" ? "border-slate-900 bg-slate-900 dark:border-slate-50 dark:bg-slate-50" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}
      style={{ minHeight: layout.touchTarget, borderRadius: 999 }}
    >
      <AppText
        responsiveRole="chip"
        className={`font-cairo-black ${tone === "primary" ? "text-white dark:text-slate-950" : "text-slate-900 dark:text-slate-100"}`}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
