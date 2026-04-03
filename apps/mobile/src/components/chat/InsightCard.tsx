import type { ReactNode } from "react";
import { useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Percent,
  Scale,
  ShieldCheck,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react-native";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { MobilePill, MobileSectionHeading, MobileSurface } from "@/components/ui/MobileChrome";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { mobileTheme } from "@/lib/mobileTheme";
import type { MobileAssistantCard } from "@/types/mobile";

type InsightCardProps = {
  card: MobileAssistantCard;
};

type CardTone = "default" | "muted" | "highlight" | "success" | "danger";

/**
 * WHY:   Structured assistant outputs should feel like quiet extensions of the conversation, not promotional widgets.
 * WHAT:  Renders all typed insight cards with one shared Anan mobile surface language.
 * HOW:   Uses the new paper-canvas palette, premium white cards, semantic pills, and softer finance controls.
 */
export function InsightCard({ card }: InsightCardProps) {
  if (card.type === "broker_profile") {
    return (
      <CardShell title={card.title} icon={<User size={18} color={mobileTheme.colors.primary} />}>
        <MetricRow label="الوسيط" value={card.brokerName} emphasized />
        <MetricRow label="الوكالة أو الشركة" value={card.brokerAgency} />
        <MetricRow label="التقييم العام" value={`${card.rating} / 5`} />
        <MetricRow label="وحدات نشطة" value={`${card.activeListings}`} last />
        <SummaryText>{card.summary}</SummaryText>
      </CardShell>
    );
  }

  if (card.type === "developer_profile") {
    return (
      <CardShell title={card.title} icon={<Building2 size={18} color={mobileTheme.colors.primary} />}>
        <MetricRow label="المطور العقاري" value={card.developerName} emphasized />
        <MetricRow label="سنة التأسيس" value={`${card.establishedYear}`} />
        <MetricRow label="مشاريع منجزة" value={`${card.completedProjects}`} last />
        <SummaryText>{card.summary}</SummaryText>
      </CardShell>
    );
  }

  if (card.type === "market_analysis") {
    const trendDirection = card.priceTrend === "up" ? "▲" : card.priceTrend === "down" ? "▼" : "•";
    return (
      <CardShell title={card.title} icon={<TrendingUp size={18} color={mobileTheme.colors.primary} />} tone="highlight">
        <MetricRow label="المنطقة" value={card.location} emphasized />
        <MetricRow label="متوسط سعر المتر" value={formatCurrency(card.averagePrice)} />
        <MetricRow label="اتجاه السوق (سنوي)" value={`${trendDirection} ${card.trendPercentage}%`} emphasized last />
        <SummaryText>{card.summary}</SummaryText>
      </CardShell>
    );
  }

  if (card.type === "comparison_table") {
    return (
      <CardShell title={card.title} icon={<Scale size={18} color={mobileTheme.colors.primary} />} tone="muted">
        <MobileSurface tone="default" radius="card" className="overflow-hidden" padded={false} shadow="none">
          {card.rows.map((row, rowIndex) => (
            <View
              key={row.join("-")}
              className="flex-row-reverse px-4 py-3"
              style={{
                borderBottomWidth: rowIndex === card.rows.length - 1 ? 0 : 1,
                borderBottomColor: mobileTheme.colors.border,
                backgroundColor: rowIndex === 0 ? mobileTheme.colors.surfaceMuted : mobileTheme.colors.surface,
              }}
            >
              {row.map((value, columnIndex) => (
                <View key={`${value}-${columnIndex}`} className="flex-1">
                  <AppText
                    className={
                      columnIndex === 0
                        ? "text-[12px] font-cairo-black text-slate-500"
                        : rowIndex === 0
                          ? "text-[13px] font-cairo-black text-slate-900"
                          : "text-[14px] font-cairo-bold text-slate-900"
                    }
                  >
                    {value}
                  </AppText>
                </View>
              ))}
            </View>
          ))}
        </MobileSurface>
        <SummaryText compact>{card.summary}</SummaryText>
      </CardShell>
    );
  }

  if (card.type === "roi_projection") {
    return <InteractiveRoiCalculator card={card} />;
  }

  if (card.type === "roi_summary") {
    return (
      <CardShell title={card.title} icon={<Percent size={18} color={mobileTheme.colors.primary} />}>
        <MetricRow label="سعر الشراء" value={formatCurrency(card.purchasePrice)} />
        <MetricRow label="الإيجار السنوي التقديري" value={formatCurrency(card.estimatedAnnualRent)} />
        <MetricRow label="العائد الإجمالي" value={formatPercent(card.grossYieldPercent)} emphasized last />
        <SummaryText compact>{card.summary}</SummaryText>
      </CardShell>
    );
  }

  if (card.type === "loan_calculator") {
    return <InteractiveLoanCalculator card={card} />;
  }

  if (card.type === "payment_plan") {
    return (
      <CardShell title={card.title} icon={<Wallet size={18} color={mobileTheme.colors.primary} />} tone="muted">
        <MetricRow label="الدفعة الأولى" value={formatCurrency(card.downPayment)} />
        <MetricRow label="القسط الشهري" value={formatCurrency(card.monthlyInstallment)} emphasized />
        <MetricRow label="مدة السداد" value={`${card.durationMonths} شهر`} last />
        <SummaryText compact>{card.summary}</SummaryText>
      </CardShell>
    );
  }

  if (card.type === "mortgage_check") {
    return (
      <CardShell title={card.title} icon={<Wallet size={18} color={mobileTheme.colors.primary} />} tone="highlight">
        <MetricRow label="الحالة" value={eligibilityLabel(card.estimatedEligibility)} emphasized />
        {card.recommendedBudget ? <MetricRow label="ميزانية مقترحة" value={formatCurrency(card.recommendedBudget)} /> : null}
        {card.monthlyInstallmentEstimate ? (
          <MetricRow
            label="قسط تقريبي"
            value={formatCurrency(card.monthlyInstallmentEstimate)}
            last={!card.recommendedBudget}
          />
        ) : null}
        <SummaryText compact>{card.summary}</SummaryText>
      </CardShell>
    );
  }

  if (card.type === "permit_status") {
    const verified = card.permitStatus === "verified";
    return (
      <CardShell
        title={card.title}
        icon={<ShieldCheck size={18} color={verified ? mobileTheme.colors.success : mobileTheme.colors.primary} />}
        tone={verified ? "success" : "muted"}
      >
        <MetricRow label="التحقق" value={permitLabel(card.permitStatus)} emphasized last />
        <SummaryText compact>{card.summary}</SummaryText>
      </CardShell>
    );
  }

  if (card.type === "bank_offer") {
    return (
      <CardShell title={card.title} icon={<Wallet size={18} color={mobileTheme.colors.primary} />} tone="muted">
        <MetricRow label="البنك" value={card.bankName} emphasized />
        <MetricRow label="البرنامج" value={card.rateLabel} />
        <MetricRow label="الدفعة الأولى" value={`${card.downPaymentPercent}%`} />
        <MetricRow label="القسط الشهري التقريبي" value={formatCurrency(card.monthlyEstimate)} last />
        <SummaryText compact>{card.summary}</SummaryText>
      </CardShell>
    );
  }

  if (card.type === "insight_brief") {
    return (
      <CardShell title={card.title} icon={<CircleCheckBig size={18} color={mobileTheme.colors.primary} />}>
        <AppText className="text-[14px] leading-7 text-slate-600">{card.body}</AppText>
        <SummaryText compact>{card.summary}</SummaryText>
      </CardShell>
    );
  }

  if (card.type === "accent_note") {
    const tone: CardTone =
      card.tone === "success" ? "success" : card.tone === "warning" ? "danger" : "highlight";

    return (
      <CardShell title={card.title} icon={<CircleCheckBig size={18} color={mobileTheme.colors.primary} />} tone={tone}>
        <MetricRow
          label="الحالة"
          value={card.tone === "success" ? "إيجابي" : card.tone === "warning" ? "تنبيه" : "معلومة"}
          emphasized
          last
        />
        <SummaryText compact>{card.summary}</SummaryText>
      </CardShell>
    );
  }

  return (
    <CardShell title={card.title} icon={<CircleCheckBig size={18} color={mobileTheme.colors.primary} />}>
      <MetricRow label="حالة التحويل" value={card.handoffStatus === "qualified" ? "جاهز" : "يحتاج تفاصيل"} emphasized last />
      <SummaryText compact>{card.summary}</SummaryText>
    </CardShell>
  );
}

function InteractiveLoanCalculator({ card }: { card: any }) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(() =>
    Math.round((card.downPayment / card.propertyPrice) * 100) || 10,
  );
  const [years, setYears] = useState(card.years || 20);

  const downPaymentAmount = Math.round(card.propertyPrice * (downPaymentPercent / 100));
  const loanAmount = card.propertyPrice - downPaymentAmount;
  const ratePerMonth = (card.interestRate / 100) / 12;
  const paymentCount = years * 12;
  const emi =
    loanAmount > 0
      ? Math.round((loanAmount * ratePerMonth * Math.pow(1 + ratePerMonth, paymentCount)) / (Math.pow(1 + ratePerMonth, paymentCount) - 1))
      : 0;

  return (
    <CardShell title={card.title} icon={<Wallet size={18} color={mobileTheme.colors.primary} />} tone="muted">
      <MetricRow label="قيمة العقار" value={formatCurrency(card.propertyPrice)} last />

      <ControlBlock
        label="الدفعة المقدمة"
        value={`${downPaymentPercent}% (${formatCurrency(downPaymentAmount)})`}
        onDecrement={() => setDownPaymentPercent((current: number) => Math.max(10, current - 5))}
        onIncrement={() => setDownPaymentPercent((current: number) => Math.min(90, current + 5))}
      />

      <ControlBlock
        label="مدة التمويل"
        value={`${years} سنة`}
        onDecrement={() => setYears((current: number) => Math.max(5, current - 5))}
        onIncrement={() => setYears((current: number) => Math.min(30, current + 5))}
      />

      <MobileSurface tone="highlight" radius="card" shadow="none" className="px-4 py-4">
        <MetricRow label="القسط الشهري المتوقع" value={formatCurrency(emi)} emphasized last />
      </MobileSurface>
      <SummaryText compact>{card.summary}</SummaryText>
    </CardShell>
  );
}

function InteractiveRoiCalculator({ card }: { card: any }) {
  const [growthScenario, setGrowthScenario] = useState<"conservative" | "expected" | "aggressive">("expected");

  const growthRates = { conservative: 0.05, expected: 0.15, aggressive: 0.25 };
  const projectedValue = Math.round(card.purchasePrice * (1 + growthRates[growthScenario]));

  return (
    <CardShell title={card.title} icon={<Percent size={18} color={mobileTheme.colors.primary} />} tone="muted">
      <MetricRow label="سعر الشراء" value={formatCurrency(card.purchasePrice)} />
      <MetricRow label="الإيجار السنوي" value={formatCurrency(card.annualRent)} />
      <MetricRow label="عائد الإيجار السنوي" value={formatPercent(card.yieldPercent)} emphasized last />

      <MobileSurface tone="default" radius="card" shadow="none" className="px-4 py-4">
        <MobileSectionHeading
          eyebrow="SCENARIO"
          title="نمو القيمة خلال 5 سنوات"
          description="اختر السيناريو الأقرب لتوقعك حتى نعيد تقدير قيمة العقار المستقبلية."
        />

        <View className="mt-4 flex-row-reverse gap-2">
          <ScenarioOption
            label="تحفظ"
            value="5%"
            active={growthScenario === "conservative"}
            onPress={() => setGrowthScenario("conservative")}
          />
          <ScenarioOption
            label="أساسي"
            value="15%"
            active={growthScenario === "expected"}
            onPress={() => setGrowthScenario("expected")}
          />
          <ScenarioOption
            label="متفائل"
            value="25%"
            active={growthScenario === "aggressive"}
            onPress={() => setGrowthScenario("aggressive")}
          />
        </View>
      </MobileSurface>

      <MobileSurface tone="highlight" radius="card" shadow="none" className="px-4 py-4">
        <MetricRow label="القيمة المتوقعة بعد 5 سنوات" value={formatCurrency(projectedValue)} emphasized last />
      </MobileSurface>
      <SummaryText compact>{card.summary}</SummaryText>
    </CardShell>
  );
}

function CardShell({
  title,
  icon,
  children,
  tone = "default",
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  tone?: CardTone;
}) {
  return (
    <MobileSurface tone={tone} radius="card" className="w-full gap-4 px-4 py-4">
      <View
        className="flex-row-reverse items-center justify-between gap-3 pb-4"
        style={{ borderBottomWidth: 1, borderBottomColor: mobileTheme.colors.border }}
      >
        <AppText responsiveRole="bodyStrong" className="flex-1 text-right font-cairo-black text-slate-900">
          {title}
        </AppText>
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 40,
            height: 40,
            backgroundColor: tone === "highlight" ? mobileTheme.colors.surface : mobileTheme.colors.surfaceMuted,
            borderWidth: 1,
            borderColor: mobileTheme.colors.border,
          }}
        >
          {icon}
        </View>
      </View>
      {children}
    </MobileSurface>
  );
}

function MetricRow({
  label,
  value,
  emphasized = false,
  last = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  last?: boolean;
}) {
  return (
    <View
      className="w-full flex-row-reverse items-center justify-between py-3"
      style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: mobileTheme.colors.border }}
    >
      <AppText responsiveRole="chip" className="max-w-[48%] font-cairo-black text-slate-500">
        {label}
      </AppText>
      <AppText
        responsiveRole={emphasized ? "bodyStrong" : "body"}
        className={emphasized ? "max-w-[48%] text-left font-cairo-black text-blue-700" : "max-w-[48%] text-left font-cairo-bold text-slate-900"}
      >
        {value}
      </AppText>
    </View>
  );
}

function SummaryText({ children, compact = false }: { children: string; compact?: boolean }) {
  return (
    <AppText className={compact ? "text-[13px] leading-6 text-slate-500" : "text-[14px] leading-7 text-slate-600"}>
      {children}
    </AppText>
  );
}

function ControlBlock({
  label,
  value,
  onDecrement,
  onIncrement,
}: {
  label: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <MobileSurface tone="default" radius="card" shadow="none" className="px-4 py-4">
      <View className="mb-4 flex-row-reverse items-center justify-between gap-4">
        <AppText className="text-[13px] font-cairo-black text-slate-500">{label}</AppText>
        <AppText className="flex-1 text-left text-[15px] font-cairo-black text-slate-900">{value}</AppText>
      </View>

      <View
        className="flex-row-reverse items-center justify-between p-1"
        style={{
          borderRadius: mobileTheme.radii.pill,
          borderWidth: 1,
          borderColor: mobileTheme.colors.border,
          backgroundColor: mobileTheme.colors.surfaceMuted,
        }}
      >
        <StepButton icon={<ChevronRight size={18} color={mobileTheme.colors.inkMuted} />} onPress={onDecrement} />
        <MobilePill label={value} tone="dark" active />
        <StepButton icon={<ChevronLeft size={18} color={mobileTheme.colors.inkMuted} />} onPress={onIncrement} />
      </View>
    </MobileSurface>
  );
}

function StepButton({ icon, onPress }: { icon: ReactNode; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center rounded-full"
      style={{
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: mobileTheme.colors.border,
        backgroundColor: mobileTheme.colors.surface,
      }}
    >
      {icon}
    </Pressable>
  );
}

function ScenarioOption({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center px-3 py-3"
      style={{
        borderRadius: mobileTheme.radii.card - 8,
        borderWidth: 1,
        borderColor: active ? "#D4E2FF" : mobileTheme.colors.border,
        backgroundColor: active ? mobileTheme.colors.primarySoft : mobileTheme.colors.surface,
      }}
    >
      <AppText className={active ? "text-[12px] font-cairo-black text-blue-700" : "text-[12px] font-cairo-black text-slate-700"}>
        {label}
      </AppText>
      <AppText className={active ? "mt-1 text-[11px] font-cairo-black text-blue-600" : "mt-1 text-[11px] font-cairo-black text-slate-500"}>
        {value}
      </AppText>
    </Pressable>
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
