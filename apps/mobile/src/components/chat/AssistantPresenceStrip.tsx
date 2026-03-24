import { Search } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { AnanMark } from "@/components/chat/AnanMark";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";

type AssistantPresenceStripProps = {
  onSearchPress: () => void;
};

/**
 * WHY:   The chat home needs a stable top anchor that explains what the assistant is for.
 * WHAT:  Renders the branded assistant header and the quick search entry action.
 * HOW:   Keeps the copy concise and the surface flat so the interface feels calm and product-like.
 */
export function AssistantPresenceStrip({ onSearchPress }: AssistantPresenceStripProps) {
  return (
    <View className="border-b border-line bg-panel px-5 pb-4 pt-3">
      <View className="flex-row-reverse items-start justify-between">
        <View className="flex-1 flex-row-reverse items-center gap-3">
          <View className="h-12 w-12 items-center justify-center border border-line bg-white">
            <AnanMark />
          </View>
          <View className="flex-1">
            <AppText tone="headline" className="text-lg">
              عنان للمشتري
            </AppText>
            <AppText className="mt-1 text-sm leading-5 text-muted">
              قرارك العقاري يبدأ من سؤال واضح: ابحث، قارن، احسب التمويل، ثم انتقل للزيارة.
            </AppText>
          </View>
        </View>
        <IconButton icon={Search} onPress={onSearchPress} tone="light" />
      </View>
      <Pressable
        className="mt-4 border border-line bg-white px-4 py-3"
        onPress={onSearchPress}
      >
        <View className="flex-row-reverse items-center gap-2">
          <Search size={16} color="#64748B" />
          <AppText className="text-sm text-muted">ابحث عن منطقة، نوع وحدة، أو ميزانية</AppText>
        </View>
      </Pressable>
    </View>
  );
}
