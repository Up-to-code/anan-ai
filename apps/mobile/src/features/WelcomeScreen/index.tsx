import { View } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { AnanMark } from "@/components/chat/AnanMark";

/**
 * WHY:   Users need a strong branded entry point into the app.
 * WHAT:  Renders a clean, highly polished Welcome Screen displaying the Anan value proposition.
 * HOW:   Utilizes central flex layouts, the custom AnanMark component, and the global primary Button.
 */
export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950 px-8">
      <View className="flex-1 justify-center items-center w-full max-w-[400px]">
        {/* Hero Graphic */}
        <View className="h-[120px] w-[120px] items-center justify-center rounded-[40px] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 mb-12">
          <AnanMark />
        </View>

        {/* Typography */}
        <AppText className="text-[32px] font-cairo-black text-slate-900 dark:text-slate-50 text-center leading-[44px] mb-4">
          مرحباً بك في عنان
        </AppText>
        <AppText className="text-[16px] font-medium leading- relaxed text-slate-500 dark:text-slate-400 text-center mb-14 px-4">
          مساعدك العقاري الذكي بين يديك. استكشف الفرص، وحلل السوق، وتحدث مع الذكاء الاصطناعي بلحظات.
        </AppText>

        {/* Actions */}
        <Button 
          label="ابدأ الآن" 
          onPress={() => router.replace("/")} 
          className="w-full h-[64px] rounded-[24px]"
          textClassName="text-[18px]"
        />
      </View>
    </View>
  );
}
