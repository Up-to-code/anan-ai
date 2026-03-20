import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { type AIPanelResult } from "@/types/assistant";
import { BarChart3, CreditCard, ShieldCheck, TrendingUp, UserCheck } from "lucide-react-native";

type AIPanelResultCardProps = {
  card: AIPanelResult;
};

type CardConfig = { icon: typeof BarChart3; color: string; label: string };

const typeConfig: Record<string, CardConfig> = {
  roi_summary: { icon: TrendingUp, color: "#10b981", label: "تحليل العائد" },
  payment_plan: { icon: CreditCard, color: "#2563EB", label: "خطة السداد" },
  mortgage_check: { icon: ShieldCheck, color: "#8b5cf6", label: "فحص التمويل" },
  permit_status: { icon: ShieldCheck, color: "#f59e0b", label: "حالة التصاريح" },
  comparison_table: { icon: BarChart3, color: "#06b6d4", label: "مقارنة" },
  broker_handoff: { icon: UserCheck, color: "#2563EB", label: "تحويل للوسيط" },
};

type RoiSummaryCard = Extract<AIPanelResult, { type: "roi_summary" }>;
type PaymentPlanCard = Extract<AIPanelResult, { type: "payment_plan" }>;
type MortgageCheckCard = Extract<AIPanelResult, { type: "mortgage_check" }>;
type PermitStatusCard = Extract<AIPanelResult, { type: "permit_status" }>;
type ComparisonCard = Extract<AIPanelResult, { type: "comparison_table" }>;
type BrokerHandoffCard = Extract<AIPanelResult, { type: "broker_handoff" }>;

function formatSAR(value: number): string {
  return new Intl.NumberFormat("en-SA", { notation: "compact", maximumFractionDigits: 1 }).format(value) + " ر.س";
}

function MetricBox({ label, value, color, highlight }: { label: string; value: string; color: string; highlight?: boolean }) {
  return (
    <View className="flex-1 py-2 px-2" style={{ backgroundColor: highlight ? color + "15" : "#f8fafc" }}>
      <AppText className="text-[10px] text-slate-400 uppercase mb-0.5">{label}</AppText>
      <AppText className="text-sm font-cairo-bold" style={{ color }}>{value}</AppText>
    </View>
  );
}

function RoiSummaryBody({ card }: { card: RoiSummaryCard }) {
  return (
    <View className="px-4 pb-3">
      <View className="flex-row gap-3 mb-3">
        <MetricBox label="سعر الشراء" value={formatSAR(card.purchasePrice)} color="#0f172a" />
        <MetricBox label="الإيجار السنوي" value={formatSAR(card.estimatedAnnualRent)} color="#10b981" />
        <MetricBox label="العائد" value={`${card.grossYieldPercent}%`} color="#10b981" highlight />
      </View>
      <View className="h-2 bg-slate-100 w-full overflow-hidden">
        <View className="h-full bg-emerald-500" style={{ width: `${Math.min(card.grossYieldPercent * 10, 100)}%` }} />
      </View>
    </View>
  );
}

function PaymentPlanBody({ card }: { card: PaymentPlanCard }) {
  return (
    <View className="px-4 pb-3">
      <View className="flex-row gap-3 mb-3">
        <MetricBox label="الدفعة الأولى" value={formatSAR(card.downPayment)} color="#2563EB" />
        <MetricBox label="القسط الشهري" value={formatSAR(card.monthlyInstallment)} color="#2563EB" />
        <MetricBox label="المدة" value={`${card.durationMonths} شهر`} color="#64748b" />
      </View>
      <View className="flex-row items-center gap-1">
        {Array.from({ length: Math.min(card.durationMonths / 12, 5) }).map((_, index) => (
          <View key={index} className="flex-1 h-1.5 bg-brand/30" />
        ))}
        <AppText className="text-[10px] text-slate-400 ml-1">{Math.round(card.durationMonths / 12)} سنة</AppText>
      </View>
    </View>
  );
}

function MortgageEligibilityBanner({ card }: { card: MortgageCheckCard }) {
  const eligible = card.estimatedEligibility === "eligible";
  const color = eligible ? "#10b981" : "#f59e0b";
  const backgroundColor = eligible ? "#10b98115" : "#f59e0b15";
  const label = eligible ? "مؤهل للتمويل" : "يحتاج مراجعة";
  return (
    <View className="flex-row items-center gap-2 mb-2 px-3 py-2" style={{ backgroundColor }}>
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <AppText className="text-sm font-cairo-bold" style={{ color }}>{label}</AppText>
    </View>
  );
}

function MortgageCheckBody({ card }: { card: MortgageCheckCard }) {
  return (
    <View className="px-4 pb-3">
      <MortgageEligibilityBanner card={card} />
      {card.recommendedBudget ? (
        <View className="flex-row gap-3">
          <MetricBox label="الميزانية المقترحة" value={formatSAR(card.recommendedBudget)} color="#8b5cf6" />
          {card.monthlyInstallmentEstimate ? (
            <MetricBox label="القسط التقديري" value={formatSAR(card.monthlyInstallmentEstimate)} color="#8b5cf6" />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function PermitStatusBody({ card }: { card: PermitStatusCard }) {
  const verified = card.permitStatus === "verified";
  const color = verified ? "#10b981" : "#f59e0b";
  return (
    <View className="px-4 pb-3">
      <View className="flex-row items-center gap-2 px-3 py-2" style={{ backgroundColor: verified ? "#10b98115" : "#f59e0b15" }}>
        <ShieldCheck size={14} color={color} />
        <AppText className="text-sm font-cairo-bold" style={{ color }}>
          {verified ? "موثق" : "قيد المراجعة"}
        </AppText>
      </View>
    </View>
  );
}

function ComparisonBody({ card }: { card: ComparisonCard }) {
  return (
    <View className="px-4 pb-3">
      {card.rows.map((row, index) => (
        <View key={index} className="flex-row items-center py-2" style={{ borderBottomWidth: index < card.rows.length - 1 ? 0.5 : 0, borderBottomColor: "#f1f5f9" }}>
          <AppText className="w-1/3 text-xs text-slate-500">{row[0]}</AppText>
          <AppText className="flex-1 text-sm font-cairo-bold text-slate-900">{row[1]}</AppText>
        </View>
      ))}
    </View>
  );
}

function BrokerHandoffBody({ card }: { card: BrokerHandoffCard }) {
  const title = card.handoffStatus === "qualified" ? "عميل مؤهل — جاهز للتحويل" : "معلومات إضافية مطلوبة";
  return (
    <View className="px-4 pb-3">
      <View className="flex-row items-center gap-2 px-3 py-3 bg-brand/10">
        <UserCheck size={16} color="#2563EB" />
        <AppText className="text-sm font-cairo-bold text-brand">{title}</AppText>
      </View>
    </View>
  );
}

function CardBody({ card }: { card: AIPanelResult }) {
  if (card.type === "roi_summary") return <RoiSummaryBody card={card} />;
  if (card.type === "payment_plan") return <PaymentPlanBody card={card} />;
  if (card.type === "mortgage_check") return <MortgageCheckBody card={card} />;
  if (card.type === "permit_status") return <PermitStatusBody card={card} />;
  if (card.type === "comparison_table") return <ComparisonBody card={card} />;
  return <BrokerHandoffBody card={card} />;
}

export function AIPanelResultCard({ card }: AIPanelResultCardProps) {
  const config = typeConfig[card.type] ?? { icon: BarChart3, color: "#64748b", label: card.type };
  const Icon = config.icon;
  return (
    <View className="bg-white overflow-hidden" style={{ borderWidth: 0.5, borderColor: "#e2e8f0" }}>
      <View className="flex-row items-center gap-2 px-4 pt-3 pb-2">
        <View className="h-7 w-7 items-center justify-center" style={{ backgroundColor: config.color + "15" }}>
          <Icon size={14} color={config.color} />
        </View>
        <AppText className="text-xs font-cairo-bold uppercase tracking-wide" style={{ color: config.color }}>{config.label}</AppText>
      </View>
      <View className="px-4 pb-2">
        <AppText className="text-base font-cairo-bold text-slate-900">{card.title}</AppText>
      </View>
      <CardBody card={card} />
      <View className="px-4 pb-4" style={{ borderTopWidth: 0.5, borderTopColor: "#f1f5f9" }}>
        <AppText className="text-xs text-slate-500 mt-2 leading-5">{card.summary}</AppText>
      </View>
    </View>
  );
}
