import { View } from "react-native";
import { Skeleton } from "@/components/ui/Skeleton";
import Animated, { FadeIn } from "react-native-reanimated";

export function HomeFeedSkeleton() {
  return (
    <Animated.View entering={FadeIn.duration(400)} className="flex-1 px-4 py-8">
      <View className="flex-row items-center mb-10 gap-3">
        <Skeleton className="h-8 w-8 rounded-none" />
        <View className="gap-2">
          <Skeleton className="h-4 w-24 rounded-none" />
          <Skeleton className="h-2 w-16 rounded-none" />
        </View>
      </View>
      <View className="mb-8 w-3/4">
        <Skeleton className="h-4 w-full rounded-none mb-3" />
        <Skeleton className="h-4 w-5/6 rounded-none mb-3" />
        <Skeleton className="h-4 w-2/3 rounded-none mb-3" />
      </View>
      <View className="w-full h-64 mb-4" style={{ borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 4 }}>
        <Skeleton className="flex-1 rounded-t border-b" style={{ borderBottomColor: "#e2e8f0" }} />
        <View className="h-20 bg-white p-3 justify-between">
          <Skeleton className="h-4 w-1/2 rounded-none" />
          <View className="flex-row justify-between mt-2">
            <Skeleton className="h-4 w-1/4 rounded-none" />
            <Skeleton className="h-4 w-1/4 rounded-none" />
          </View>
        </View>
      </View>
      <View className="w-full h-64" style={{ borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 4 }}>
        <Skeleton className="flex-1 rounded-t border-b" style={{ borderBottomColor: "#e2e8f0" }} />
        <View className="h-20 bg-white p-3 justify-between">
          <Skeleton className="h-4 w-1/2 rounded-none" />
          <View className="flex-row justify-between mt-2">
            <Skeleton className="h-4 w-1/4 rounded-none" />
            <Skeleton className="h-4 w-1/4 rounded-none" />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
