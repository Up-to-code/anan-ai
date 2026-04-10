import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle2 } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobilePill, MobileSectionHeading, MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { api } from "@/lib/convexApi";
import { formatMobileCopy } from "@/lib/i18n";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";

const LIVE_BACKEND_ENABLED = Boolean(process.env.EXPO_PUBLIC_CONVEX_URL);

function useLiveOrderDetail(orderId?: string) {
  return useQuery(
    api.user_zone.web.orders.getClientOrderDetail,
    orderId ? ({ orderId: orderId as never } as never) : "skip",
  ) as
    | {
        orderId: string;
        status: string;
        property: { title: string } | null;
        sourceChannel?: string;
        threadId?: string;
      }
    | null
    | undefined;
}

function useOrderDetail(orderId?: string) {
  return LIVE_BACKEND_ENABLED ? useLiveOrderDetail(orderId) : null;
}

/**
 * WHY:   Advisor handoff confirmation should look like a standard success page within the same buyer app.
 * WHAT:  Shows a clean confirmation with the order summary and return actions.
 * HOW:   Reads the available order details and presents them in a simple stacked card layout.
 */
export default function HandoffScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { dictionary, isRtl } = useMobileLocale();
  const params = useLocalSearchParams<{ orderId?: string; threadId?: string }>();
  const order = useOrderDetail(params.orderId);
  const screenBackground = theme.colors.canvas;
  const sectionBackground = theme.colors.surface;
  const mutedSectionBackground = theme.colors.surfaceMuted;

  if (LIVE_BACKEND_ENABLED && order === undefined) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: screenBackground }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 px-5" style={{ backgroundColor: screenBackground, paddingBottom: Math.max(insets.bottom, 20) }}>
      <MobileTopBar
        insetTop={insets.top}
        title={dictionary.handoff.title}
        subtitle={dictionary.handoff.subtitle}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.replace("/")} tone="panel" />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <View className="flex-1 justify-center">
        <MobileSurface tone="muted" radius="hero" className="gap-6" shadow="none">
          <View className="items-center">
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 64, height: 64, backgroundColor: theme.colors.successSoft }}
            >
              <CheckCircle2 size={32} color={theme.colors.success} />
            </View>
            <MobileSectionHeading
              align="center"
              className="mt-5"
              title={order === null && params.orderId ? dictionary.handoff.savedLocallyTitle : dictionary.handoff.preparedTitle}
              description={
                order?.property?.title
                  ? formatMobileCopy(dictionary.handoff.savedForProperty, { title: order.property.title })
                  : order === null && params.orderId
                    ? dictionary.handoff.liveUnavailable
                    : dictionary.handoff.savedBestEffort
              }
            />
          </View>

          <View className={`${isRtl ? "flex-row-reverse" : "flex-row"} flex-wrap justify-center`} style={{ gap: 8 }}>
            <MobilePill label={order?.status ?? "qualified"} tone="primary" active />
            <MobilePill label={order?.sourceChannel ?? "app"} />
          </View>

          <View className="overflow-hidden rounded-[28px]" style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: sectionBackground }}>
            <SummaryRow label={dictionary.handoff.orderId} value={order?.orderId ?? params.orderId ?? "—"} withBorder />
            <SummaryRow label={dictionary.handoff.status} value={order?.status ?? "qualified"} withBorder />
            <SummaryRow label={dictionary.handoff.source} value={order?.sourceChannel ?? "app"} />
          </View>

          {params.threadId ? (
            <MobileSurface tone="default" radius="card" className="gap-2" shadow="none">
              <AppText className={`${isRtl ? "text-right" : "text-left"} text-[14px] font-cairo-bold`} style={{ color: theme.colors.ink }}>
                {dictionary.handoff.returnToConversationTitle}
              </AppText>
              <AppText className={`${isRtl ? "text-right" : "text-left"} text-[13px] font-medium`} style={{ color: theme.colors.inkMuted }}>
                {dictionary.handoff.returnToConversationBody}
              </AppText>
            </MobileSurface>
          ) : null}

          <View className="gap-3">
            <Button
              label={dictionary.handoff.returnToAssistant}
              onPress={() =>
                router.replace({
                  pathname: "/",
                  params: params.threadId ? { threadId: params.threadId } : undefined,
                })
              }
              className="rounded-[18px] bg-slate-900"
            />
            <Button
              label={dictionary.handoff.openSearch}
              variant="secondary"
              onPress={() => router.replace("/search")}
              className="rounded-[18px]"
            />
          </View>
        </MobileSurface>
      </View>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  withBorder,
}: {
  label: string;
  value: string;
  withBorder?: boolean;
}) {
  const theme = useAppTheme();
  const { isRtl } = useMobileLocale();
  return (
    <View
      className={`items-center justify-between px-5 py-4 ${isRtl ? "flex-row-reverse" : "flex-row"} ${withBorder ? "border-b" : ""}`}
      style={withBorder ? { borderBottomColor: theme.colors.border } : undefined}
    >
      <AppText className={`${isRtl ? "text-right" : "text-left"} text-[15px] font-bold`} style={{ color: theme.colors.inkMuted }}>{label}</AppText>
      <AppText className={`${isRtl ? "text-right" : "text-left"} text-[17px] font-cairo-black`} style={{ color: theme.colors.ink }}>{value}</AppText>
    </View>
  );
}
