import { useState } from "react";
import { ArrowRight, Check } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileTopBar } from "@/components/ui/MobileChrome";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { getPropertyLocationLabel } from "@/lib/mobileData";
import { useAppTheme } from "@/lib/mobileTheme";

const ALL_FILTER = "الكل";

export default function FiltersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const params = useLocalSearchParams<{
    area?: string;
    ownerType?: string;
  }>();

  const feed = usePropertyFeed();
  const areas = [ALL_FILTER, ...new Set(feed.properties.map((p) => getPropertyLocationLabel(p)))];
  const ownerTypes = [ALL_FILTER, "وسيط", "مطور"];

  const [selectedArea, setSelectedArea] = useState(params.area ?? ALL_FILTER);
  const [selectedOwnerType, setSelectedOwnerType] = useState(params.ownerType ?? ALL_FILTER);

  function applyFilters() {
    router.back();
    router.setParams({
      searchArea: selectedArea,
      searchOwnerType: selectedOwnerType,
    });
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        title="التصنيف"
        leading={<IconButton icon={ArrowRight} onPress={() => router.back()} tone="panel" />}
        trailing={<View style={{ width: 44 }} />}
      />

      <ScrollView className="flex-1 px-5 pt-6">
        <FilterSection
          title="المنطقة"
          options={areas}
          selectedValue={selectedArea}
          onSelect={setSelectedArea}
        />

        <View className="mt-8">
          <FilterSection
            title="نوع الجهة"
            options={ownerTypes}
            selectedValue={selectedOwnerType}
            onSelect={setSelectedOwnerType}
          />
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <View 
        className="absolute bottom-0 left-0 right-0 px-5 pt-4" 
        style={{ 
          paddingBottom: Math.max(insets.bottom, 20),
          backgroundColor: theme.colors.canvas,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <Pressable
          onPress={applyFilters}
          className="h-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <AppText className="text-[16px] font-cairo-bold text-white">عرض النتائج</AppText>
        </Pressable>
      </View>
    </View>
  );
}

function FilterSection({
  title,
  options,
  selectedValue,
  onSelect,
}: {
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  const theme = useAppTheme();
  return (
    <View>
      <AppText className="mb-4 text-right text-[18px] font-cairo-bold" style={{ color: theme.colors.ink }}>
        {title}
      </AppText>
      <View className="gap-2">
        {options.map((option) => {
          const isSelected = option === selectedValue;
          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              className="h-12 flex-row-reverse items-center justify-between px-4 rounded-xl"
              style={{
                backgroundColor: isSelected ? theme.colors.primarySoft : theme.colors.surfaceMuted,
                borderWidth: 1,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
              }}
            >
              <AppText
                className="text-right font-cairo-bold"
                style={{ color: isSelected ? theme.colors.primary : theme.colors.ink, fontSize: 15 }}
              >
                {option}
              </AppText>
              {isSelected && <Check size={18} color={theme.colors.primary} strokeWidth={3} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
