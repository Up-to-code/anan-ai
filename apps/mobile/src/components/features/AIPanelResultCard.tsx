import { View, Dimensions, ScrollView } from "react-native";
import { Image } from "expo-image";
import { AppText } from "@/components/ui/AppText";
import { AIPanelResult } from "@/types/assistant";
import { TrendingUp, CreditCard, ShieldCheck, BarChart3, ArrowRightLeft, UserCheck } from "lucide-react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

type AIPanelResultCardProps = {
  card: AIPanelResult;
};

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  roi_summary: { icon: TrendingUp, color: "#10b981", label: "تحليل العائد" },
  payment_plan: { icon: CreditCard, color: "#2563EB", label: "خطة السداد" },
  mortgage_check: { icon: ShieldCheck, color: "#8b5cf6", label: "فحص التمويل" },
  permit_status: { icon: ShieldCheck, color: "#f59e0b", label: "حالة التصاريح" },
  comparison_table: { icon: BarChart3, color: "#06b6d4", label: "مقارنة" },
  broker_handoff: { icon: UserCheck, color: "#2563EB", label: "تحويل للوسيط" },
};

/**
 * Rich, visual AG-UI result card. Shows typed data with icons,
 * formatted numbers, and visual hierarchy.
 */
export function AIPanelResultCard({ card }: AIPanelResultCardProps) {
  const config = typeConfig[card.type] ?? { icon: BarChart3, color: "#64748b", label: card.type };
  const Icon = config.icon;

  return (
    <View className="bg-white overflow-hidden" style={{ borderWidth: 0.5, borderColor: "#e2e8f0" }}>
      {/* Card header */}
      <View className="flex-row items-center gap-2 px-4 pt-3 pb-2">
        <View className="h-7 w-7 items-center justify-center" style={{ backgroundColor: config.color + "15" }}>
          <Icon size={14} color={config.color} />
        </View>
        <AppText className="text-xs font-cairo-bold uppercase tracking-wide" style={{ color: config.color }}>
          {config.label}
        </AppText>
      </View>

      {/* Title */}
      <View className="px-4 pb-2">
        <AppText className="text-base font-cairo-bold text-slate-900">{card.title}</AppText>
      </View>

      {/* Data section — depends on card type */}
      {card.type === "roi_summary" ? (
        <View className="px-4 pb-3">
          <View className="flex-row gap-3 mb-3">
            <MetricBox label="سعر الشراء" value={formatSAR(card.purchasePrice)} color="#0f172a" />
            <MetricBox label="الإيجار السنوي" value={formatSAR(card.estimatedAnnualRent)} color="#10b981" />
            <MetricBox label="العائد" value={`${card.grossYieldPercent}%`} color="#10b981" highlight />
          </View>
          {/* Visual yield bar */}
          <View className="h-2 bg-slate-100 w-full overflow-hidden">
            <View className="h-full bg-emerald-500" style={{ width: `${Math.min(card.grossYieldPercent * 10, 100)}%` }} />
          </View>
        </View>
      ) : null}

      {card.type === "payment_plan" ? (
        <View className="px-4 pb-3">
          <View className="flex-row gap-3 mb-3">
            <MetricBox label="الدفعة الأولى" value={formatSAR(card.downPayment)} color="#2563EB" />
            <MetricBox label="القسط الشهري" value={formatSAR(card.monthlyInstallment)} color="#2563EB" />
            <MetricBox label="المدة" value={`${card.durationMonths} شهر`} color="#64748b" />
          </View>
          {/* Timeline visualization */}
          <View className="flex-row items-center gap-1">
            {Array.from({ length: Math.min(card.durationMonths / 12, 5) }).map((_, i) => (
              <View key={i} className="flex-1 h-1.5 bg-brand/30" />
            ))}
            <AppText className="text-[10px] text-slate-400 ml-1">{Math.round(card.durationMonths / 12)} سنة</AppText>
          </View>
        </View>
      ) : null}

      {card.type === "mortgage_check" ? (
        <View className="px-4 pb-3">
          <View className="flex-row items-center gap-2 mb-2 px-3 py-2" style={{ 
            backgroundColor: card.estimatedEligibility === "eligible" ? "#10b98115" : "#f59e0b15" 
          }}>
            <View className="h-2 w-2 rounded-full" style={{ 
              backgroundColor: card.estimatedEligibility === "eligible" ? "#10b981" : "#f59e0b" 
            }} />
            <AppText className="text-sm font-cairo-bold" style={{ 
              color: card.estimatedEligibility === "eligible" ? "#10b981" : "#f59e0b" 
            }}>
              {card.estimatedEligibility === "eligible" ? "مؤهل للتمويل" : "يحتاج مراجعة"}
            </AppText>
          </View>
          {card.recommendedBudget ? (
            <View className="flex-row gap-3">
              <MetricBox label="الميزانية المقترحة" value={formatSAR(card.recommendedBudget)} color="#8b5cf6" />
              {card.monthlyInstallmentEstimate ? (
                <MetricBox label="القسط التقديري" value={formatSAR(card.monthlyInstallmentEstimate)} color="#8b5cf6" />
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}

      {card.type === "permit_status" ? (
        <View className="px-4 pb-3">
          <View className="flex-row items-center gap-2 px-3 py-2" style={{
            backgroundColor: card.permitStatus === "verified" ? "#10b98115" : "#f59e0b15"
          }}>
            <ShieldCheck size={14} color={card.permitStatus === "verified" ? "#10b981" : "#f59e0b"} />
            <AppText className="text-sm font-cairo-bold" style={{
              color: card.permitStatus === "verified" ? "#10b981" : "#f59e0b"
            }}>
              {card.permitStatus === "verified" ? "موثق" : "قيد المراجعة"}
            </AppText>
          </View>
        </View>
      ) : null}

      {card.type === "comparison_table" ? (
        <View className="px-4 pb-3">
          {card.rows.map((row, i) => (
            <View key={i} className="flex-row items-center py-2" style={{ borderBottomWidth: i < card.rows.length - 1 ? 0.5 : 0, borderBottomColor: "#f1f5f9" }}>
              <AppText className="w-1/3 text-xs text-slate-500">{row[0]}</AppText>
              <AppText className="flex-1 text-sm font-cairo-bold text-slate-900">{row[1]}</AppText>
            </View>
          ))}
        </View>
      ) : null}

      {card.type === "broker_handoff" ? (
        <View className="px-4 pb-3">
          <View className="flex-row items-center gap-2 px-3 py-3 bg-brand/10">
            <UserCheck size={16} color="#2563EB" />
            <AppText className="text-sm font-cairo-bold text-brand">
              {card.handoffStatus === "qualified" ? "عميل مؤهل — جاهز للتحويل" : "معلومات إضافية مطلوبة"}
            </AppText>
          </View>
        </View>
      ) : null}

      {/* Summary */}
      <View className="px-4 pb-4" style={{ borderTopWidth: 0.5, borderTopColor: "#f1f5f9" }}>
        <AppText className="text-xs text-slate-500 mt-2 leading-5">{card.summary}</AppText>
      </View>
    </View>
  );
}

/** Small metric display box */
function MetricBox({ label, value, color, highlight }: { label: string; value: string; color: string; highlight?: boolean }) {
  return (
    <View className="flex-1 py-2 px-2" style={{ backgroundColor: highlight ? color + "15" : "#f8fafc" }}>
      <AppText className="text-[10px] text-slate-400 uppercase mb-0.5">{label}</AppText>
      <AppText className="text-sm font-cairo-bold" style={{ color }}>{value}</AppText>
    </View>
  );
}

function formatSAR(value: number): string {
  return new Intl.NumberFormat("en-SA", { notation: "compact", maximumFractionDigits: 1 }).format(value) + " ر.س";
}
