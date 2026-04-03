import { View } from "react-native";
import { Compass, Sparkles } from "lucide-react-native";
import { PropertyResultCard } from "@/components/chat/PropertyResultCard";
import { AppText } from "@/components/ui/AppText";
import { useMobileLayout } from "@/lib/mobileLayout";
import { mobileTheme } from "@/lib/mobileTheme";
import type { MobileProperty, MobileSearchContext } from "@/types/mobile";

type SearchResultsPanelProps = {
  searchContext: MobileSearchContext;
  results: MobileProperty[];
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
};

/**
 * WHY:   "Search more" should remain part of the conversation so users can return to it after asking follow-up questions.
 * WHAT:  Renders an inline assistant-owned search results list inside the chat transcript.
 * HOW:   Displays the assistant summary plus a compact list-row result set without using the AG UI registry.
 */
export function SearchResultsPanel({
  searchContext,
  results,
  onPropertyPress,
  onOpenProperty,
}: SearchResultsPanelProps) {
  const layout = useMobileLayout();

  return (
    <View
      className="mt-5 overflow-hidden"
      style={{
        borderRadius: layout.cardRadius,
        borderWidth: 1,
        borderColor: mobileTheme.colors.border,
        backgroundColor: mobileTheme.colors.surface,
      }}
    >
      <View className="gap-3 px-4 py-4">
        <View className="flex-row-reverse items-center justify-between">
          <View className="flex-row-reverse items-center gap-2">
            <Sparkles size={16} color="#2563EB" />
            <AppText responsiveRole="bodyStrong" className="font-cairo-black text-slate-900 dark:text-slate-50">
              نتائج موسّعة من نفس الطلب
            </AppText>
          </View>
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: mobileTheme.colors.surfaceMuted }}
          >
            <AppText responsiveRole="meta" className="font-cairo-black text-slate-500 dark:text-slate-300">
              {results.length} خيارات
            </AppText>
          </View>
        </View>

        <View className="flex-row-reverse items-start gap-2">
          <View
            className="mt-0.5 items-center justify-center rounded-full"
            style={{ width: 32, height: 32, backgroundColor: mobileTheme.colors.surfaceMuted }}
          >
            <Compass size={16} color="#2563EB" />
          </View>
          <View className="flex-1">
            <AppText responsiveRole="body" className="font-medium text-slate-500 dark:text-slate-400">
              {searchContext.searchSummary}
            </AppText>
          </View>
        </View>
      </View>

      <View className="gap-2 px-3 py-3" style={{ borderTopWidth: 1, borderTopColor: mobileTheme.colors.border }}>
        {results.map((property) => (
          <PropertyResultCard
            key={property.id}
            property={property}
            onPress={onPropertyPress}
            onOpenDetails={onOpenProperty}
            variant="card"
            actionLabel="اتخذ إجراء"
          />
        ))}
      </View>
    </View>
  );
}
