import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Calculator } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { formatCurrency } from "@/lib/mvp/formatters";

export default function FinanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const propertyValue = 1200000;
  const downPayment = propertyValue * 0.2;
  const rate = 0.045; 
  const years = 20;

  const principal = propertyValue - downPayment;
  const monthlyRate = rate / 12;
  const payments = years * 12;
  const monthlyPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -payments));

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center justify-between px-6 pb-4" style={{ paddingTop: insets.top + 16 }}>
        <IconButton icon={ArrowLeft} onPress={() => router.back()} tone="ghost" />
        <AppText className="text-[18px] font-cairo-black text-slate-900 dark:text-slate-50">حاسبة التمويل</AppText>
        <View className="w-12 h-12 items-center justify-center">
          <Calculator size={20} color="#94A3B8" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
         <View className="py-6 gap-6">
            <View>
              <AppText className="text-[14px] text-slate-500 font-bold mb-2 text-right">قيمة العقار</AppText>
              <AppText className="text-2xl font-cairo-black text-slate-900 dark:text-slate-50 text-right">{formatCurrency(propertyValue)}</AppText>
            </View>

            <View className="flex-row-reverse justify-between">
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

         {/* Dark Mode Results Emphasis Block */}
         <View className="mt-8 rounded-[32px] bg-slate-900 dark:bg-slate-800 p-8 items-center justify-center">
            <AppText className="text-[15px] font-bold text-slate-400 mb-2">القسط الشهري التقديري</AppText>
            <AppText className="text-[32px] font-cairo-black text-white">{formatCurrency(monthlyPayment)}</AppText>
            <AppText className="text-[13px] font-medium text-slate-500 mt-4 text-center leading-relaxed">
               هذه الحسبة تقديرية بناءً على نسبة 4.5٪. قد تختلف الأرقام النهائية حسب جهة التمويل المعتمدة.
            </AppText>
         </View>
      </ScrollView>
    </View>
  );
}
