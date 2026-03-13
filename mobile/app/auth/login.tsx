import { useState } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Phone } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

/**
 * Phone number login screen. Clean, minimal, single input.
 */
export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  const handleSubmit = () => {
    if (phone.length >= 9) {
      router.push("/auth/otp" as any);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <IconButton icon={ChevronRight} onPress={() => router.back()} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 px-8 pt-8">
          <View className="h-12 w-12 bg-brand/10 items-center justify-center mb-4">
            <Phone size={20} color="#2563EB" />
          </View>

          <AppText className="text-2xl font-cairo-bold text-slate-900">تسجيل الدخول</AppText>
          <AppText className="text-sm text-slate-500 mt-2 leading-5">
            أدخل رقم جوالك وسنرسل لك رمز تحقق
          </AppText>

          {/* Phone input */}
          <View className="mt-6 flex-row items-center gap-3">
            <View className="px-3 py-3 bg-slate-50" style={{ borderWidth: 0.5, borderColor: "#e2e8f0" }}>
              <AppText className="text-base text-slate-900 font-cairo-bold">🇸🇦 +966</AppText>
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="5XXXXXXXX"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              maxLength={9}
              className="flex-1 px-4 py-3 bg-slate-50 text-base text-slate-900 font-cairo"
              style={{ borderWidth: 0.5, borderColor: "#e2e8f0", textAlign: "left" }}
            />
          </View>

          <View className="mt-4">
            <AppText className="text-xs text-slate-400 leading-4">
              بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية
            </AppText>
          </View>
        </View>

        <View className="px-8 pb-8">
          <Button
            label="إرسال رمز التحقق"
            onPress={handleSubmit}
            disabled={phone.length < 9}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
