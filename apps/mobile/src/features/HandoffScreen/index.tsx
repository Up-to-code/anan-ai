import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle2 } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { api } from "@/lib/convexApi";

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
 * WHY:   Buyers need a focused native confirmation after requesting an advisor handoff.
 * WHAT:  Shows the best available handoff summary and gives the user a path back into the assistant.
 * HOW:   Reads the live order detail when available and otherwise falls back to the deep-link order id.
 */
export default function HandoffScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ orderId?: string; threadId?: string }>();
  const order = useOrderDetail(params.orderId);

  return (
    <View className="flex-1 bg-slate-100 px-6 dark:bg-slate-950" style={{ paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) }}>
      <View className="flex-row-reverse items-center justify-between pb-6">
        <IconButton icon={ArrowLeft} onPress={() => router.replace("/")} tone="panel" />
        <AppText className="text-[18px] font-cairo-black text-slate-900 dark:text-slate-50">طلب المستشار</AppText>
        <View className="h-12 w-12" />
      </View>

      <View className="flex-1 justify-center">
        <View className="rounded-[32px] border border-slate-200 bg-white px-6 py-8 dark:border-slate-800 dark:bg-slate-900">
          <View className="mb-5 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 size={32} color="#059669" />
            </View>
          </View>

          <AppText className="text-center text-[24px] font-cairo-black leading-tight text-slate-900 dark:text-slate-50">
            تم تجهيز طلبك بنجاح
          </AppText>
          <AppText className="mt-3 text-center text-[15px] font-medium leading-8 text-slate-500 dark:text-slate-400">
            {order?.property?.title
              ? `تم حفظ طلب المستشار المرتبط بـ ${order.property.title}.`
              : "تم حفظ طلب المستشار وربطه بالمحادثة الحالية قدر الإمكان في هذه المرحلة."}
          </AppText>

          <View className="mt-6 rounded-[24px] bg-slate-100 px-5 py-4 dark:bg-slate-800">
            <AppText className="text-[13px] font-cairo-black uppercase tracking-[2px] text-slate-400">ملخص الطلب</AppText>
            <AppText className="mt-3 text-[15px] font-medium text-slate-700 dark:text-slate-200">
              رقم الطلب: {order?.orderId ?? params.orderId ?? "—"}
            </AppText>
            <AppText className="mt-2 text-[15px] font-medium text-slate-700 dark:text-slate-200">
              الحالة: {order?.status ?? "qualified"}
            </AppText>
            <AppText className="mt-2 text-[15px] font-medium text-slate-700 dark:text-slate-200">
              المصدر: {order?.sourceChannel ?? "app"}
            </AppText>
          </View>

          <View className="mt-6 gap-3">
            <Button
              label="العودة إلى المساعد"
              onPress={() =>
                router.replace({
                  pathname: "/",
                  params: params.threadId ? { threadId: params.threadId } : undefined,
                })
              }
            />
            <Button
              label="افتح البحث"
              variant="secondary"
              onPress={() => router.replace("/search")}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
