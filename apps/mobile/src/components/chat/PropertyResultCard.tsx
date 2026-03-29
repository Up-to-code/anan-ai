import type { ReactNode } from "react";
import { Image } from "expo-image";
import { Bath, BedDouble, MapPin } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
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

  return (
    <View
      className="overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 w-full"
      style={{ borderRadius: layout.cardRadius }}
    >
      <Pressable onPress={() => onPress(property)} className="p-3 flex-row-reverse gap-3">
        {/* Right side: Image */}
        <Image
          source={getPropertyHeroImage(property)}
          style={{ width: 104, height: 110, borderRadius: layout.cardRadius - 4 }}
          contentFit="cover"
          transition={200}
        />

        {/* Left side: Details */}
        <View className="flex-1 justify-between py-0.5">
          <View className="gap-0.5">
            <AppText responsiveRole="bodyStrong" className="font-cairo-black text-slate-900 dark:text-slate-50" numberOfLines={2}>
              {property.title}
            </AppText>
            <AppText responsiveRole="chip" className="font-cairo-black text-primary mb-1">
              {formatCurrency(property.price)}
            </AppText>
          </View>

          <View className="flex-row-reverse items-center gap-1.5 flex-wrap mt-1">
             <Badge icon={<BedDouble size={12} color="#475569" />} label={`${property.beds}`} />
             <Badge icon={<Bath size={12} color="#475569" />} label={`${property.baths}`} />
             <Badge icon={<MapPin size={12} color="#475569" />} label={getPropertyLocationLabel(property)} />
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
      className="flex-row-reverse items-center justify-center bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800"
      style={{ borderRadius: 6, gap: 4 }}
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
      className={`flex-1 items-center justify-center border ${tone === "primary" ? "border-slate-900 bg-slate-900 dark:border-slate-50 dark:bg-slate-50" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"}`}
      style={{ minHeight: layout.touchTarget + 4, borderRadius: 999 }}
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
