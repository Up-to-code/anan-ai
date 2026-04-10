import { useRouter } from "expo-router";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Eye,
  Gauge,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobilePill, MobileSectionHeading, MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { AnalyticsMetricCard } from "@/features/AnalyticsScreen/AnalyticsMetricCard";
import { AnalyticsTrendChart } from "@/features/AnalyticsScreen/AnalyticsTrendChart";
import { useBuyerAnalytics } from "@/hooks/useBuyerAnalytics";
import { cn } from "@/lib/cn";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";

function resolveSignalTone(index: number, theme: ReturnType<typeof useAppTheme>) {
  if (index === 0) {
    return {
      backgroundColor: theme.colors.primarySoft,
      borderColor: theme.colors.primaryMuted,
      textColor: theme.colors.primary,
    };
  }

  if (index === 1) {
    return {
      backgroundColor: theme.colors.successSoft,
      borderColor: theme.colors.successSoft,
      textColor: theme.colors.success,
    };
  }

  return {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    textColor: theme.colors.inkSoft,
  };
}

/**
 * WHY:   Buyers need a compact, trustworthy market-intelligence surface that reflects current inventory and engagement rather than frozen mock content.
 * WHAT:  Renders the buyer analytics summary, recent trend blocks, area signals, and next-step guidance.
 * HOW:   Reads the shared buyer analytics hook and renders either the live summary or a compact unavailable state.
 */
export default function AnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const analytics = useBuyerAnalytics();
  const summary = analytics.summary;
  const { dictionary, isRtl } = useMobileLocale();

  if (!summary && analytics.isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.canvas }}>
        <Activity size={20} color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        title={dictionary.navigation.analytics}
        subtitle={dictionary.navigation.analyticsSubtitle}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.borderStrong}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        trailing={<IconButton icon={BarChart3} tone="panel" />}
      />

      {!summary ? (
        <View className="flex-1 px-5 pt-5">
          <MobileSurface radius="hero" className="gap-4 px-6 py-8">
            <AppText className="text-right text-[22px] font-cairo-black" style={{ color: theme.colors.ink }}>
              {dictionary.runtime.liveDataUnavailableTitle}
            </AppText>
            <AppText className="text-right text-[15px] leading-8 font-cairo-medium" style={{ color: theme.colors.inkMuted }}>
              {dictionary.runtime.liveDataUnavailableBody}
            </AppText>
          </MobileSurface>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 48) }}
        >
          <View
            style={{
              paddingHorizontal: theme.spacing.gutterCompact,
              paddingTop: theme.spacing.gutterCompact,
              gap: theme.spacing.section,
            }}
          >
          <MobileSurface tone="muted" radius="hero" className="gap-5">
            <View className={cn("items-start justify-between", isRtl ? "flex-row-reverse" : "flex-row")} style={{ gap: 16 }}>
              <View
                className="items-center justify-center rounded-full"
                style={{ width: 52, height: 52, backgroundColor: theme.colors.primarySoft }}
              >
                <TrendingUp size={24} color={theme.colors.primary} strokeWidth={2.2} />
              </View>

              <View className="flex-1 gap-3">
                <AppText className="text-[11px] font-cairo-bold" style={{ color: theme.colors.primary }}>
                  {dictionary.analytics.movementBrief}
                </AppText>
                <AppText className="text-[28px] leading-[40px] font-cairo-black" style={{ color: theme.colors.ink }}>
                  {summary.headline}
                </AppText>
                <AppText className="text-[14px] leading-7 font-cairo-medium" style={{ color: theme.colors.inkSoft }}>
                  {summary.headlineBody}
                </AppText>
              </View>
            </View>

            <View className={cn(isRtl ? "flex-row-reverse" : "flex-row", "flex-wrap")} style={{ gap: 8 }}>
              <MobilePill label={summary.updatedAtLabel} tone="primary" active />
              <MobilePill label={summary.topSignalLabel} />
            </View>

            <View className={cn(isRtl ? "flex-row-reverse" : "flex-row")} style={{ gap: 12 }}>
              <View
                className="flex-1 rounded-[20px] px-4 py-4"
                style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}
              >
                <AppText className="text-[12px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
                  {dictionary.analytics.followUps}
                </AppText>
                <AppText className="mt-2 text-[20px] font-cairo-black" style={{ color: theme.colors.ink }}>
                  {summary.qualifiedLeadLabel}
                </AppText>
              </View>

              <View
                className="flex-1 rounded-[20px] px-4 py-4"
                style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}
              >
                <AppText className="text-[12px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
                  {dictionary.analytics.averageResponse}
                </AppText>
                <AppText className="mt-2 text-[20px] font-cairo-black" style={{ color: theme.colors.ink }}>
                  {summary.averageResponseLabel}
                </AppText>
              </View>
            </View>
          </MobileSurface>

          <View className={cn(isRtl ? "flex-row-reverse" : "flex-row", "flex-wrap justify-between")} style={{ rowGap: 12 }}>
            <AnalyticsMetricCard
              label={dictionary.analytics.totalVisits}
              value={summary.metrics.visits}
              helper={dictionary.analytics.totalVisitsBody}
              icon={Eye}
              tone="default"
            />
            <AnalyticsMetricCard
              label={dictionary.analytics.seriousJourneys}
              value={summary.metrics.seriousJourneys}
              helper={dictionary.analytics.seriousJourneysBody}
              icon={Users}
              tone="highlight"
            />
            <AnalyticsMetricCard
              label={dictionary.analytics.conversionRate}
              value={summary.metrics.conversion}
              helper={dictionary.analytics.conversionRateBody}
              icon={Gauge}
              tone="success"
            />
            <AnalyticsMetricCard
              label={dictionary.analytics.followUpSignals}
              value={summary.metrics.followUps}
              helper={dictionary.analytics.followUpSignalsBody}
              icon={Activity}
              tone="default"
            />
          </View>

          {analytics.isLoading ? (
            <MobileSurface radius="hero" className="items-center py-8">
              <Activity size={20} color={theme.colors.primary} />
            </MobileSurface>
          ) : null}

          <AnalyticsTrendChart data={summary.trendPoints} />

          <MobileSurface radius="hero" className="gap-5">
            <MobileSectionHeading
              title={dictionary.analytics.whereSignal}
              description={dictionary.analytics.whereSignalBody}
            />

            <View style={{ gap: 12 }}>
              {summary.areaSignals.map((signal, index) => {
                const tone = resolveSignalTone(index, theme);

                return (
                  <View
                    key={signal.name}
                    className="rounded-[24px] px-4 py-4"
                    style={{ backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border }}
                  >
                    <View className={cn("items-start justify-between", isRtl ? "flex-row-reverse" : "flex-row")} style={{ gap: 12 }}>
                      <View
                        className="rounded-full px-3 py-2"
                        style={{ backgroundColor: tone.backgroundColor, borderWidth: 1, borderColor: tone.borderColor }}
                      >
                        <AppText className="text-[12px] font-cairo-bold" style={{ color: tone.textColor }}>
                          {signal.growth}
                        </AppText>
                      </View>

                      <View className="flex-1 gap-2">
                        <AppText className="text-[18px] font-cairo-black" style={{ color: theme.colors.ink }}>
                          {signal.name}
                        </AppText>
                        <AppText className="text-[13px] leading-6 font-cairo-medium" style={{ color: theme.colors.inkSoft }}>
                          {signal.story}
                        </AppText>
                      </View>
                    </View>

                    <View className="mt-4 h-2 overflow-hidden rounded-full" style={{ backgroundColor: theme.colors.surfaceStrong }}>
                      <View
                        style={{
                          width: `${signal.signalScore}%`,
                          height: "100%",
                          backgroundColor: theme.colors.primary,
                          borderRadius: theme.radii.pill,
                        }}
                      />
                    </View>

                    <View className={cn("mt-4", isRtl ? "flex-row-reverse" : "flex-row")} style={{ gap: 12 }}>
                      <View className="flex-1">
                        <AppText className="text-[11px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
                          {dictionary.analytics.budgetRange}
                        </AppText>
                        <AppText className="mt-1 text-[15px] font-cairo-black" style={{ color: theme.colors.ink }}>
                          {signal.budget}
                        </AppText>
                      </View>

                      <View className="flex-1">
                        <AppText className="text-[11px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
                          {dictionary.analytics.engagementSignal}
                        </AppText>
                        <AppText className="mt-1 text-[15px] font-cairo-black" style={{ color: theme.colors.ink }}>
                          {signal.response}
                        </AppText>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </MobileSurface>

          <MobileSurface radius="hero" className="gap-5">
            <MobileSectionHeading
              title={dictionary.analytics.journeyMotion}
              description={dictionary.analytics.journeyMotionBody}
            />

            <View style={{ gap: 12 }}>
              {summary.journeyStages.map((stage) => (
                <View
                  key={stage.label}
                  className="rounded-[24px] px-4 py-4"
                  style={{ backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border }}
                >
                  <View className="flex-row-reverse items-start justify-between" style={{ gap: 12 }}>
                    <View className="items-end">
                      <AppText className="text-right text-[18px] font-cairo-black" style={{ color: theme.colors.ink }}>
                        {stage.label}
                      </AppText>
                      <AppText className="mt-1 text-right text-[13px] font-medium" style={{ color: theme.colors.inkMuted }}>
                        {stage.helper}
                      </AppText>
                    </View>
                    <AppText className="text-right text-[16px] font-cairo-black" style={{ color: theme.colors.primary }}>
                      {stage.count}
                    </AppText>
                  </View>

                  <View className="mt-4 h-2 overflow-hidden rounded-full" style={{ backgroundColor: theme.colors.surfaceStrong }}>
                    <View
                      style={{
                        width: `${stage.progress}%`,
                        height: "100%",
                        backgroundColor: theme.colors.primary,
                        borderRadius: theme.radii.pill,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </MobileSurface>

          <MobileSurface radius="hero" className="gap-4">
            <MobileSectionHeading
              title="الخطوات التالية"
              description="ترجمة الإشارة الحالية إلى خطوة عملية داخل رحلة الشراء نفسها."
            />
            <View style={{ gap: 10 }}>
              {summary.nextSteps.map((step) => (
                <View
                  key={step}
                  className="flex-row-reverse items-start gap-3 rounded-[20px] px-4 py-4"
                  style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }}
                >
                  <View
                    className="items-center justify-center rounded-full"
                    style={{ width: 30, height: 30, backgroundColor: theme.colors.primarySoft }}
                  >
                    <Sparkles size={15} color={theme.colors.primary} />
                  </View>
                  <AppText className="flex-1 text-right text-[14px] leading-7 font-medium" style={{ color: theme.colors.ink }}>
                    {step}
                  </AppText>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => router.push("/search")}
              className="flex-row-reverse items-center justify-between rounded-[22px] px-4 py-4 active:opacity-90"
              style={{ backgroundColor: theme.colors.primary, borderWidth: 1, borderColor: theme.colors.primary }}
            >
              <ArrowLeft size={18} color="#FFFFFF" />
              <View className="items-end">
                <AppText className="text-right text-[15px] font-cairo-black" style={{ color: "#FFFFFF" }}>
                  افتح البحث الآن
                </AppText>
                <AppText className="mt-1 text-right text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.84)" }}>
                  طبّق هذه القراءة مباشرة على نتائج العقارات.
                </AppText>
              </View>
            </Pressable>
          </MobileSurface>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
