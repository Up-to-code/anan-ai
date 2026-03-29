import { Pressable, ScrollView, View } from "react-native";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ArrowLeft, Bookmark, Globe, HelpCircle, LogOut, MessageSquare, User as UserIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { buildClientWebHistoryUrl, getClientWebBaseUrl } from "@/lib/mobileData";
import { clearGuestThreadSnapshot } from "@/lib/mobilePersistence";

export default function AccountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ threadId?: string; orderId?: string }>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!params.threadId && !params.orderId) return;
    void clearGuestThreadSnapshot();
  }, [params.orderId, params.threadId]);

  return (
    <View className="flex-1 bg-slate-100 dark:bg-slate-950">
      <View className="flex-row items-center justify-between px-6 pb-4" style={{ paddingTop: insets.top + 16 }}>
        <IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />
        <AppText className="text-[18px] font-cairo-black text-slate-900 dark:text-slate-50">حسابي</AppText>
        <View className="w-12 h-12" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Profile Details */}
        <View className="items-center py-8 rounded-[32px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <View className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 items-center justify-center mb-4">
            <UserIcon size={40} color="#94A3B8" />
          </View>
          <AppText className="text-2xl font-cairo-black text-slate-900 dark:text-slate-50 mb-1">أحمد منصور</AppText>
          <AppText className="text-[15px] font-medium text-slate-500">+966 50 123 4567</AppText>
        </View>

        {params.threadId || params.orderId ? (
          <View className="mt-4 rounded-[28px] bg-emerald-50 px-5 py-4 dark:bg-emerald-900/20">
            <AppText className="text-[16px] font-cairo-black text-emerald-800 dark:text-emerald-200 text-right">
              تمت مزامنة المحادثة مع رحلة المساعد
            </AppText>
            <AppText className="mt-2 text-[14px] font-medium leading-7 text-emerald-700 dark:text-emerald-300 text-right">
              يمكنك الآن العودة إلى المحادثة أو فتح السجل المحفوظ من الويب بنفس الخلفية والنتائج.
            </AppText>
          </View>
        ) : (
          <View className="mt-4 rounded-[28px] bg-white px-5 py-4 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <AppText className="text-[16px] font-cairo-black text-slate-900 dark:text-slate-50 text-right">
              حسابك جزء من نفس تجربة المساعد
            </AppText>
            <AppText className="mt-2 text-[14px] font-medium leading-7 text-slate-500 text-right">
              الموبايل يركز على المحادثة السريعة، بينما حفظ السجل وتأكيد التحويل يكتملان حالياً عبر بوابة الويب المرتبطة بنفس المحادثة.
            </AppText>
          </View>
        )}

        {/* Setting Groups */}
        <View className="gap-2 mt-4 pb-12">
           <AccountRow icon={Bookmark} label="العقارات المحفوظة" onPress={() => {}} />
           <AccountRow icon={MessageSquare} label="السجل المحفوظ" onPress={() => void Linking.openURL(buildClientWebHistoryUrl())} />
           <AccountRow icon={Globe} label="لغة التطبيق - العربية" onPress={() => {}} />
           <AccountRow icon={HelpCircle} label="مركز المساعدة" onPress={() => void Linking.openURL(`${getClientWebBaseUrl().replace(/\/$/, "")}/about`)} />
           
           <View className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8 gap-2">
             <AccountRow icon={LogOut} label="تسجيل الخروج" onPress={() => router.replace("/welcome")} destructive />
           </View>
        </View>
      </ScrollView>
    </View>
  );
}

function AccountRow({ icon: Icon, label, onPress, destructive }: any) {
  return (
    <Pressable onPress={onPress} className="flex-row-reverse items-center gap-4 py-4 active:opacity-60 transition-opacity">
      <View className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
        <Icon size={20} color={destructive ? "#EF4444" : "#64748B"} />
      </View>
      <AppText className={`text-[16px] font-cairo-bold flex-1 text-right ${destructive ? "text-red-500" : "text-slate-900 dark:text-slate-50"}`}>
        {label}
      </AppText>
    </Pressable>
  );
}
