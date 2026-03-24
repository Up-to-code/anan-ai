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
 * WHY:   Buyers should be able to start from a capability without typing the first prompt manually.
 * WHAT:  Renders the horizontal quick-launch rail for the assistant capabilities.
 * HOW:   Uses compact bordered chips with icon, label, and one short hint.
 */
export function CapabilityRail({ capabilities, onCapabilityPress }: CapabilityRailProps) {
  return (
    <View className="border-b border-line bg-white py-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      >
        {capabilities.map((capability) => {
          const Icon = capabilityIcons[capability.id];

          return (
            <Pressable
              key={capability.id}
              className="w-[132px] border border-line bg-panel px-3 py-3"
              onPress={() => onCapabilityPress(capability.id)}
            >
              <View className="flex-row-reverse items-center justify-between">
                <View className="h-8 w-8 items-center justify-center border border-line bg-white">
                  <Icon size={16} color="#2563EB" />
                </View>
                <AppText tone="label" className="text-[11px] text-brand">
                  {capability.label}
                </AppText>
              </View>
              <AppText className="mt-3 text-sm leading-5 text-ink">{capability.label}</AppText>
              <AppText className="mt-1 text-xs leading-5 text-muted">{capability.hint}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
