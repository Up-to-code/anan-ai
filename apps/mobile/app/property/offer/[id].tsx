import { useState } from "react";
import { View, ScrollView, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, CheckCircle2, Wallet, Landmark, Building } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";

export default function OfferScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { properties } = usePropertyFeed();
  const property = properties.find(p => p.id === id);

  const [offerPrice, setOfferPrice] = useState(property ? String(property.price) : "");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mortgage">("mortgage");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!property) return null;

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <Animated.View entering={FadeInDown.duration(500)} className="h-20 w-20 bg-brand/10 rounded-full items-center justify-center mb-6">
          <CheckCircle2 size={40} color="#2563EB" />
        </Animated.View>
        <Animated.Text entering={FadeInDown.duration(500).delay(100)} className="text-2xl font-cairo-bold text-slate-900 text-center">تم إرسال العرض بنجاح</Animated.Text>
        <Animated.Text entering={FadeInDown.duration(500).delay(200)} className="text-slate-500 text-center mt-3 leading-6">
          تم توجيه عرضك بقيمة {new Intl.NumberFormat("en-SA").format(Number(offerPrice))} ر.س إلى "{property.owner.name}". سيتم إشعارك عند الرد.
        </Animated.Text>
        <Animated.View entering={FadeInDown.duration(500).delay(300)} className="w-full mt-10 gap-3">
          <Button label="متابعة حالة العرض" onPress={() => router.replace("/" as any)} />
          <Pressable onPress={() => router.back()} className="py-3">
            <AppText className="text-center font-cairo-bold text-brand">العودة للتفاصيل</AppText>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Animated.View entering={FadeIn.duration(300)} className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" }}>
          <IconButton icon={ChevronRight} onPress={() => router.back()} />
          <AppText className="flex-1 text-center font-cairo-bold text-base text-slate-900">تقديم عرض شراء</AppText>
          <View className="w-10" />
        </Animated.View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Property Context */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)} className="px-5 py-5 items-center">
              <View className="h-16 w-16 bg-slate-100 rounded-lg items-center justify-center mb-3">
                <Building size={24} color="#94a3b8" />
              </View>
              <AppText className="text-xl font-cairo-bold text-slate-900 text-center">{property.title}</AppText>
              <AppText className="text-sm text-slate-500 mt-1">
                السعر المطلوب: {new Intl.NumberFormat("en-SA").format(property.price)} ر.س
              </AppText>
            </Animated.View>

            {/* Offer Input */}
            <Animated.View entering={FadeInDown.duration(400).delay(150)} className="px-5 py-6" style={{ borderTopWidth: 0.5, borderTopColor: "#f1f5f9" }}>
              <AppText className="text-sm font-cairo-bold text-slate-900 mb-4">مبلغ العرض (ر.س)</AppText>
              <View className="flex-row items-center bg-slate-50 px-4 py-1" style={{ borderWidth: 0.5, borderColor: "#cbd5e1" }}>
                <AppText className="font-cairo-bold text-brand text-lg">SAR</AppText>
                <TextInput
                  value={offerPrice}
                  onChangeText={setOfferPrice}
                  keyboardType="number-pad"
                  className="flex-1 py-4 px-3 text-right text-2xl font-cairo-bold text-slate-900"
                />
              </View>
              {Number(offerPrice) < property.price * 0.9 ? (
                <Animated.View entering={FadeIn} className="mt-2">
                  <AppText className="text-xs text-amber-600">
                    ملاحظة: العرض أقل من السعر المطلوب بأكثر من ١٠٪
                  </AppText>
                </Animated.View>
              ) : null}
            </Animated.View>

            {/* Payment Method */}
            <Animated.View entering={FadeInDown.duration(400).delay(200)} className="px-5 py-6" style={{ borderTopWidth: 0.5, borderTopColor: "#f1f5f9" }}>
              <AppText className="text-sm font-cairo-bold text-slate-900 mb-4">طريقة السداد</AppText>
              
              <Pressable
                onPress={() => setPaymentMethod("mortgage")}
                className={`flex-row items-center p-4 mb-3 border ${paymentMethod === "mortgage" ? "border-brand bg-brand/5" : "border-slate-200"}`}
              >
                <Landmark size={20} color={paymentMethod === "mortgage" ? "#2563EB" : "#64748b"} />
                <View className="flex-1 ml-3 items-start">
                  <AppText className={`font-cairo-bold text-sm ${paymentMethod === "mortgage" ? "text-brand" : "text-slate-900"}`}>تمويل بنكي</AppText>
                  <AppText className="text-xs text-slate-500 mt-0.5">يتطلب موافقة جهة التمويل</AppText>
                </View>
                <View className={`h-5 w-5 rounded-full border items-center justify-center ${paymentMethod === "mortgage" ? "border-brand bg-brand" : "border-slate-300"}`}>
                  {paymentMethod === "mortgage" && <View className="h-2 w-2 bg-white rounded-full" />}
                </View>
              </Pressable>

              <Pressable
                onPress={() => setPaymentMethod("cash")}
                className={`flex-row items-center p-4 border ${paymentMethod === "cash" ? "border-brand bg-brand/5" : "border-slate-200"}`}
              >
                <Wallet size={20} color={paymentMethod === "cash" ? "#2563EB" : "#64748b"} />
                <View className="flex-1 ml-3 items-start">
                  <AppText className={`font-cairo-bold text-sm ${paymentMethod === "cash" ? "text-brand" : "text-slate-900"}`}>كاش (دفعة واحدة)</AppText>
                  <AppText className="text-xs text-slate-500 mt-0.5">سداد نقدي مباشر للوسيط</AppText>
                </View>
                <View className={`h-5 w-5 rounded-full border items-center justify-center ${paymentMethod === "cash" ? "border-brand bg-brand" : "border-slate-300"}`}>
                  {paymentMethod === "cash" && <View className="h-2 w-2 bg-white rounded-full" />}
                </View>
              </Pressable>
            </Animated.View>

            <View className="h-32" />
          </ScrollView>

          {/* Bottom CTA */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)} className="absolute bottom-0 left-0 right-0 bg-white px-5 pb-8 pt-4" style={{ borderTopWidth: 0.5, borderTopColor: "#e2e8f0" }}>
            <View className="flex-row justify-between mb-4 px-1">
              <AppText className="text-sm text-slate-500">رسوم السعي (٢٫٥٪)</AppText>
              <AppText className="font-cairo-bold text-slate-900">{new Intl.NumberFormat("en-SA").format(Number(offerPrice) * 0.025)} ر.س</AppText>
            </View>
            <Button label="تأكيد العرض" onPress={() => setIsSuccess(true)} disabled={!offerPrice || Number(offerPrice) <= 0} />
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}
