import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calculator } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { formatCurrency } from "@/lib/formatters";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";
import { getPropertyLocationLabel } from "@/lib/mobileData";

export default function FinanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { property, isLoading } = usePropertyDetail(propertyId);

  const propertyValue = property?.price ?? 1200000;
  const downPayment = Math.round(propertyValue * 0.2);
  const rate = 0.045;
  const years = 20;

  const principal = propertyValue - downPayment;
  const monthlyRate = rate / 12;
  const payments = years * 12;
  const monthlyPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -payments));

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-100 dark:bg-slate-950">
      <View className="flex-row items-center justify-between px-6 pb-4" style={{ paddingTop: insets.top + 16 }}>
        <IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />
        <AppText className="text-[18px] font-cairo-black text-slate-900 dark:text-slate-50">حاسبة التمويل</AppText>
        <View className="w-12 h-12 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <Calculator size={20} color="#94A3B8" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
         <View className="py-6 gap-6">
            {property ? (
              <View className="rounded-[28px] border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
                <AppText className="text-[12px] font-cairo-black uppercase tracking-[2px] text-slate-400 text-right">
                  العقار المرجعي
                </AppText>
                <AppText className="mt-2 text-[18px] font-cairo-black text-slate-900 dark:text-slate-50 text-right">
                  {property.title}
                </AppText>
                <AppText className="mt-1 text-[14px] font-medium text-slate-500 text-right">
                  {getPropertyLocationLabel(property)}
                </AppText>
              </View>
            ) : null}
            <View className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-900">
              <AppText className="text-[14px] text-slate-500 font-bold mb-2 text-right">قيمة العقار</AppText>
              <AppText className="text-2xl font-cairo-black text-slate-900 dark:text-slate-50 text-right">{formatCurrency(propertyValue)}</AppText>
              <View className="mt-6 flex-row-reverse justify-between">
                <View>
                  <AppText className="text-[14px] text-slate-500 font-bold mb-2 text-right">الدفعة الأولى (20%)</AppText>
                  <AppText className="text-xl font-cairo-black text-slate-900 dark:text-slate-50 text-right">{formatCurrency(downPayment)}</AppText>
                </View>
                <View>
                  <AppText className="text-[14px] text-slate-500 font-bold mb-2 text-right">مدة التمويل</AppText>
                  <AppText className="text-xl font-cairo-black text-slate-900 dark:text-slate-50 text-right">{years} سنة</AppText>
                </View>
              </View>
            </View>
         </View>

         <View className="mt-2 rounded-[32px] bg-slate-900 dark:bg-slate-800 p-8 items-center justify-center">
            <AppText className="text-[15px] font-bold text-slate-400 mb-2">القسط الشهري التقديري</AppText>
            <AppText className="text-[32px] font-cairo-black text-white">{formatCurrency(monthlyPayment)}</AppText>
            <AppText className="text-[13px] font-medium text-slate-500 mt-4 text-center leading-relaxed">
               هذه الحسبة تقديرية بناءً على نسبة 4.5٪ ولمدة {years} سنة. قد تختلف الأرقام النهائية حسب جهة التمويل المعتمدة وملفك الائتماني.
            </AppText>
         </View>

         <View className="mt-6 mb-10 rounded-[28px] border border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-900">
           <AppText className="text-[15px] font-cairo-black text-slate-900 dark:text-slate-50 text-right">
             أكمل من نفس المحادثة
           </AppText>
           <AppText className="mt-2 text-[14px] leading-7 text-slate-500 dark:text-slate-400 text-right">
             ارجع إلى المساعد لطلب عروض بنكية، مقارنة سيناريوهات القسط، أو تحويلك إلى مستشار بناءً على هذه الحسبة.
           </AppText>
           <Pressable
             onPress={() => router.replace({ pathname: "/", params: property ? { propertyId: property.id } : undefined })}
             className="mt-4 h-12 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-50"
           >
             <AppText className="font-cairo-black text-white dark:text-slate-950">العودة إلى المساعد</AppText>
           </Pressable>
         </View>
      </ScrollView>
    </View>
  );
}
