import {
  Building2,
  CalendarCheck2,
  GitCompareArrows,
  Landmark,
  Percent,
  Search,
} from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import type { ChatCapability } from "@/types/chat";

type CapabilityRailProps = {
  capabilities: ChatCapability[];
  onCapabilityPress: (capabilityId: ChatCapability["id"]) => void;
};

const capabilityIcons = {
  search: Search,
  properties: Building2,
  loans: Landmark,
  roi: Percent,
  compare: GitCompareArrows,
  booking: CalendarCheck2,
};

/**
 * WHY:   Buyers need quick-start actions without typing.
 * WHAT:  Modernizes the quick-launch rail for the assistant capabilities.
 * HOW:   Uses rounded-2xl chips, dark mode support, and high-contrast spacing to feel premium and clean.
 */
export function CapabilityRail({ capabilities, onCapabilityPress }: CapabilityRailProps) {
  return (
    <View className="bg-slate-50 border-b border-slate-100 py-4 dark:bg-slate-950 dark:border-slate-800">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
        style={{ direction: "rtl" }}
      >
        {capabilities.map((capability) => {
          const Icon = capabilityIcons[capability.id];

          return (
            <Pressable
              key={capability.id}
              className="w-[140px] rounded-2xl bg-slate-100 px-4 py-4 transition-all active:scale-95 dark:bg-slate-800"
              onPress={() => onCapabilityPress(capability.id)}
            >
              <View className="flex-row-reverse items-center justify-between">
                <View className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                  <Icon size={18} color="#2563EB" />
                </View>
                <AppText tone="label" className="text-[12px] font-black uppercase tracking-widest text-primary">
                  {capability.label}
                </AppText>
              </View>
              <AppText className="mt-4 text-[15px] font-cairo-black leading-tight text-slate-900 dark:text-slate-50 text-right">
                {capability.label}
              </AppText>
              <AppText className="mt-1 text-[13px] font-medium leading-relaxed text-slate-500 dark:text-slate-400 text-right">
                {capability.hint}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
