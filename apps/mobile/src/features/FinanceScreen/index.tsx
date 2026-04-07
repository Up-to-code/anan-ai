import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calculator, Landmark, Percent, Wallet } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { MobileSectionHeading, MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { useBuyerFinance } from "@/hooks/useBuyerFinance";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";
import { formatCurrency } from "@/lib/formatters";
import { getPropertyLocationLabel } from "@/lib/mobileData";
import { useAppTheme } from "@/lib/mobileTheme";

function parseNumberInput(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * WHY:   Buyers need a real property-linked financing workspace instead of a single fixed estimate.
 * WHAT:  Renders editable finance assumptions, a live estimate summary, and bank-option previews for the active property.
 * HOW:   Seeds the form from buyer account defaults and property metadata, then resolves the scenario through the shared finance hook.
 */
export default function FinanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const account = useBuyerAccount();
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { property, isLoading: isPropertyLoading } = usePropertyDetail(propertyId);

  const propertyPrice = property?.price ?? 1_200_000;
  const initialDownPayment = useMemo(
    () =>
      property?.finance?.defaultDownPayment ??
      Math.round(propertyPrice * (account.viewer.preferences.financeDefaults.downPaymentPercent / 100)),
    [account.viewer.preferences.financeDefaults.downPaymentPercent, property?.finance?.defaultDownPayment, propertyPrice],
  );

  const [downPaymentInput, setDownPaymentInput] = useState(String(initialDownPayment));
  const [yearsInput, setYearsInput] = useState(String(property?.finance?.defaultYears ?? account.viewer.preferences.financeDefaults.preferredYears));
  const [rateInput, setRateInput] = useState(String(property?.finance?.defaultAnnualRate ?? account.viewer.preferences.financeDefaults.annualRate));
  const [salaryInput, setSalaryInput] = useState("");

  useEffect(() => {
    setDownPaymentInput(String(initialDownPayment));
  }, [initialDownPayment]);

  useEffect(() => {
    setYearsInput(String(property?.finance?.defaultYears ?? account.viewer.preferences.financeDefaults.preferredYears));
    setRateInput(String(property?.finance?.defaultAnnualRate ?? account.viewer.preferences.financeDefaults.annualRate));
  }, [
    account.viewer.preferences.financeDefaults.annualRate,
    account.viewer.preferences.financeDefaults.preferredYears,
    property?.finance?.defaultAnnualRate,
    property?.finance?.defaultYears,
  ]);

  const downPayment = parseNumberInput(downPaymentInput);
  const years = Math.max(1, parseNumberInput(yearsInput));
  const annualRate = Math.max(0, parseNumberInput(rateInput));
  const monthlySalary = parseNumberInput(salaryInput);

  const finance = useBuyerFinance({
    propertyId: property?.id,
    propertyTitle: property?.title,
    propertyPrice,
    downPayment,
    annualRate,
    years,
    monthlySalary: monthlySalary > 0 ? monthlySalary : undefined,
  });

  async function persistCurrentDefaults() {
    await account.updateFinanceDefaults({
      downPaymentPercent: propertyPrice > 0 ? Math.round((downPayment / propertyPrice) * 100) : account.viewer.preferences.financeDefaults.downPaymentPercent,
      preferredYears: years,
      annualRate,
    });
  }

  if (isPropertyLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.canvas }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        title="التمويل"
        subtitle="سيناريو حي داخل نفس الرحلة"
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        trailing={
          <View
            className="items-center justify-center rounded-full"
            style={{ width: 44, height: 44, backgroundColor: theme.colors.surfaceMuted }}
          >
            <Calculator size={18} color={theme.colors.inkMuted} />
          </View>
        }
      />

      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 32) + 32 }}>
        <View className="gap-5">
          <MobileSurface tone="muted" radius="hero" className="gap-4">
            <MobileSectionHeading
              eyebrow="العقار المرجعي"
              title={property?.title ?? "سيناريو تمويل عام"}
              description={property ? getPropertyLocationLabel(property) : "يمكنك استخدام هذا السيناريو حتى قبل اختيار عقار محدد."}
            />

            <View className="flex-row-reverse" style={{ gap: 12 }}>
              <MetricCard icon={Wallet} label="سعر العقار" value={formatCurrency(propertyPrice)} />
              <MetricCard
                icon={Landmark}
                label="عدد عروض البنك"
                value={String(property?.finance?.bankOfferCount ?? finance.estimate.bankOffers.length)}
              />
            </View>
          </MobileSurface>

          <MobileSurface radius="hero" className="gap-4">
            <MobileSectionHeading
              eyebrow="افتراضات المشتري"
              title="عدّل السيناريو"
              description="كل تغيير ينعكس مباشرة على التقدير الحالي ويمكن حفظه كافتراض افتراضي لاحقاً."
            />

            <FinanceInput
              label="الدفعة الأولى"
              value={downPaymentInput}
              onChangeText={setDownPaymentInput}
              placeholder={String(initialDownPayment)}
            />
            <FinanceInput
              label="مدة السداد (سنة)"
              value={yearsInput}
              onChangeText={setYearsInput}
              placeholder="20"
            />
            <FinanceInput
              label="نسبة الفائدة السنوية"
              value={rateInput}
              onChangeText={setRateInput}
              placeholder="4.75"
            />
            <FinanceInput
              label="الراتب الشهري"
              value={salaryInput}
              onChangeText={setSalaryInput}
              placeholder="اختياري لتحليل القدرة"
            />

            <Button label="احفظ هذه الافتراضات" variant="secondary" onPress={() => void persistCurrentDefaults()} />
          </MobileSurface>

          <MobileSurface radius="hero" className="gap-4">
            <MobileSectionHeading
              eyebrow="التقدير الحالي"
              title={formatCurrency(finance.estimate.monthlyPayment)}
              description={finance.estimate.summary}
            />

            <View className="flex-row-reverse flex-wrap" style={{ gap: 12 }}>
              <MetricPill label="قيمة التمويل" value={formatCurrency(finance.estimate.loanAmount)} />
              <MetricPill label="إجمالي الفائدة" value={formatCurrency(finance.estimate.totalInterest)} />
              <MetricPill label="إجمالي المدفوع" value={formatCurrency(finance.estimate.totalPaid)} />
            </View>

            <View
              className="rounded-[20px] px-4 py-4"
              style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }}
            >
              <View className="flex-row-reverse items-center gap-2">
                <Percent size={16} color={theme.colors.primary} />
                <AppText className="text-right text-[14px] font-cairo-bold" style={{ color: theme.colors.ink }}>
                  حالة القدرة
                </AppText>
              </View>
              <AppText className="mt-2 text-right text-[15px] font-cairo-black" style={{ color: theme.colors.primary }}>
                {finance.estimate.affordabilityStatus === "comfortable"
                  ? "مريح"
                  : finance.estimate.affordabilityStatus === "review"
                    ? "يحتاج مراجعة"
                    : "مرهق"}
              </AppText>
              {finance.estimate.recommendedBudget ? (
                <AppText className="mt-1 text-right text-[13px] font-medium" style={{ color: theme.colors.inkMuted }}>
                  الميزانية التقديرية المناسبة: {formatCurrency(finance.estimate.recommendedBudget)}
                </AppText>
              ) : (
                <AppText className="mt-1 text-right text-[13px] font-medium" style={{ color: theme.colors.inkMuted }}>
                  أضف الراتب الشهري لتحصل على قراءة أوضح للقدرة.
                </AppText>
              )}
            </View>
          </MobileSurface>

          <MobileSurface radius="hero" className="gap-4">
            <MobileSectionHeading
              eyebrow="عروض بنكية"
              title={finance.estimate.bankOffers.length > 0 ? "مقارنة أولية" : "لا توجد عروض بنكية حالياً"}
              description={
                finance.estimate.bankOffers.length > 0
                  ? "تم ربط التقدير بأقرب المنتجات البنكية المتاحة لهذا العقار."
                  : "سيظل التقدير العام متاحاً حتى لو لم يكن للعقار بنك مرتبط بعد."
              }
            />

            {finance.isLoading ? (
              <View className="py-6 items-center justify-center">
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : (
              finance.estimate.bankOffers.map((offer) => (
                <View
                  key={`${offer.bankName}-${offer.rateLabel}`}
                  className="rounded-[20px] px-4 py-4"
                  style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }}
                >
                  <View className="flex-row-reverse items-start justify-between gap-3">
                    <View className="items-end">
                      <AppText className="text-right text-[16px] font-cairo-black" style={{ color: theme.colors.ink }}>
                        {offer.bankName}
                      </AppText>
                      <AppText className="mt-1 text-right text-[13px] font-medium" style={{ color: theme.colors.inkMuted }}>
                        {offer.summary}
                      </AppText>
                    </View>
                    <MobileSurface padded={false} radius="pill" className="px-3 py-2" tone="highlight">
                      <AppText className="text-[12px] font-cairo-bold" style={{ color: theme.colors.primary }}>
                        {offer.rateLabel}
                      </AppText>
                    </MobileSurface>
                  </View>

                  <View className="mt-3 flex-row-reverse" style={{ gap: 12 }}>
                    <MetricPill label="دفعة أولى" value={`${offer.downPaymentPercent}%`} />
                    <MetricPill label="قسط تقديري" value={formatCurrency(offer.monthlyEstimate)} />
                  </View>
                </View>
              ))
            )}
          </MobileSurface>

          <View className="gap-3 pb-4">
            <Button
              label="العودة إلى المساعد"
              onPress={() =>
                router.replace({
                  pathname: "/",
                  params: property ? { propertyId: property.id } : undefined,
                })
              }
            />
            {property ? (
              <Button
                label="افتح تفاصيل العقار"
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: "/property/[id]",
                    params: { id: property.id },
                  })
                }
              />
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function FinanceInput({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  const theme = useAppTheme();
  return (
    <View>
      <AppText className="mb-2 text-right text-[13px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inkMuted}
        cursorColor={theme.colors.primary}
        className="h-12 px-4 text-right font-cairo-bold"
        style={{
          borderRadius: theme.radii.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceMuted,
          color: theme.colors.ink,
        }}
      />
    </View>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  const theme = useAppTheme();
  return (
    <View
      className="flex-1 rounded-[20px] px-4 py-4"
      style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
    >
      <View className="flex-row-reverse items-center gap-2">
        <Icon size={16} color={theme.colors.primary} />
        <AppText className="text-right text-[12px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
          {label}
        </AppText>
      </View>
      <AppText className="mt-2 text-right text-[17px] font-cairo-black" style={{ color: theme.colors.ink }}>
        {value}
      </AppText>
    </View>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View
      className="flex-1 rounded-[18px] px-3 py-3"
      style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
    >
      <AppText className="text-right text-[11px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
        {label}
      </AppText>
      <AppText className="mt-1 text-right text-[15px] font-cairo-black" style={{ color: theme.colors.ink }}>
        {value}
      </AppText>
    </View>
  );
}

