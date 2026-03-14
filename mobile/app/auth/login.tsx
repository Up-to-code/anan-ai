import { View, Pressable, Platform, KeyboardAvoidingView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { ArrowRight, Mail } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";

export default function LoginScreen() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    // Navigate to root (HomeFeed)
    router.replace("/" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <Animated.View entering={FadeIn.duration(300)} className="px-4 py-3 border-b border-slate-200" style={{ borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" }}>
        <IconButton icon={ArrowRight} onPress={() => router.back()} />
      </Animated.View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 px-6 pt-10">
          <Animated.View entering={FadeInDown.duration(500).delay(100)} className="mb-10 items-center">
            <AppText className="text-2xl font-cairo-bold text-slate-900 mb-2">تسجيل الدخول</AppText>
            <AppText className="text-base text-slate-500 text-center">
              مرحباً بعودتك إلى منصة عنان العقارية
            </AppText>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(200)} className="w-full gap-4">
            {/* OAuth Providers Mock */}
            <Pressable 
              onPress={handleAuthSuccess}
              className="w-full h-12 flex-row items-center justify-center bg-white active:bg-slate-50 transition-colors"
              style={{ borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 4 }}
            >
              <AppText className="text-base font-cairo-bold text-slate-800 ml-2">المتابعة باستخدام Apple</AppText>
              {/* Note: In a real app we'd use SVG icons for Apple/Google here */}
            </Pressable>

            <Pressable 
              onPress={handleAuthSuccess}
              className="w-full h-12 flex-row items-center justify-center bg-white active:bg-slate-50 transition-colors"
              style={{ borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 4 }}
            >
              <AppText className="text-base font-cairo-bold text-slate-800 ml-2">المتابعة باستخدام Google</AppText>
            </Pressable>
            
            <View className="flex-row items-center w-full my-6">
              <View className="flex-1 h-px bg-slate-200" />
              <AppText className="px-4 text-sm text-slate-400">أو</AppText>
              <View className="flex-1 h-px bg-slate-200" />
            </View>

            {/* Email form mock */}
            <View className="w-full h-12 flex-row items-center px-4 bg-slate-50" style={{ borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 4 }}>
              <TextInput 
                placeholder="البريد الإلكتروني"
                placeholderTextColor="#94a3b8"
                className="flex-1 text-base font-cairo text-slate-900 text-right h-full"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Mail size={18} color="#94a3b8" className="ml-3" />
            </View>

            <Button 
              label="متابعة" 
              onPress={handleAuthSuccess} 
            />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
