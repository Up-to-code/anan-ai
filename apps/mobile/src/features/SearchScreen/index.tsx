import { ArrowLeft, Search, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Pressable, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PropertyResultCard } from "@/components/chat/PropertyResultCard";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import type { PropertyPreview } from "@/types/chat";

/**
 * WHY:   Buyers still need a direct search canvas when they want to browse without a longer conversation.
 * WHAT:  Renders the search input, compact filters, and property result list.
 * HOW:   Uses the search hook for in-memory filtering and reuses the shared property card component.
 */
export default function SearchScreen() {
  const router = useRouter();
  const search = usePropertySearch();

  function openProperty(property: PropertyPreview) {
    router.push({ pathname: "/property/[id]", params: { id: property.id } });
  }

  return (
    <SafeAreaView className="flex-1 bg-panel" edges={["top"]}>
      <View className="border-b border-line bg-white px-5 py-3">
        <View className="flex-row-reverse items-center gap-3">
          <IconButton icon={ArrowLeft} onPress={() => router.back()} />
          <View className="flex-1 border border-line bg-panel px-3 py-3">
            <View className="flex-row-reverse items-center gap-2">
              {search.query.length > 0 ? (
                <Pressable onPress={() => search.setQuery("")}>
                  <X size={16} color="#64748B" />
                </Pressable>
              ) : (
                <Search size={16} color="#64748B" />
              )}
              <TextInput
                value={search.query}
                onChangeText={search.setQuery}
                placeholder="ابحث عن شقة أو منطقة أو مدينة"
                placeholderTextColor="#64748B"
                style={{
                  flex: 1,
                  color: "#0F172A",
                  fontFamily: "Cairo_400Regular",
                  fontSize: 15,
                  textAlign: "right",
                  writingDirection: "rtl",
                }}
              />
            </View>
          </View>
        </View>

        <View className="mt-4 gap-3">
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

      <View className="flex-1 px-5 pt-4">
        <View className="mb-3 flex-row-reverse items-center justify-between">
          <AppText tone="headline" className="text-lg">
            نتائج البحث
          </AppText>
          <AppText className="text-xs text-muted">{search.results.length} نتيجة</AppText>
        </View>

        <FlashList
          data={search.results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View className="mb-3">
              <PropertyResultCard property={item} onPress={openProperty} />
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center border border-line bg-white px-5 py-10">
              <AppText tone="headline" className="text-base">
                لا توجد نتائج مطابقة
              </AppText>
              <AppText className="mt-2 text-sm leading-6 text-muted">
                جرّب مدينة أخرى أو خفف شروط البحث لنقربك من أفضل الخيارات المتاحة.
              </AppText>
            </View>
          }
        />
      </View>
    </SafeAreaView>
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
    <View>
      <AppText tone="label" className="mb-2 text-xs text-muted">
        {title}
      </AppText>
      <FlashList
        horizontal
        data={values}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const selected = item === selectedValue;

          return (
            <Pressable
              className={`mr-2 border px-3 py-2 ${selected ? "border-brand bg-brand" : "border-line bg-panel"}`}
              onPress={() => onSelect(item)}
            >
              <AppText className={selected ? "text-xs text-white" : "text-xs text-ink"}>{item}</AppText>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
