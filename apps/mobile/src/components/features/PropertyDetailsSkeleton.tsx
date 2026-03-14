import { View } from "react-native";
import { Skeleton } from "@/components/ui/Skeleton";
import Animated, { FadeIn } from "react-native-reanimated";

export function PropertyDetailsSkeleton() {
  return (
    <Animated.View entering={FadeIn.duration(400)} className="flex-1 bg-white">
      {/* Media Pager Mock */}
      <View className="w-full h-[350px]">
        <Skeleton className="flex-1 rounded-none" />
      </View>

      <View className="px-5 py-6">
        {/* Title & Price */}
        <Skeleton className="h-8 w-3/4 rounded-none mb-3" />
        <Skeleton className="h-6 w-1/2 rounded-none mb-6" />

        {/* Action Row */}
        <View className="flex-row gap-4 py-4 mb-4" style={{ borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: "#f1f5f9" }}>
          <Skeleton className="h-10 flex-1" style={{ borderRadius: 4 }} />
          <Skeleton className="h-10 flex-1" style={{ borderRadius: 4 }} />
          <Skeleton className="h-10 w-12" style={{ borderRadius: 4 }} />
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mt-6">
          <View className="w-[48%] mb-6">
            <Skeleton className="h-4 w-10 rounded-none mb-2" />
            <Skeleton className="h-5 w-20 rounded-none" />
          </View>
          <View className="w-[48%] mb-6">
            <Skeleton className="h-4 w-10 rounded-none mb-2" />
            <Skeleton className="h-5 w-20 rounded-none" />
          </View>
          <View className="w-[48%] mb-6">
            <Skeleton className="h-4 w-10 rounded-none mb-2" />
            <Skeleton className="h-5 w-20 rounded-none" />
          </View>
          <View className="w-[48%] mb-6">
            <Skeleton className="h-4 w-10 rounded-none mb-2" />
            <Skeleton className="h-5 w-20 rounded-none" />
          </View>
        </View>

        {/* Broker Card Mock */}
        <View className="mt-8 p-4 bg-slate-50 flex-row items-center gap-4" style={{ borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 4 }}>
          <Skeleton className="h-12 w-12 rounded-none" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-4 w-3/4 rounded-none" />
            <Skeleton className="h-3 w-1/2 rounded-none" />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
