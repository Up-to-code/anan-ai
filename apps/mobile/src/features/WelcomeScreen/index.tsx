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
    <View className="flex-1 items-center justify-center bg-slate-100 dark:bg-slate-950 px-8">
      <View className="flex-1 justify-center items-center w-full max-w-[400px]">
        <View className="rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900 mb-8">
          <AppText className="font-cairo-black text-[12px] tracking-[3px] text-slate-500 dark:text-slate-400">
            BUYER ASSISTANT
          </AppText>
        </View>

        <View className="h-[124px] w-[124px] items-center justify-center rounded-[40px] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 mb-12">
          <AnanMark />
        </View>

        <AppText className="text-[32px] font-cairo-black text-slate-900 dark:text-slate-50 text-center leading-[44px] mb-4">
          مرحباً بك في عنان
        </AppText>
        <AppText className="text-[16px] font-medium leading-8 text-slate-500 dark:text-slate-400 text-center mb-8 px-4">
          مساعدك العقاري الذكي بين يديك. ابحث، قارن، راجع التمويل، واطلب مستشاراً من نفس التجربة.
        </AppText>

        <View className="w-full rounded-[28px] border border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-900 mb-8">
          <AppText className="text-[15px] font-cairo-black text-slate-900 dark:text-slate-50 text-right">
            البداية الأسرع
          </AppText>
          <AppText className="mt-2 text-[14px] leading-7 text-slate-500 dark:text-slate-400 text-right">
            افتح المحادثة الرئيسية إذا كنت تعرف ما تريد، أو ابدأ من البحث إذا كنت تفضل تصفح الخيارات أولاً.
          </AppText>
        </View>

        <Button
          label="ابدأ مع المساعد"
          onPress={() => router.replace("/")}
          className="w-full h-[64px] rounded-[24px]"
          textClassName="text-[18px]"
        />
        <Button
          label="تصفح البحث أولاً"
          variant="secondary"
          onPress={() => router.push("/search")}
          className="w-full mt-3 h-[60px] rounded-[24px]"
          textClassName="text-[16px]"
        />
      </View>
    </View>
  );
}
