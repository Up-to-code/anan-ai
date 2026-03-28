import { ArrowLeft, Search, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PropertyResultCard } from "@/components/chat/PropertyResultCard";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import type { PropertyPreview } from "@/types/chat";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

/**
 * WHY:   Direct search should feel as premium and minimalist as the assistant.
 * WHAT:  Modernizes the search bar into a pill-shaped input and uses rounded-2xl filters.
 * HOW:   Reuses the Nexus-style input geometry and high-contrast chips.
 */
export default function SearchScreen() {
  const router = useRouter();
  const search = usePropertySearch();
  const insets = useSafeAreaInsets();

  function openProperty(property: PropertyPreview) {
    router.push({ pathname: "/property/[id]", params: { id: property.id } });
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Search Header Container */}
      <View className="px-6 pb-6 pt-2 relative z-10" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center gap-4">
          <IconButton 
            icon={ArrowLeft} 
            onPress={() => router.back()} 
            tone="light" 
            className=""
          />
          
          {/* Pill Search Input */}
          <View className="relative flex-1">
            <TextInput
              value={search.query}
              onChangeText={search.setQuery}
              placeholder="ابحث عن شقة أو منطقة أو مدينة"
              placeholderTextColor="rgba(148, 163, 184, 0.5)"
              cursorColor="#2563EB"
              className="h-14 w-full rounded-full bg-slate-100 dark:bg-slate-800 px-12 text-right font-cairo-medium text-[15px] text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-700"
            />
            <View className="absolute left-4 top-0 h-full items-center justify-center">
              <Search size={18} color="#94A3B8" />
            </View>
            {search.query.length > 0 && (
              <Pressable 
                onPress={() => search.setQuery("")}
                className="absolute right-4 top-0 h-full items-center justify-center"
              >
                <X size={18} color="#94A3B8" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Filter Section */}
        <View className="mt-8 gap-6">
          <FilterRow
            title="المدينة"
            values={search.cities}
            selectedValue={search.selectedCity}
            onSelect={search.setSelectedCity}
          />
          <FilterRow
            title="نوع الوحدة"
            values={search.types}
            selectedValue={search.selectedType}
            onSelect={search.setSelectedType}
          />
        </View>
      </View>

      {/* Results Section */}
      <View className="flex-1 px-6 pt-8">
        <View className="mb-6 flex-row-reverse items-center justify-between">
          <AppText className="text-2xl font-cairo-black text-slate-900 dark:text-slate-50">نتائج البحث</AppText>
          <View className="px-3 py-1 bg-slate-200/50 dark:bg-slate-800 rounded-full">
            <AppText className="text-[12px] text-slate-500 font-cairo-black">{search.results.length} نتيجة</AppText>
          </View>
        </View>

        <FlashList
          data={search.results}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
          renderItem={({ item }) => (
            <View className="mb-5">
              <PropertyResultCard property={item} onPress={openProperty} />
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center rounded-2xl bg-slate-100 dark:bg-slate-800 px-8 py-16">
              <View className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center mb-6">
                <Search size={24} color="#94A3B8" />
              </View>
              <AppText className="text-xl text-center font-cairo-black text-slate-900 dark:text-slate-50 mb-3">لا توجد نتائج مطابقة</AppText>
              <AppText className="text-center text-[15px] leading-relaxed text-slate-500 font-medium max-w-[260px]">
                جرّب مدينة أخرى أو خفف شروط البحث لنقربك من الخيارات المتاحة.
              </AppText>
            </View>
          }
        />
      </View>
    </View>
  );
}

function FilterRow({
  title,
  values,
  selectedValue,
  onSelect,
}: {
  title: string;
  values: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={{ direction: "rtl" }}>
      <AppText className="mb-3 text-[12px] text-slate-400 font-black uppercase tracking-widest text-right">
        {title}
      </AppText>
      <FlashList
        horizontal
        data={values}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        // @ts-ignore
        inverted={true}
        renderItem={({ item }) => {
          const selected = item === selectedValue;
          return (
            <Pressable
              onPress={() => onSelect(item)}
              className={cn(
                "ml-3 rounded-full px-5 py-2.5 transition-all active:scale-95",
                selected 
                  ? "bg-slate-900 dark:bg-slate-50" 
                  : "bg-slate-100 dark:bg-slate-800"
              )}
            >
              <AppText 
                className={cn(
                  "text-[14px] font-cairo-black",
                  selected ? "text-white dark:text-slate-900" : "text-slate-600 dark:text-slate-300"
                )}
              >
                {item}
              </AppText>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
