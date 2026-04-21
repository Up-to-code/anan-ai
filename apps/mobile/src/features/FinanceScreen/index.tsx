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
import { formatMobileCopy } from "@/lib/i18n";
import { useMobileLocale } from "@/lib/mobileLocale";
import { formatCurrency } from "@/lib/formatters";
import { getPropertyLocationLabel } from "@/lib/mobileData";
import { buildSearchRouteParams, parseSearchRouteParams } from "@/lib/mobileSearch";
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
  const { dictionary, isRtl, locale, textAlign } = useMobileLocale();
  const params = useLocalSearchParams<{
    propertyId?: string;
    threadId?: string;
    sourcePropertyId?: string;
    searchSummary?: string;
    searchQuery?: string;
    searchArea?: string;
    searchOwnerType?: string;
  }>();
  const { propertyId } = params;
  const searchContext = parseSearchRouteParams(params);
  const { property, isLoading: isPropertyLoading } = usePropertyDetail(propertyId);

  const propertyPrice = property?.price ?? 0;
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

  if (!finance.estimate && !finance.isLoading) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
        <MobileTopBar
          insetTop={insets.top}
          title={dictionary.financeScreen.title}
          subtitle={dictionary.financeScreen.subtitle}
          leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        />
        <View className="flex-1 px-5 pt-5">
          <MobileSurface radius="hero" className="gap-4 px-6 py-8">
            <AppText className={`${isRtl ? "text-right" : "text-left"} text-[22px] font-cairo-black`} style={{ color: theme.colors.ink }}>
              {dictionary.runtime.liveDataUnavailableTitle}
            </AppText>
            <AppText className={`${isRtl ? "text-right" : "text-left"} text-[15px] leading-8 font-cairo-medium`} style={{ color: theme.colors.inkMuted }}>
              {dictionary.runtime.liveDataUnavailableBody}
            </AppText>
          </MobileSurface>
        </View>
      </View>
    );
  }

  const estimate = finance.estimate;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        title={dictionary.financeScreen.title}
        subtitle={dictionary.financeScreen.subtitle}
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
              eyebrow={dictionary.financeScreen.referencePropertyEyebrow}
              title={property?.title ?? dictionary.financeScreen.generalScenario}
              description={property ? getPropertyLocationLabel(property) : dictionary.financeScreen.generalScenarioDescription}
            />

            <View className={isRtl ? "flex-row-reverse" : "flex-row"} style={{ gap: 12 }}>
              <MetricCard icon={Wallet} label={dictionary.financeScreen.propertyPrice} value={formatCurrency(propertyPrice, locale)} />
              <MetricCard
                icon={Landmark}
                label={dictionary.financeScreen.bankOfferCount}
                value={String(property?.finance?.bankOfferCount ?? estimate?.bankOffers.length ?? 0)}
              />
            </View>
          </MobileSurface>

          <MobileSurface radius="hero" className="gap-4">
            <MobileSectionHeading
              eyebrow={dictionary.financeScreen.buyerAssumptionsEyebrow}
              title={dictionary.financeScreen.adjustScenario}
              description={dictionary.financeScreen.adjustScenarioDescription}
            />

            <FinanceInput
              label={dictionary.financeScreen.downPayment}
              value={downPaymentInput}
              onChangeText={setDownPaymentInput}
              placeholder={String(initialDownPayment)}
            />
            <FinanceInput
              label={dictionary.financeScreen.repaymentYears}
              value={yearsInput}
              onChangeText={setYearsInput}
              placeholder="20"
            />
            <FinanceInput
              label={dictionary.financeScreen.annualInterest}
              value={rateInput}
              onChangeText={setRateInput}
              placeholder="4.75"
            />
            <FinanceInput
              label={dictionary.financeScreen.monthlySalary}
              value={salaryInput}
              onChangeText={setSalaryInput}
              placeholder={dictionary.financeScreen.monthlySalaryPlaceholder}
            />

            <Button label={dictionary.financeScreen.saveDefaults} variant="secondary" onPress={() => void persistCurrentDefaults()} />
          </MobileSurface>

          <MobileSurface radius="hero" className="gap-4">
            <MobileSectionHeading
              eyebrow={dictionary.financeScreen.currentEstimateEyebrow}
              title={formatCurrency(estimate?.monthlyPayment ?? 0, locale)}
              description={estimate?.summary ?? dictionary.runtime.liveDataUnavailableBody}
            />

            <View className={`${isRtl ? "flex-row-reverse" : "flex-row"} flex-wrap`} style={{ gap: 12 }}>
              <MetricPill label={dictionary.financeScreen.financingValue} value={formatCurrency(estimate?.loanAmount ?? 0, locale)} />
              <MetricPill label={dictionary.financeScreen.totalInterest} value={formatCurrency(estimate?.totalInterest ?? 0, locale)} />
              <MetricPill label={dictionary.financeScreen.totalPaid} value={formatCurrency(estimate?.totalPaid ?? 0, locale)} />
            </View>

            <View
              className="rounded-[20px] px-4 py-4"
              style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }}
            >
              <View className={`items-center gap-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                <Percent size={16} color={theme.colors.primary} />
                <AppText className={`${isRtl ? "text-right" : "text-left"} text-[14px] font-cairo-bold`} style={{ color: theme.colors.ink }}>
                  {dictionary.financeScreen.affordabilityStatus}
                </AppText>
              </View>
              <AppText className={`mt-2 ${isRtl ? "text-right" : "text-left"} text-[15px] font-cairo-black`} style={{ color: theme.colors.primary }}>
                {estimate?.affordabilityStatus === "comfortable"
                  ? dictionary.financeScreen.affordabilityComfortable
                  : estimate?.affordabilityStatus === "review"
                    ? dictionary.financeScreen.affordabilityReview
                    : dictionary.financeScreen.affordabilityStretch}
              </AppText>
              {estimate?.recommendedBudget ? (
                <AppText className={`mt-1 ${isRtl ? "text-right" : "text-left"} text-[13px] font-medium`} style={{ color: theme.colors.inkMuted }}>
                  {formatMobileCopy(dictionary.financeScreen.recommendedBudget, {
                    value: formatCurrency(estimate.recommendedBudget, locale),
                  })}
                </AppText>
              ) : (
                <AppText className={`mt-1 ${isRtl ? "text-right" : "text-left"} text-[13px] font-medium`} style={{ color: theme.colors.inkMuted }}>
                  {dictionary.financeScreen.addSalaryHint}
                </AppText>
              )}
            </View>
          </MobileSurface>

          <MobileSurface radius="hero" className="gap-4">
            <MobileSectionHeading
              eyebrow={dictionary.financeScreen.bankOffersEyebrow}
              title={estimate?.bankOffers.length ? dictionary.financeScreen.initialComparison : dictionary.financeScreen.noBankOffers}
              description={
                estimate?.bankOffers.length
                  ? dictionary.financeScreen.initialComparisonBody
                  : dictionary.financeScreen.noBankOffersBody
              }
            />

            {finance.isLoading ? (
              <View className="py-6 items-center justify-center">
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : (
              (estimate?.bankOffers ?? []).map((offer) => (
                <View
                  key={`${offer.bankName}-${offer.rateLabel}`}
                  className="rounded-[20px] px-4 py-4"
                  style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }}
                >
                  <View className={`items-start justify-between gap-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                    <View className={isRtl ? "items-end" : "items-start"}>
                      <AppText className={`${isRtl ? "text-right" : "text-left"} text-[16px] font-cairo-black`} style={{ color: theme.colors.ink }}>
                        {offer.bankName}
                      </AppText>
                      <AppText className={`mt-1 ${isRtl ? "text-right" : "text-left"} text-[13px] font-medium`} style={{ color: theme.colors.inkMuted }}>
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
                    <MetricPill label={dictionary.financeScreen.downPayment} value={`${offer.downPaymentPercent}%`} />
                    <MetricPill label={dictionary.financeScreen.estimatedInstallment} value={formatCurrency(offer.monthlyEstimate, locale)} />
                  </View>
                </View>
              ))
            )}
          </MobileSurface>

          <View className="gap-3 pb-4">
            <Button
              label={dictionary.financeScreen.backToAssistant}
              onPress={() =>
                router.replace({
                  pathname: "/",
                  params: property
                    ? {
                        propertyId: property.id,
                        ...(params.threadId ? { threadId: params.threadId } : {}),
                      }
                    : params.threadId
                      ? { threadId: params.threadId }
                      : undefined,
                })
              }
            />
            {property ? (
              <Button
                label={dictionary.financeScreen.openPropertyDetails}
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: "/property/[id]",
                    params: {
                      id: property.id,
                      ...(params.threadId ? { threadId: params.threadId } : {}),
                      ...buildSearchRouteParams(searchContext),
                    },
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
  const { direction, textAlign } = useMobileLocale();
  return (
    <View>
      <AppText className={`mb-2 ${textAlign === "right" ? "text-right" : "text-left"} text-[13px] font-cairo-bold`} style={{ color: theme.colors.inkMuted }}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inkMuted}
        cursorColor={theme.colors.primary}
        className={`h-12 px-4 ${textAlign === "right" ? "text-right" : "text-left"} font-cairo-bold`}
        style={{
          borderRadius: theme.radii.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceMuted,
          color: theme.colors.ink,
          writingDirection: direction,
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
  const { isRtl } = useMobileLocale();
  return (
    <View
      className="flex-1 rounded-[20px] px-4 py-4"
      style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
    >
      <View className={`items-center gap-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
        <Icon size={16} color={theme.colors.primary} />
        <AppText className={`${isRtl ? "text-right" : "text-left"} text-[12px] font-cairo-bold`} style={{ color: theme.colors.inkMuted }}>
          {label}
        </AppText>
      </View>
      <AppText className={`mt-2 ${isRtl ? "text-right" : "text-left"} text-[17px] font-cairo-black`} style={{ color: theme.colors.ink }}>
        {value}
      </AppText>
    </View>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();
  return (
    <View
      className="flex-1 rounded-[18px] px-3 py-3"
      style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
    >
      <AppText className={`${isRtl ? "text-right" : "text-left"} text-[11px] font-cairo-bold`} style={{ color: theme.colors.inkMuted }}>
        {label}
      </AppText>
      <AppText className={`mt-1 ${isRtl ? "text-right" : "text-left"} text-[15px] font-cairo-black`} style={{ color: theme.colors.ink }}>
        {value}
      </AppText>
    </View>
  );
}
