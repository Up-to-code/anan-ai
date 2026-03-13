import { ScrollView, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Building2, CreditCard, TrendingUp, ShieldCheck, Landmark } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";

// Saudi bank partner data
const banks = [
  { name: "مصرف الراجحي", rate: "4.68%", maxTerm: "25 سنة", logo: "🏦", color: "#004d40" },
  { name: "البنك الأهلي", rate: "4.75%", maxTerm: "25 سنة", logo: "🏛️", color: "#1565c0" },
  { name: "مصرف الإنماء", rate: "4.59%", maxTerm: "30 سنة", logo: "💎", color: "#6a1b9a" },
  { name: "بنك البلاد", rate: "4.82%", maxTerm: "20 سنة", logo: "🌐", color: "#e65100" },
];

/**
 * Finance detail screen — shows mortgage breakdown, bank partners, and payment scenarios.
 */
export default function FinanceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { properties } = usePropertyFeed();
  const property = properties.find(p => p.id === id);

  if (!property) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <AppText className="text-slate-400">جاري التحميل...</AppText>
      </View>
    );
  }

  const downPayment = Math.round(property.price * 0.1);
  const loanAmount = property.price - downPayment;
  const monthlyPayment = Math.round(loanAmount / (25 * 12) * 1.04);
  const totalCost = monthlyPayment * 25 * 12;
  const totalInterest = totalCost - loanAmount;
  const annualRent = Math.round(property.price * 0.075);
  const yieldPercent = ((annualRent / property.price) * 100).toFixed(1);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" }}>
        <IconButton icon={ChevronRight} onPress={() => router.back()} />
        <AppText className="flex-1 ml-2 font-cairo-bold text-base text-slate-900" numberOfLines={1}>
          التفاصيل المالية
        </AppText>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Property Summary */}
        <View className="px-5 py-4" style={{ borderBottomWidth: 0.5, borderBottomColor: "#f1f5f9" }}>
          <AppText className="font-cairo-bold text-slate-900" numberOfLines={1}>{property.title}</AppText>
          <AppText className="text-lg font-cairo-bold text-brand mt-1">
            {new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(property.price)}
          </AppText>
        </View>

        {/* Cost Breakdown */}
        <View className="px-5 py-4">
          <SectionHeader icon={CreditCard} label="تفصيل التكلفة" color="#2563EB" />
          <View className="mt-3 gap-0">
            <FinanceRow label="سعر العقار" value={formatSAR(property.price)} />
            <FinanceRow label="الدفعة الأولى (10%)" value={formatSAR(downPayment)} highlight />
            <FinanceRow label="مبلغ التمويل" value={formatSAR(loanAmount)} />
            <FinanceRow label="القسط الشهري التقديري" value={formatSAR(monthlyPayment)} highlight />
            <FinanceRow label="إجمالي تكلفة التمويل" value={formatSAR(totalCost)} />
            <FinanceRow label="إجمالي الأرباح المصرفية" value={formatSAR(totalInterest)} />
          </View>
        </View>

        {/* ROI Section */}
        <View className="px-5 py-4" style={{ borderTopWidth: 0.5, borderTopColor: "#f1f5f9" }}>
          <SectionHeader icon={TrendingUp} label="العائد الاستثماري" color="#10b981" />
          <View className="mt-3 gap-0">
            <FinanceRow label="الإيجار السنوي التقديري" value={formatSAR(annualRent)} />
            <FinanceRow label="العائد الإجمالي" value={`${yieldPercent}%`} highlight />
            <FinanceRow label="الإيجار الشهري التقديري" value={formatSAR(Math.round(annualRent / 12))} />
            <FinanceRow label="فترة استرداد رأس المال" value={`${Math.round(property.price / annualRent)} سنة`} />
          </View>
          {/* Yield bar */}
          <View className="mt-3">
            <View className="h-2 bg-slate-100 w-full overflow-hidden">
              <View className="h-full bg-emerald-500" style={{ width: `${Math.min(parseFloat(yieldPercent) * 12, 100)}%` }} />
            </View>
            <View className="flex-row justify-between mt-1">
              <AppText className="text-[10px] text-slate-400">منخفض</AppText>
              <AppText className="text-[10px] text-slate-400">مرتفع</AppText>
            </View>
          </View>
        </View>

        {/* Eligibility Check */}
        <View className="px-5 py-4" style={{ borderTopWidth: 0.5, borderTopColor: "#f1f5f9" }}>
          <SectionHeader icon={ShieldCheck} label="فحص الأهلية" color="#8b5cf6" />
          <View className="mt-3 p-3" style={{ backgroundColor: property.price < 2500000 ? "#10b98115" : "#f59e0b15" }}>
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: property.price < 2500000 ? "#10b981" : "#f59e0b" }} />
              <AppText className="text-sm font-cairo-bold" style={{ color: property.price < 2500000 ? "#10b981" : "#f59e0b" }}>
                {property.price < 2500000 ? "مؤهل للتمويل — راتب 15,000+ ر.س" : "يحتاج مراجعة — راتب 25,000+ ر.س مقترح"}
              </AppText>
            </View>
            <AppText className="text-xs text-slate-500 mt-2 leading-4">
              التقدير مبني على نسبة استقطاع 33% من الراتب الشهري. يرجى مراجعة البنك للحصول على تأكيد نهائي.
            </AppText>
          </View>
        </View>

        {/* Bank Partners */}
        <View className="px-5 py-4" style={{ borderTopWidth: 0.5, borderTopColor: "#f1f5f9" }}>
          <SectionHeader icon={Landmark} label="شركاء التمويل المعتمدين" color="#0f172a" />
          <View className="mt-3 gap-3">
            {banks.map((bank) => (
              <Pressable key={bank.name} className="flex-row items-center p-3 gap-3" style={{ borderWidth: 0.5, borderColor: "#e2e8f0" }}>
                <View className="h-10 w-10 items-center justify-center" style={{ backgroundColor: bank.color + "15" }}>
                  <AppText className="text-lg">{bank.logo}</AppText>
                </View>
                <View className="flex-1">
                  <AppText className="font-cairo-bold text-sm text-slate-900">{bank.name}</AppText>
                  <AppText className="text-xs text-slate-400">أقل نسبة ربح: {bank.rate} · مدة حتى {bank.maxTerm}</AppText>
                </View>
                <ChevronRight size={14} color="#94a3b8" style={{ transform: [{ scaleX: -1 }] }} />
              </Pressable>
            ))}
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-5 pb-8 pt-3" style={{ borderTopWidth: 0.5, borderTopColor: "#e2e8f0" }}>
        <Button label="تقدم بطلب تمويل" onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

function SectionHeader({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-6 w-6 items-center justify-center" style={{ backgroundColor: color + "15" }}>
        <Icon size={13} color={color} />
      </View>
      <AppText className="font-cairo-bold text-sm text-slate-900">{label}</AppText>
    </View>
  );
}

function FinanceRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View className="flex-row items-center justify-between py-2.5" style={{ borderBottomWidth: 0.5, borderBottomColor: "#f8fafc" }}>
      <AppText className="text-sm text-slate-500">{label}</AppText>
      <AppText className={`text-sm font-cairo-bold ${highlight ? "text-brand" : "text-slate-900"}`}>{value}</AppText>
    </View>
  );
}

function formatSAR(val: number) {
  return new Intl.NumberFormat("en-SA", { maximumFractionDigits: 0 }).format(val) + " ر.س";
}
