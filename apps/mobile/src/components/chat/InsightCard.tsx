import type { ReactNode } from "react";
import { useState } from "react";
import { CircleCheckBig, Percent, Scale, ShieldCheck, Wallet, User, Building2, TrendingUp } from "lucide-react-native";
import { View, Pressable } from "react-native";
import { formatCurrency, formatPercent } from "@/lib/mvp/formatters";
import { AppText } from "@/components/ui/AppText";
import type { CapabilityResultCard } from "@/types/chat";

type InsightCardProps = {
  card: CapabilityResultCard;
};

/**
 * WHY:   Assistant replies should present structured financial and journey insights instead of raw prose blobs.
 * WHAT:  Renders one typed insight card for ROI, financing, comparison, permits, or handoff.
 * HOW:   Switches on the card type and maps each one to a restrained mobile-ready layout, some interactive.
 */
export function InsightCard({ card }: InsightCardProps) {
  if (card.type === "broker_profile") {
    return (
      <CardShell title={card.title} icon={<User size={16} color="#2563EB" />}>
        <MetricRow label="الوسيط" value={card.brokerName} emphasized />
        <MetricRow label="الوكالة أو الشركة" value={card.brokerAgency} />
        <MetricRow label="التقييم العام" value={`${card.rating} / 5`} />
        <MetricRow label="وحدات نشطة" value={`${card.activeListings}`} />
        <AppText className="text-sm leading-6 text-muted mt-2">{card.summary}</AppText>
      </CardShell>
    );
  }

  if (card.type === "developer_profile") {
    return (
      <CardShell title={card.title} icon={<Building2 size={16} color="#2563EB" />}>
        <MetricRow label="المطور العقاري" value={card.developerName} emphasized />
        <MetricRow label="سنة التأسيس" value={`${card.establishedYear}`} />
        <MetricRow label="مشاريع منجزة" value={`${card.completedProjects}`} />
        <AppText className="text-sm leading-6 text-muted mt-2">{card.summary}</AppText>
      </CardShell>
    );
  }

  if (card.type === "market_analysis") {
    return (
      <CardShell title={card.title} icon={<TrendingUp size={16} color="#2563EB" />}>
        <MetricRow label="المنطقة" value={card.location} emphasized />
        <MetricRow label="متوسط سعر المتر" value={formatCurrency(card.averagePrice)} />
        <MetricRow 
          label="اتجاه السوق (سنوي)" 
          value={`${card.priceTrend === "up" ? "▲" : card.priceTrend === "down" ? "▼" : "-"} ${card.trendPercentage}%`} 
          emphasized 
        />
        <AppText className="text-sm leading-6 text-muted mt-2">{card.summary}</AppText>
      </CardShell>
    );
  }
  if (card.type === "comparison_table") {
    return (
      <CardShell title={card.title} icon={<Scale size={16} color="#2563EB" />}>
        <View className="overflow-hidden border border-line">
          {card.rows.map((row) => (
            <View key={row.join("-")} className="flex-row-reverse border-b border-line bg-white px-3 py-2 last:border-b-0">
              {row.map((value, index) => (
                <View key={`${value}-${index}`} className="flex-1">
                  <AppText className={index === 0 ? "text-xs text-muted" : "text-sm text-ink"}>{value}</AppText>
                </View>
              ))}
            </View>
          ))}
        </View>
        <AppText className="text-sm leading-6 text-muted">{card.summary}</AppText>
      </CardShell>
    );
  }

  if (card.type === "roi_projection") {
    return <InteractiveRoiCalculator card={card} />;
  }

  if (card.type === "roi_summary") {
    return (
      <CardShell title={card.title} icon={<Percent size={16} color="#2563EB" />}>
        <MetricRow label="سعر الشراء" value={formatCurrency(card.purchasePrice)} />
        <MetricRow label="الإيجار السنوي التقديري" value={formatCurrency(card.estimatedAnnualRent)} />
        <MetricRow label="العائد الإجمالي" value={formatPercent(card.grossYieldPercent)} emphasized />
        <AppText className="text-sm leading-6 text-muted">{card.summary}</AppText>
      </CardShell>
    );
  }

  if (card.type === "loan_calculator") {
    return <InteractiveLoanCalculator card={card} />;
  }

  if (card.type === "payment_plan") {
    return (
      <CardShell title={card.title} icon={<Wallet size={16} color="#2563EB" />}>
        <MetricRow label="الدفعة الأولى" value={formatCurrency(card.downPayment)} />
        <MetricRow label="القسط الشهري" value={formatCurrency(card.monthlyInstallment)} emphasized />
        <MetricRow label="مدة السداد" value={`${card.durationMonths} شهر`} />
        <AppText className="text-sm leading-6 text-muted">{card.summary}</AppText>
      </CardShell>
    );
  }

  if (card.type === "mortgage_check") {
    return (
      <CardShell title={card.title} icon={<Wallet size={16} color="#2563EB" />}>
        <MetricRow label="الحالة" value={eligibilityLabel(card.estimatedEligibility)} emphasized />
        {card.recommendedBudget ? <MetricRow label="ميزانية مقترحة" value={formatCurrency(card.recommendedBudget)} /> : null}
        {card.monthlyInstallmentEstimate ? (
          <MetricRow label="قسط تقريبي" value={formatCurrency(card.monthlyInstallmentEstimate)} />
        ) : null}
        <AppText className="text-sm leading-6 text-muted">{card.summary}</AppText>
      </CardShell>
    );
  }

  if (card.type === "permit_status") {
    return (
      <CardShell title={card.title} icon={<ShieldCheck size={16} color="#2563EB" />}>
        <MetricRow label="التحقق" value={permitLabel(card.permitStatus)} emphasized />
        <AppText className="text-sm leading-6 text-muted">{card.summary}</AppText>
      </CardShell>
    );
  }

  return (
    <CardShell title={card.title} icon={<CircleCheckBig size={16} color="#2563EB" />}>
      <MetricRow label="حالة التحويل" value={card.handoffStatus === "qualified" ? "جاهز" : "يحتاج تفاصيل"} emphasized />
      <AppText className="text-sm leading-6 text-muted">{card.summary}</AppText>
    </CardShell>
  );
}

function InteractiveLoanCalculator({ card }: { card: any }) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(() => 
    Math.round((card.downPayment / card.propertyPrice) * 100) || 10
  );
  const [years, setYears] = useState(card.years || 20);

  const downPaymentAmount = Math.round(card.propertyPrice * (downPaymentPercent / 100));
  const loanAmount = card.propertyPrice - downPaymentAmount;
  
  const r = (card.interestRate / 100) / 12;
  const n = years * 12;
  const emi = loanAmount > 0 
      ? Math.round((loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
      : 0;

  return (
    <CardShell title={card.title} icon={<Wallet size={16} color="#2563EB" />}>
      <MetricRow label="قيمة العقار" value={formatCurrency(card.propertyPrice)} />
      
      <View className="py-3 border-b border-line">
         <View className="flex-row-reverse justify-between items-center mb-2">
            <AppText className="text-sm text-muted">الدفعة المقدمة</AppText>
            <AppText className="text-sm text-ink font-cairo-bold">{downPaymentPercent}% ({formatCurrency(downPaymentAmount)})</AppText>
         </View>
         <View className="flex-row-reverse items-center justify-between bg-panel border border-line rounded p-1">
            <Pressable onPress={() => setDownPaymentPercent((p: number) => Math.max(10, p - 5))} className="px-3 py-1 bg-white rounded border border-line">
               <AppText className="text-sm">- 5%</AppText>
            </Pressable>
            <AppText className="text-sm font-cairo-bold">{downPaymentPercent}%</AppText>
            <Pressable onPress={() => setDownPaymentPercent((p: number) => Math.min(90, p + 5))} className="px-3 py-1 bg-white rounded border border-line">
               <AppText className="text-sm">+ 5%</AppText>
            </Pressable>
         </View>
      </View>

      <View className="py-3 border-b border-line">
         <View className="flex-row-reverse justify-between items-center mb-2">
            <AppText className="text-sm text-muted">مدة التمويل</AppText>
            <AppText className="text-sm text-ink font-cairo-bold">{years} سنة</AppText>
         </View>
         <View className="flex-row-reverse items-center justify-between bg-panel border border-line rounded p-1">
            <Pressable onPress={() => setYears((y: number) => Math.max(5, y - 5))} className="px-3 py-1 bg-white rounded border border-line">
               <AppText className="text-sm">- 5</AppText>
            </Pressable>
            <AppText className="text-sm font-cairo-bold">{years} سنين</AppText>
            <Pressable onPress={() => setYears((y: number) => Math.min(30, y + 5))} className="px-3 py-1 bg-white rounded border border-line">
               <AppText className="text-sm">+ 5</AppText>
            </Pressable>
         </View>
      </View>

      <View className="pt-3 pb-1">
         <MetricRow label="القسط الشهري المتوقع" value={formatCurrency(emi)} emphasized />
      </View>
      <AppText className="text-xs leading-5 text-muted">{card.summary}</AppText>
    </CardShell>
  );
}

function InteractiveRoiCalculator({ card }: { card: any }) {
  const [growthScenario, setGrowthScenario] = useState<"conservative" | "expected" | "aggressive">("expected");

  const growthRates = { conservative: 0.05, expected: 0.15, aggressive: 0.25 };
  const rate = growthRates[growthScenario];
  const projectedValue = Math.round(card.purchasePrice * (1 + rate));

  return (
    <CardShell title={card.title} icon={<Percent size={16} color="#2563EB" />}>
      <MetricRow label="سعر الشراء" value={formatCurrency(card.purchasePrice)} />
      <MetricRow label="الإيجار السنوي" value={formatCurrency(card.annualRent)} />
      <MetricRow label="عائد الإيجار السنوي" value={formatPercent(card.yieldPercent)} emphasized />
      
      <View className="py-4 border-b border-line">
         <AppText className="text-sm text-muted mb-3 text-right">معدل نمو القيمة الرأسمالية (5 سنوات)</AppText>
         <View className="flex-row-reverse border border-line rounded overflow-hidden">
            <Pressable 
              onPress={() => setGrowthScenario("conservative")}
              className={`flex-1 p-2 items-center ${growthScenario === "conservative" ? "bg-brand" : "bg-panel"}`}
            >
               <AppText className={`text-xs ${growthScenario === "conservative" ? "text-white font-cairo-bold" : "text-ink"}`}>تحفظ 5%</AppText>
            </Pressable>
            <Pressable 
              onPress={() => setGrowthScenario("expected")}
              className={`flex-1 p-2 items-center border-x border-line ${growthScenario === "expected" ? "bg-brand" : "bg-panel"}`}
            >
               <AppText className={`text-xs ${growthScenario === "expected" ? "text-white font-cairo-bold" : "text-ink"}`}>أساسي 15%</AppText>
            </Pressable>
            <Pressable 
              onPress={() => setGrowthScenario("aggressive")}
              className={`flex-1 p-2 items-center ${growthScenario === "aggressive" ? "bg-brand" : "bg-panel"}`}
            >
               <AppText className={`text-xs ${growthScenario === "aggressive" ? "text-white font-cairo-bold" : "text-ink"}`}>متفائل 25%</AppText>
            </Pressable>
         </View>
      </View>
      
      <View className="pt-3 pb-1">
        <MetricRow label="القيمة المتوقعة بعد 5 سنوات" value={formatCurrency(projectedValue)} emphasized />
      </View>
      <AppText className="text-xs leading-5 text-muted">{card.summary}</AppText>
    </CardShell>
  );
}

function CardShell({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <View className="gap-3 border border-line bg-white px-4 py-4 w-full">
      <View className="flex-row-reverse items-center gap-2">
        <View className="h-8 w-8 items-center justify-center border border-line bg-panel">{icon}</View>
        <AppText tone="headline" className="text-base text-ink">
          {title}
        </AppText>
      </View>
      {children}
    </View>
  );
}

function MetricRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <View className="flex-row-reverse items-center justify-between border-b border-line pb-2 last:border-b-0 w-full">
      <AppText className="text-sm text-muted max-w-[50%]">{label}</AppText>
      <AppText className={emphasized ? "text-sm font-cairo-bold text-brand" : "text-sm text-ink max-w-[50%] text-left"}>{value}</AppText>
    </View>
  );
}

function eligibilityLabel(value: "eligible" | "review" | "insufficient_data") {
  if (value === "eligible") return "مؤهل مبدئياً";
  if (value === "review") return "بحاجة مراجعة";
  return "نحتاج بيانات إضافية";
}

function permitLabel(value: "verified" | "pending_review" | "not_available") {
  if (value === "verified") return "موثق";
  if (value === "pending_review") return "مراجعة معلقة";
  return "غير متاح";
}
