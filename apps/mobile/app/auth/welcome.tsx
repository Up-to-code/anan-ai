import { View, Image, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Building2, ArrowLeft } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center">
        <Animated.View entering={FadeInDown.duration(600).delay(100)} className="items-center mb-12">
          <View className="h-20 w-20 bg-brand items-center justify-center mb-6" style={{ borderRadius: 4 }}>
            <Building2 size={40} color="#FFFFFF" />
          </View>
          <AppText className="text-4xl font-cairo-bold text-slate-900 text-center mb-4">
            عنان
          </AppText>
          <AppText className="text-lg text-slate-500 text-center leading-7 px-4">
            اكتشف، قارن، وامتلك عقارك القادم بتجربة ذكية ومبسطة.
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(300)} className="w-full gap-4 mt-8">
          <Button 
            label="تسجيل الدخول" 
            onPress={() => router.push("/auth/login" as any)} 
          />
          <Pressable 
            onPress={() => router.push("/" as any)}
            className="w-full h-14 bg-white items-center justify-center transition-colors active:bg-slate-50"
            style={{ borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 4 }}
          >
            <AppText className="text-base font-cairo-bold text-slate-700">تصفح كزائر</AppText>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
