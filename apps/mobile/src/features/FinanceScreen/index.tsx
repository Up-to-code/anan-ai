import { ActivityIndicator, Pressable, ScrollView, View, useColorScheme } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calculator } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { MobileSectionHeading, MobileSurface, MobileTopBar } from "@/components/ui/MobileChrome";
import { formatCurrency } from "@/lib/formatters";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";
import { getPropertyLocationLabel } from "@/lib/mobileData";
import { mobileTheme } from "@/lib/mobileTheme";

/**
 * WHY:   Finance should read like a normal quick calculator screen tied to the current listing.
 * WHAT:  Renders a plain financing estimate page with a linked property summary and a clean repayment breakdown.
 * HOW:   Calculates one simple monthly installment scenario and presents it in rows instead of a custom feature layout.
 */
export default function FinanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { property, isLoading } = usePropertyDetail(propertyId);
  const screenBackground = isDark ? "#0B0C10" : mobileTheme.colors.canvas;
  const sectionBackground = isDark ? "#151821" : "#FFFFFF";
  const mutedSectionBackground = isDark ? "#111318" : "#F3F4F6";

  const propertyValue = property?.price ?? 1200000;
  const downPayment = Math.round(propertyValue * 0.2);
  const rate = 0.045;
  const years = 20;

  const principal = propertyValue - downPayment;
  const monthlyRate = rate / 12;
  const payments = years * 12;
  const monthlyPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -payments));

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: screenBackground }}>
        <ActivityIndicator size="large" color={mobileTheme.colors.primary} />
      </View>
    );
  }

  const rows = [
    { label: "سعر العقار", value: formatCurrency(propertyValue) },
    { label: "الدفعة الأولى", value: formatCurrency(downPayment) },
    { label: "قيمة التمويل", value: formatCurrency(principal) },
    { label: "نسبة الفائدة", value: "4.5%" },
    { label: "مدة السداد", value: `${years} سنة` },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: screenBackground }}>
      <MobileTopBar
        insetTop={insets.top}
        title="التمويل"
        subtitle="تقدير سريع داخل نفس الرحلة"
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        trailing={
          <View
            className="items-center justify-center rounded-full"
            style={{ width: 44, height: 44, backgroundColor: sectionBackground }}
          >
            <Calculator size={18} color={mobileTheme.colors.inkMuted} />
          </View>
        }
      />

      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
        <View className="gap-5 pb-12">
          {property ? (
            <View className="rounded-[28px] px-5 py-5" style={{ borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.border, backgroundColor: mutedSectionBackground }}>
              <MobileSectionHeading
                eyebrow="REFERENCE PROPERTY"
                title={property.title}
                description={getPropertyLocationLabel(property)}
              />
            </View>
          ) : null}

          <View className="rounded-[28px] px-5 py-5" style={{ borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.border, backgroundColor: sectionBackground }}>
            <AppText className="text-right text-[15px] font-cairo-black text-slate-900">
              القسط الشهري التقديري
            </AppText>
            <AppText className="mt-3 text-right text-[34px] font-cairo-black text-slate-900">
              {formatCurrency(monthlyPayment)}
            </AppText>
            <AppText className="mt-2 text-right text-[14px] leading-7 text-slate-500">
              تقدير سريع للمقارنة فقط، وليس عرض تمويل نهائياً من بنك أو جهة تمويل.
            </AppText>
          </View>

          <View className="overflow-hidden rounded-[28px]" style={{ borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.border, backgroundColor: sectionBackground }}>
            {rows.map((row, index) => (
              <FinanceRow
                key={row.label}
                label={row.label}
                value={row.value}
                withBorder={index < rows.length - 1}
                isDark={isDark}
              />
            ))}
          </View>

          <Pressable
            onPress={() => router.replace({ pathname: "/", params: property ? { propertyId: property.id } : undefined })}
            className="items-center justify-center rounded-[18px] bg-slate-900 px-5 py-4 active:opacity-90"
          >
            <AppText className="text-[15px] font-cairo-black text-white">
              ارجع إلى المساعد
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function FinanceRow({
  label,
  value,
  withBorder,
  isDark,
}: {
  label: string;
  value: string;
  withBorder?: boolean;
  isDark?: boolean;
}) {
  return (
    <View className="flex-row-reverse items-center justify-between px-5 py-4" style={withBorder ? { borderBottomWidth: 1, borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB" } : undefined}>
      <AppText className="text-right text-[15px] font-bold" style={{ color: isDark ? "#94A3B8" : "#64748B" }}>{label}</AppText>
      <AppText className="text-right text-[18px] font-cairo-black" style={{ color: isDark ? "#F8FAFC" : mobileTheme.colors.ink }}>{value}</AppText>
    </View>
  );
}
