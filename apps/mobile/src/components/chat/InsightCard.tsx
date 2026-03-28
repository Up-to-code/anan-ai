import type { ReactNode } from "react";
import { useState } from "react";
import { CircleCheckBig, Percent, Scale, ShieldCheck, Wallet, User, Building2, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react-native";
import { View, Pressable } from "react-native";
import { formatCurrency, formatPercent } from "@/lib/mvp/formatters";
import { AppText } from "@/components/ui/AppText";
import type { CapabilityResultCard } from "@/types/chat";

type InsightCardProps = {
  card: CapabilityResultCard;
};

/**
 * WHY:   The Nexus design requires structured cards to feel like integrated HUD elements.
 * WHAT:  Modernizes the InsightCard with rounded-3xl geometry, Cairo font weights, and high-contrast styling.
 * HOW:   Uses rounded-[32px] for the main shelf and high-contrast MetricRows for clear scanning.
 */
export function InsightCard({ card }: InsightCardProps) {
  if (card.type === "broker_profile") {
    return (
      <CardShell title={card.title} icon={<User size={18} color="#2563EB" />}>
        <MetricRow label="الوسيط" value={card.brokerName} emphasized />
        <MetricRow label="الوكالة أو الشركة" value={card.brokerAgency} />
        <MetricRow label="التقييم العام" value={`${card.rating} / 5`} />
        <MetricRow label="وحدات نشطة" value={`${card.activeListings}`} />
        <AppText className="text-[14px] leading-6 text-slate-500 mt-4 font-medium px-1">{card.summary}</AppText>
      </CardShell>
    );
  }

  if (card.type === "developer_profile") {
    return (
      <CardShell title={card.title} icon={<Building2 size={18} color="#2563EB" />}>
        <MetricRow label="المطور العقاري" value={card.developerName} emphasized />
        <MetricRow label="سنة التأسيس" value={`${card.establishedYear}`} />
        <MetricRow label="مشاريع منجزة" value={`${card.completedProjects}`} />
        <AppText className="text-[14px] leading-6 text-slate-500 mt-4 font-medium px-1">{card.summary}</AppText>
      </CardShell>
    );
  }

  if (card.type === "market_analysis") {
    return (
      <CardShell title={card.title} icon={<TrendingUp size={18} color="#2563EB" />}>
        <MetricRow label="المنطقة" value={card.location} emphasized />
        <MetricRow label="متوسط سعر المتر" value={formatCurrency(card.averagePrice)} />
        <MetricRow 
          label="اتجاه السوق (سنوي)" 
          value={`${card.priceTrend === "up" ? "▲" : card.priceTrend === "down" ? "▼" : "-"} ${card.trendPercentage}%`} 
          emphasized 
        />
        <AppText className="text-[14px] leading-6 text-slate-500 mt-4 font-medium px-1">{card.summary}</AppText>
      </CardShell>
    );
  }

  if (card.type === "comparison_table") {
    return (
      <CardShell title={card.title} icon={<Scale size={18} color="#2563EB" />}>
        <View className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
          {card.rows.map((row, idx) => (
            <View key={row.join("-")} className={`flex-row-reverse border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 ${idx === card.rows.length - 1 ? "border-b-0" : ""}`}>
              {row.map((value, index) => (
                <View key={`${value}-${index}`} className="flex-1">
                  <AppText className={index === 0 ? "text-[12px] font-black uppercase text-slate-400" : "text-[14px] font-cairo-bold text-slate-900 dark:text-slate-100"}>{value}</AppText>
                </View>
              ))}
            </View>
          ))}
        </View>
        <AppText className="text-[14px] leading-6 text-slate-500 mt-2 px-1">{card.summary}</AppText>
      </CardShell>
    );
  }

  if (card.type === "roi_projection") {
    return <InteractiveRoiCalculator card={card} />;
  }

  if (card.type === "roi_summary") {
    return (
      <CardShell title={card.title} icon={<Percent size={18} color="#2563EB" />}>
        <MetricRow label="سعر الشراء" value={formatCurrency(card.purchasePrice)} />
        <MetricRow label="الإيجار السنوي التقديري" value={formatCurrency(card.estimatedAnnualRent)} />
        <MetricRow label="العائد الإجمالي" value={formatPercent(card.grossYieldPercent)} emphasized />
        <AppText className="text-[14px] leading-6 text-slate-500 mt-2 px-1">{card.summary}</AppText>
      </CardShell>
    );
  }

  if (card.type === "loan_calculator") {
    return <InteractiveLoanCalculator card={card} />;
  }

  if (card.type === "payment_plan") {
    return (
      <CardShell title={card.title} icon={<Wallet size={18} color="#2563EB" />}>
        <MetricRow label="الدفعة الأولى" value={formatCurrency(card.downPayment)} />
        <MetricRow label="القسط الشهري" value={formatCurrency(card.monthlyInstallment)} emphasized />
        <MetricRow label="مدة السداد" value={`${card.durationMonths} شهر`} />
        <AppText className="text-[14px] leading-6 text-slate-500 mt-2 px-1">{card.summary}</AppText>
      </CardShell>
    );
  }

  if (card.type === "mortgage_check") {
    return (
      <CardShell title={card.title} icon={<Wallet size={18} color="#2563EB" />}>
        <MetricRow label="الحالة" value={eligibilityLabel(card.estimatedEligibility)} emphasized />
        {card.recommendedBudget ? <MetricRow label="ميزانية مقترحة" value={formatCurrency(card.recommendedBudget)} /> : null}
        {card.monthlyInstallmentEstimate ? (
          <MetricRow label="قسط تقريبي" value={formatCurrency(card.monthlyInstallmentEstimate)} />
        ) : null}
        <AppText className="text-[14px] leading-6 text-slate-500 mt-2 px-1">{card.summary}</AppText>
      </CardShell>
    );
  }

  if (card.type === "permit_status") {
    return (
      <CardShell title={card.title} icon={<ShieldCheck size={18} color="#2563EB" />}>
        <MetricRow label="التحقق" value={permitLabel(card.permitStatus)} emphasized />
        <AppText className="text-[14px] leading-6 text-slate-500 mt-2 px-1">{card.summary}</AppText>
      </CardShell>
    );
  }

  return (
    <CardShell title={card.title} icon={<CircleCheckBig size={18} color="#2563EB" />}>
      <MetricRow label="حالة التحويل" value={card.handoffStatus === "qualified" ? "جاهز" : "يحتاج تفاصيل"} emphasized />
      <AppText className="text-[14px] leading-6 text-slate-500 mt-2 px-1">{card.summary}</AppText>
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
    <CardShell title={card.title} icon={<Wallet size={18} color="#2563EB" />}>
      <MetricRow label="قيمة العقار" value={formatCurrency(card.propertyPrice)} />
      
      <View className="py-4 border-b border-slate-50 dark:border-slate-800">
         <View className="flex-row-reverse justify-between items-center mb-4">
            <AppText className="text-[13px] font-black uppercase text-slate-400">الدفعة المقدمة</AppText>
            <AppText className="text-[15px] text-slate-900 dark:text-slate-50 font-cairo-black">{downPaymentPercent}% ({formatCurrency(downPaymentAmount)})</AppText>
         </View>
         <View className="flex-row-reverse items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-full p-1">
            <Pressable onPress={() => setDownPaymentPercent((p: number) => Math.max(10, p - 5))} className="h-10 w-10 items-center justify-center bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800">
               <ChevronRight size={20} color="#94A3B8" />
            </Pressable>
            <AppText className="text-[15px] font-cairo-black text-slate-900 dark:text-slate-50">{downPaymentPercent}%</AppText>
            <Pressable onPress={() => setDownPaymentPercent((p: number) => Math.min(90, p + 5))} className="h-10 w-10 items-center justify-center bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800">
               <ChevronLeft size={20} color="#94A3B8" />
            </Pressable>
         </View>
      </View>

      <View className="py-4 border-b border-slate-50 dark:border-slate-800">
         <View className="flex-row-reverse justify-between items-center mb-4">
            <AppText className="text-[13px] font-black uppercase text-slate-400">مدة التمويل</AppText>
            <AppText className="text-[15px] text-slate-900 dark:text-slate-50 font-cairo-black">{years} سنة</AppText>
         </View>
         <View className="flex-row-reverse items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-full p-1">
            <Pressable onPress={() => setYears((y: number) => Math.max(5, y - 5))} className="h-10 w-10 items-center justify-center bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800">
               <ChevronRight size={20} color="#94A3B8" />
            </Pressable>
            <AppText className="text-[15px] font-cairo-black text-slate-900 dark:text-slate-50">{years} سنين</AppText>
            <Pressable onPress={() => setYears((y: number) => Math.min(30, y + 5))} className="h-10 w-10 items-center justify-center bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800">
               <ChevronLeft size={20} color="#94A3B8" />
            </Pressable>
         </View>
      </View>

      <View className="pt-5 pb-2">
         <MetricRow label="القسط الشهري المتوقع" value={formatCurrency(emi)} emphasized />
      </View>
      <AppText className="text-[12px] leading-5 text-slate-400 font-medium px-1">{card.summary}</AppText>
    </CardShell>
  );
}

function InteractiveRoiCalculator({ card }: { card: any }) {
  const [growthScenario, setGrowthScenario] = useState<"conservative" | "expected" | "aggressive">("expected");

  const growthRates = { conservative: 0.05, expected: 0.15, aggressive: 0.25 };
  const rate = growthRates[growthScenario];
  const projectedValue = Math.round(card.purchasePrice * (1 + rate));

  return (
    <CardShell title={card.title} icon={<Percent size={18} color="#2563EB" />}>
      <MetricRow label="سعر الشراء" value={formatCurrency(card.purchasePrice)} />
      <MetricRow label="الإيجار السنوي" value={formatCurrency(card.annualRent)} />
      <MetricRow label="عائد الإيجار السنوي" value={formatPercent(card.yieldPercent)} emphasized />
      
      <View className="py-5 border-b border-slate-50 dark:border-slate-800">
         <AppText className="text-[13px] font-black uppercase text-slate-400 mb-4 text-right">معدل نمو القيمة (5 سنوات)</AppText>
         <View className="flex-row-reverse bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-full overflow-hidden p-1">
            <Pressable 
              onPress={() => setGrowthScenario("conservative")}
              className={`flex-1 py-2.5 items-center rounded-full ${growthScenario === "conservative" ? "bg-slate-900 text-white" : ""}`}
            >
               <AppText className={`text-[12px] font-cairo-black ${growthScenario === "conservative" ? "text-white" : "text-slate-500 uppercase tracking-widest"}`}>تحفظ 5%</AppText>
            </Pressable>
            <Pressable 
              onPress={() => setGrowthScenario("expected")}
              className={`flex-1 py-2.5 items-center rounded-full ${growthScenario === "expected" ? "bg-slate-900 text-white" : ""}`}
            >
               <AppText className={`text-[12px] font-cairo-black ${growthScenario === "expected" ? "text-white" : "text-slate-500 uppercase tracking-widest"}`}>أساسي 15%</AppText>
            </Pressable>
            <Pressable 
              onPress={() => setGrowthScenario("aggressive")}
              className={`flex-1 py-2.5 items-center rounded-full ${growthScenario === "aggressive" ? "bg-slate-900 text-white" : ""}`}
            >
               <AppText className={`text-[12px] font-cairo-black ${growthScenario === "aggressive" ? "text-white" : "text-slate-500 uppercase tracking-widest"}`}>متفائل 25%</AppText>
            </Pressable>
         </View>
      </View>
      
      <View className="pt-5 pb-2">
        <MetricRow label="القيمة المتوقعة بعد 5 سنوات" value={formatCurrency(projectedValue)} emphasized />
      </View>
      <AppText className="text-[12px] leading-5 text-slate-400 font-medium px-1">{card.summary}</AppText>
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
    <View className="gap-4 w-full py-4">
      <View className="flex-row-reverse items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-800 pb-4">
        <AppText className="text-[16px] font-cairo-black text-slate-900 dark:text-slate-100 flex-1 text-right">
          {title}
        </AppText>
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">{icon}</View>
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
    <View className="flex-row-reverse items-center justify-between border-b border-slate-50 dark:border-slate-800 py-3 last:border-b-0 w-full">
      <AppText className="text-[13px] font-bold text-slate-400 dark:text-slate-500 max-w-[50%] uppercase tracking-wider">{label}</AppText>
      <AppText className={emphasized ? "text-[15px] font-cairo-black text-primary" : "text-[14px] font-cairo-bold text-slate-900 dark:text-slate-100 max-w-[50%] text-left"}>{value}</AppText>
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
