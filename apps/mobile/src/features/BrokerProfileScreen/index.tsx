import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MessageCircle, Phone, Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { Image } from "expo-image";

export default function BrokerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  // Mock broker data backing the design
  const broker = {
    name: "خالد عبدالله",
    agency: "شركة مساكن العقارية",
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop",
    activeListings: 12
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center justify-between px-6 pb-4" style={{ paddingTop: insets.top + 16 }}>
         <IconButton icon={ArrowLeft} onPress={() => router.back()} tone="ghost" />
         <AppText className="text-[18px] font-cairo-black text-slate-900 dark:text-slate-50">الملف الشخصي</AppText>
         <View className="w-12 h-12" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
         <View className="items-center px-6 py-8 border-b border-slate-200 dark:border-slate-800">
           <Image source={broker.image} style={{ width: 100, height: 100, borderRadius: 50 }} contentFit="cover" className="mb-4" />
           <AppText className="text-2xl font-cairo-black text-slate-900 dark:text-slate-50 mb-1 text-center">{broker.name}</AppText>
           <AppText className="text-[15px] text-slate-500 font-medium mb-4 text-center">{broker.agency}</AppText>
           
           <View className="flex-row items-center gap-1 mb-8">
             <Star size={16} color="#EAB308" fill="#EAB308" />
             <AppText className="text-[15px] font-cairo-bold text-slate-700 dark:text-slate-300 ml-1">{broker.rating}</AppText>
             <AppText className="text-[13px] text-slate-400">({broker.reviews} تقييم)</AppText>
           </View>

           <View className="flex-row-reverse w-full gap-3">
             <Button 
               label="اتصال" 
               className="flex-1 h-14 rounded-full" 
               onPress={() => {}} 
             />
             <Button 
               label="واتساب" 
               variant="secondary"
               className="flex-1 h-14 rounded-full border-green-500/30 bg-green-50 dark:bg-green-900/20" 
               textClassName="text-green-700 dark:text-green-400"
               onPress={() => {}} 
             />
           </View>
         </View>

         <View className="px-6 py-8">
            <AppText className="text-xl font-cairo-black text-slate-900 dark:text-slate-50 mb-4 text-right">العقارات النشطة ({broker.activeListings})</AppText>
            <View className="py-2 mt-4 items-center justify-center">
               <AppText className="text-slate-500 font-medium text-center leading-relaxed">لا توجد عقارات متاحة حالياً.</AppText>
            </View>
         </View>
      </ScrollView>
    </View>
  );
}
