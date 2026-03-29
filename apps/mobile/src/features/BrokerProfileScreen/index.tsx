import { ScrollView, View } from "react-native";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { Image } from "expo-image";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";
import { getPropertyHeroImage } from "@/lib/mobileData";

export default function BrokerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { propertyId } = useLocalSearchParams<{ id?: string; propertyId?: string }>();
  const { property } = usePropertyDetail(propertyId);
  const owner = property?.owner;
  const brokerName = owner?.name ?? "الشريك العقاري";
  const agencyLabel = owner?.agencyLabel ?? (owner?.type === "broker" ? "وسيط موثق" : "مطور موثق");
  const rating = owner?.rating ?? 4.8;
  const activeListings = owner?.activeListings ?? 0;
  const phone = owner?.phone;
  const email = owner?.contactEmail;

  return (
    <View className="flex-1 bg-slate-100 dark:bg-slate-950">
      <View className="flex-row items-center justify-between px-6 pb-4" style={{ paddingTop: insets.top + 16 }}>
         <IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />
         <AppText className="text-[18px] font-cairo-black text-slate-900 dark:text-slate-50">الملف الشخصي</AppText>
         <View className="w-12 h-12" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
         <View className="items-center px-6 py-8 border-b border-slate-200 dark:border-slate-800">
           <Image source={property ? getPropertyHeroImage(property) : "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop"} style={{ width: 100, height: 100, borderRadius: 50 }} contentFit="cover" className="mb-4" />
           <AppText className="text-2xl font-cairo-black text-slate-900 dark:text-slate-50 mb-1 text-center">{brokerName}</AppText>
           <AppText className="text-[15px] text-slate-500 font-medium mb-4 text-center">{agencyLabel}</AppText>
           
           <View className="flex-row items-center gap-1 mb-8">
             <Star size={16} color="#EAB308" fill="#EAB308" />
             <AppText className="text-[15px] font-cairo-bold text-slate-700 dark:text-slate-300 ml-1">{rating}</AppText>
             <AppText className="text-[13px] text-slate-400">({activeListings} عقار نشط)</AppText>
           </View>

           <View className="w-full rounded-[28px] border border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-900 mb-6">
             <AppText className="text-[15px] font-cairo-black text-slate-900 dark:text-slate-50 text-right">
               هذا الملف جزء من رحلة المساعد
             </AppText>
             <AppText className="mt-2 text-[14px] leading-7 text-slate-500 dark:text-slate-400 text-right">
               إذا كان هذا الشريك مناسباً لعقارك الحالي، ارجع إلى المحادثة وسأجهز ملخصاً أو أبدأ التحويل مباشرة.
             </AppText>
           </View>

           <View className="flex-row-reverse w-full gap-3">
             <Button 
               label="اتصال" 
               className="flex-1 h-14 rounded-full" 
               onPress={() => {
                 if (phone) {
                   void Linking.openURL(`tel:${phone}`);
                 }
               }}
               disabled={!phone}
             />
             <Button 
               label="تواصل" 
               variant="secondary"
               className="flex-1 h-14 rounded-full border-green-500/30 bg-green-50 dark:bg-green-900/20" 
               textClassName="text-green-700 dark:text-green-400"
               onPress={() => {
                 if (email) {
                   void Linking.openURL(`mailto:${email}`);
                 }
               }}
               disabled={!email}
             />
           </View>
         </View>

      </ScrollView>
    </View>
  );
}
