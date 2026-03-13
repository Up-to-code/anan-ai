import { View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Image } from "expo-image";

/**
 * Welcome/onboarding screen — first thing users see before auth.
 * Clean, minimal, brand-forward.
 */
export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-8">
        {/* Brand mark */}
        <View className="h-16 w-16 bg-brand items-center justify-center mb-6">
          <Sparkles size={28} color="#FFFFFF" />
        </View>

        <AppText className="text-3xl font-cairo-bold text-slate-900 text-center">عنان</AppText>
        <AppText className="text-base text-slate-500 text-center mt-2 leading-6">
          مساعدك العقاري الذكي{"\n"}ابحث، قارن، وقرر — بمحادثة واحدة
        </AppText>

        {/* Features */}
        <View className="mt-8 w-full gap-4">
          <FeatureRow emoji="🏠" text="ابحث عن العقار المناسب بالذكاء الاصطناعي" />
          <FeatureRow emoji="📊" text="احصل على تحليلات استثمارية فورية" />
          <FeatureRow emoji="💳" text="احسب خطط السداد والتمويل" />
          <FeatureRow emoji="🤝" text="تواصل مع وسطاء موثقين" />
        </View>
      </View>

      {/* CTA */}
      <View className="px-8 pb-8 gap-3">
        <Button label="ابدأ الآن" onPress={() => router.push("/auth/login" as any)} />
        <Pressable onPress={() => router.replace("/" as any)} className="py-3">
          <AppText className="text-sm text-brand text-center font-cairo-bold">تصفح كضيف</AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <AppText className="text-xl">{emoji}</AppText>
      <AppText className="text-sm text-slate-700 flex-1">{text}</AppText>
    </View>
  );
}
