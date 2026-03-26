import { View, Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Image } from "expo-image";
import { IconButton } from "@/components/ui/IconButton";
import { AppText } from "@/components/ui/AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getPropertyById } from "@/lib/mvp/ananAssistant";

const { width, height } = Dimensions.get("window");

export default function GalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  
  const property = getPropertyById(propertyId);
  const images = property?.gallery || [];

  return (
    <View className="flex-1 bg-black">
      <View className="absolute z-10 w-full flex-row items-center justify-between px-6" style={{ top: insets.top + 16 }}>
        <IconButton icon={ArrowLeft} onPress={() => router.back()} className="bg-white/10 dark:bg-white/10 border-0 shadow-none" />
        <AppText className="font-cairo-bold text-white text-[15px]">1 / {Math.max(1, images.length)}</AppText>
        <View className="w-12" />
      </View>

      <View className="flex-1 items-center justify-center pb-12">
        {images.length > 0 ? (
          <Image 
            source={images[0]} 
            style={{ width: width, height: height * 0.55, borderRadius: 16 }} 
            contentFit="cover" 
            transition={200}
          />
        ) : (
           <AppText className="text-white">الصورة غير متاحة</AppText>
        )}
      </View>
    </View>
  );
}
