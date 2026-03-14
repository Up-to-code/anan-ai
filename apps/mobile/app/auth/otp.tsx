import { useState, useRef, useEffect } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, ShieldCheck } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

const OTP_LENGTH = 4;

/**
 * OTP verification screen — 4-digit code input with auto-focus progression.
 */
export default function OTPScreen() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newCode.every(d => d.length === 1)) {
      // Mock: navigate to home
      setTimeout(() => router.replace("/" as any), 500);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

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
          <View className="h-12 w-12 bg-emerald-50 items-center justify-center mb-4">
            <ShieldCheck size={20} color="#10b981" />
          </View>

          <AppText className="text-2xl font-cairo-bold text-slate-900">رمز التحقق</AppText>
          <AppText className="text-sm text-slate-500 mt-2 leading-5">
            أدخل الرمز المكون من 4 أرقام الذي أرسلناه إلى جوالك
          </AppText>

          {/* OTP Inputs */}
          <View className="flex-row justify-center gap-4 mt-8">
            {code.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputs.current[i] = ref; }}
                value={digit}
                onChangeText={(v) => handleChange(v, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                className="h-14 w-14 text-center text-2xl font-cairo-bold text-slate-900"
                style={{
                  borderWidth: digit ? 2 : 0.5,
                  borderColor: digit ? "#2563EB" : "#e2e8f0",
                  backgroundColor: digit ? "#eff6ff" : "#f8fafc",
                }}
              />
            ))}
          </View>

          {/* Resend */}
          <View className="mt-6 items-center">
            <AppText className="text-xs text-slate-400">لم تستلم الرمز؟</AppText>
            <AppText className="text-xs text-brand font-cairo-bold mt-1">إعادة إرسال</AppText>
          </View>
        </View>

        <View className="px-8 pb-8">
          <Button
            label="تحقق"
            onPress={() => router.replace("/" as any)}
            disabled={!code.every(d => d.length === 1)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
