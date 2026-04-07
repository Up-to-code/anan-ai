import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle2 } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileSectionHeading, MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { api } from "@/lib/convexApi";
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
        title="طلب المستشار"
        subtitle="تأكيد داخل نفس الرحلة"
        leading={<IconButton icon={ArrowLeft} onPress={() => router.replace("/")} tone="panel" />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <View className="flex-1 justify-center">
        <View className="rounded-[34px] px-6 py-8" style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: mutedSectionBackground }}>
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
              title={order === null && params.orderId ? "تم حفظ الطلب محلياً" : "تم تجهيز طلبك"}
              description={
                order?.property?.title
                  ? `تم حفظ طلب المستشار المرتبط بـ ${order.property.title}.`
                  : order === null && params.orderId
                    ? "تمت العودة إلى التطبيق لكن تفاصيل الطلب الحية غير متاحة حالياً. يمكنك متابعة نفس المحادثة مباشرة."
                    : "تم حفظ الطلب وربطه بالمحادثة الحالية قدر الإمكان."
              }
            />
          </View>

          <View className="mt-6 overflow-hidden rounded-[28px]" style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: sectionBackground }}>
            <SummaryRow label="رقم الطلب" value={order?.orderId ?? params.orderId ?? "—"} withBorder />
            <SummaryRow label="الحالة" value={order?.status ?? "qualified"} withBorder />
            <SummaryRow label="المصدر" value={order?.sourceChannel ?? "app"} />
          </View>

          {params.threadId ? (
            <MobileSurface tone="default" radius="card" className="mt-4 gap-2">
              <AppText className="text-right text-[14px] font-cairo-bold" style={{ color: theme.colors.ink }}>
                يمكنك العودة الآن إلى نفس المحادثة
              </AppText>
              <AppText className="text-right text-[13px] font-medium" style={{ color: theme.colors.inkMuted }}>
                سيبقى العقار والطلب مرتبطين بسياق الرحلة الحالية على هذا الجهاز.
              </AppText>
            </MobileSurface>
          ) : null}

          <View className="mt-6 gap-3">
            <Button
              label="العودة إلى المساعد"
              onPress={() =>
                router.replace({
                  pathname: "/",
                  params: params.threadId ? { threadId: params.threadId } : undefined,
                })
              }
              className="rounded-[18px] bg-slate-900"
            />
            <Button
              label="افتح البحث"
              variant="secondary"
              onPress={() => router.replace("/search")}
              className="rounded-[18px]"
            />
          </View>
        </View>
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
  return (
    <View
      className={`flex-row-reverse items-center justify-between px-5 py-4 ${withBorder ? "border-b" : ""}`}
      style={withBorder ? { borderBottomColor: theme.colors.border } : undefined}
    >
      <AppText className="text-right text-[15px] font-bold" style={{ color: theme.colors.inkMuted }}>{label}</AppText>
      <AppText className="text-right text-[17px] font-cairo-black" style={{ color: theme.colors.ink }}>{value}</AppText>
    </View>
  );
}
