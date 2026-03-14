import { Bath, BedDouble, Ruler } from "lucide-react-native";
import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";

type PropertyStatStripProps = {
  beds: number;
  baths: number;
  sqft?: number;
};

/**
 * Compact inline stat strip — no borders, no panels.
 */
export function PropertyStatStrip({ beds, baths, sqft }: PropertyStatStripProps) {
  return (
    <View className="flex-row items-center gap-4">
      <View className="flex-row items-center gap-1">
        <BedDouble size={14} color="#64748b" />
        <AppText className="text-xs text-slate-500">{beds}</AppText>
      </View>
      <View className="flex-row items-center gap-1">
        <Bath size={14} color="#64748b" />
        <AppText className="text-xs text-slate-500">{baths}</AppText>
      </View>
      {sqft ? (
        <View className="flex-row items-center gap-1">
          <Ruler size={14} color="#64748b" />
          <AppText className="text-xs text-slate-500">{sqft} قدم</AppText>
        </View>
      ) : null}
    </View>
  );
}
