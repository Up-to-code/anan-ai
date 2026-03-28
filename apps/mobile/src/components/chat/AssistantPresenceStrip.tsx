import { Search } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { AnanMark } from "@/components/chat/AnanMark";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";

type AssistantPresenceStripProps = {
  onSearchPress: () => void;
};

/**
 * WHY:   The chat home needs a clean top anchor.
 * WHAT:  Modernizes the branded assistant header and quick search entry action.
 * HOW:   Uses simple spacing, a rounded-full search pill, and seamless dark mode support.
 */
export function AssistantPresenceStrip({ onSearchPress }: AssistantPresenceStripProps) {
  return (
    <View className="bg-slate-50 dark:bg-slate-950 px-6 pb-6 pt-2">
      <View className="flex-row-reverse items-start justify-between">
        <View className="flex-1 flex-row-reverse items-center gap-4">
          <View className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900">
            <AnanMark />
          </View>
          <View className="flex-1">
            <AppText tone="headline" className="text-xl font-cairo-black text-slate-900 dark:text-slate-50">
              عنان للمشتري
            </AppText>
            <AppText className="mt-1 text-[14px] font-medium leading-[22px] text-slate-500 dark:text-slate-400">
              اسأل مساعدك العقاري عن حركة السوق، الفرص المتاحة، أو ابدأ بتحليل وحدة.
            </AppText>
          </View>
        </View>
      </View>
      
      <Pressable
        className="mt-6 flex flex-row-reverse items-center justify-between rounded-full bg-slate-100 px-5 py-4 transition-all active:scale-[0.98] dark:bg-slate-900"
        onPress={onSearchPress}
      >
        <View className="flex-row-reverse items-center gap-3">
          <Search size={18} color="#94A3B8" strokeWidth={2.5} />
          <AppText className="text-[15px] font-cairo-medium text-slate-400">
            ابحث عن منطقة، مطور، أو عقار
          </AppText>
        </View>
        <View className="flex h-7 items-center justify-center rounded-full bg-slate-100 px-3 dark:bg-slate-800">
           <AppText className="text-[10px] font-black uppercase tracking-widest text-slate-500">البحث السريع</AppText>
        </View>
      </Pressable>
    </View>
  );
}
