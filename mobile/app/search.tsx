import { useState } from "react";
import { View, TextInput, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, SlidersHorizontal, MapPin, X } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { PropertyChatCard } from "@/components/features/PropertyChatCard";
import { usePropertyFeed } from "@/hooks/usePropertyFeed";
import { MobilePropertyFeedItem } from "@/types/mobile";

const AREAS = ["الكل", "حطين", "الملقا", "الياسمين", "العقيق", "النرجس", "الرمال", "طويق", "الحمراء", "الفيصلية", "الصحافة"];
const CITIES = ["الكل", "الرياض", "جدة", "الدمام"];
const TYPES = ["الكل", "شقة", "فيلا", "دوبلكس", "تاون هاوس", "استوديو", "أرض", "بنتهاوس"];

/**
 * Search & explore screen with text search and filter chips.
 */
export default function SearchScreen() {
  const router = useRouter();
  const { properties } = usePropertyFeed();
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedType, setSelectedType] = useState("الكل");

  const filtered = properties.filter((p) => {
    const matchesQuery = !query || p.title.includes(query) || p.area?.includes(query) || p.location?.includes(query);
    const matchesCity = selectedCity === "الكل" || p.location === selectedCity;
    const matchesType =
      selectedType === "الكل" ||
      (selectedType === "شقة" && p.title.includes("شقة")) ||
      (selectedType === "فيلا" && p.title.includes("فيلا")) ||
      (selectedType === "دوبلكس" && p.title.includes("دوبلكس")) ||
      (selectedType === "تاون هاوس" && p.title.includes("تاون")) ||
      (selectedType === "استوديو" && p.title.includes("استوديو")) ||
      (selectedType === "أرض" && p.title.includes("أرض")) ||
      (selectedType === "بنتهاوس" && p.title.includes("بنتهاوس"));
    return matchesQuery && matchesCity && matchesType;
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Search Bar */}
      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center bg-slate-50 px-3" style={{ borderWidth: 0.5, borderColor: "#e2e8f0" }}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث عن عقار، منطقة، أو مدينة..."
            placeholderTextColor="#94a3b8"
            className="flex-1 py-3 px-2 text-sm text-slate-900 font-cairo"
            style={{ textAlign: "right" }}
          />
          {query ? (
            <Pressable onPress={() => setQuery("")}>
              <X size={16} color="#94a3b8" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* City Filter */}
      <View className="px-4 pb-2">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CITIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedCity(item)}
              className={`px-3 py-1.5 mr-2 ${selectedCity === item ? "bg-brand" : "bg-slate-50"}`}
              style={{ borderWidth: 0.5, borderColor: selectedCity === item ? "#2563EB" : "#e2e8f0" }}
            >
              <AppText className={`text-xs ${selectedCity === item ? "text-white font-cairo-bold" : "text-slate-600"}`}>
                {item}
              </AppText>
            </Pressable>
          )}
        />
      </View>

      {/* Type Filter */}
      <View className="px-4 pb-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TYPES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedType(item)}
              className={`px-3 py-1.5 mr-2 ${selectedType === item ? "bg-slate-900" : "bg-slate-50"}`}
              style={{ borderWidth: 0.5, borderColor: selectedType === item ? "#0f172a" : "#e2e8f0" }}
            >
              <AppText className={`text-xs ${selectedType === item ? "text-white font-cairo-bold" : "text-slate-600"}`}>
                {item}
              </AppText>
            </Pressable>
          )}
        />
      </View>

      {/* Results count */}
      <View className="px-4 pb-2">
        <AppText className="text-xs text-slate-400">{filtered.length} نتيجة</AppText>
      </View>

      {/* Property List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, gap: 12 }}
        renderItem={({ item }) => <PropertyChatCard property={item} />}
        ListEmptyComponent={
          <View className="py-12 items-center">
            <AppText className="text-sm text-slate-400">لا توجد نتائج</AppText>
          </View>
        }
      />
    </SafeAreaView>
  );
}
