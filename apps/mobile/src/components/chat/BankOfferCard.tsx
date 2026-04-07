import type { ReactNode } from "react";
import { Building2, Percent } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { formatCurrency } from "@/lib/formatters";
import { AppText } from "@/components/ui/AppText";
import { useMobileLayout } from "@/lib/mobileLayout";
import { useAppTheme } from "@/lib/mobileTheme";

export type BankOfferProps = {
  title: string;
  bankName: string;
  rateLabel: string;
  downPaymentPercent: number;
  monthlyEstimate: number;
  summary: string;
};

export function BankOfferCard({ offer, onPress }: { offer: BankOfferProps; onPress: () => void }) {
  const layout = useMobileLayout();
  const theme = useAppTheme();

  return (
    <View
      className="w-full overflow-hidden"
      style={{
        borderRadius: theme.radii.card, // 16px soft bound
        borderWidth: 1, // 1px delicate bound
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
    >
      <View className="px-4 py-4" style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
        <View className="flex-row-reverse items-center justify-between">
          <View className="flex-row-reverse items-center gap-3">
            <View className="items-center justify-center" style={{ width: 44, height: 44, borderRadius: theme.radii.pill, backgroundColor: theme.colors.surfaceMuted }}>
               <Building2 size={20} color={theme.colors.inkMuted} />
            </View>
            <View className="items-end">
              <AppText responsiveRole="meta" className="font-medium" style={{ color: theme.colors.inkMuted }}>
                {offer.title}
              </AppText>
              <AppText responsiveRole="bodyStrong" className="font-cairo-bold" style={{ color: theme.colors.ink }}>
                {offer.bankName}
              </AppText>
            </View>
          </View>
          <AppText responsiveRole="meta" className="font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
            تمويل
          </AppText>
        </View>
      </View>

      <View className="flex-row-reverse justify-between gap-3 px-4 py-4">
        <FactColumn
          label="المعدل / البرنامج"
          value={offer.rateLabel}
          icon={<Percent size={14} color={theme.colors.inkMuted} />}
        />
        <FactColumn label="الدفعة الأولى" value={`${offer.downPaymentPercent}%`} />
        <FactColumn label="القسط الشهري" value={formatCurrency(offer.monthlyEstimate)} emphasized />
      </View>

      <View className="px-4 pb-3">
        <AppText responsiveRole="body" className="font-medium text-right" style={{ color: theme.colors.inkSoft }}>
          {offer.summary}
        </AppText>
      </View>

      <Pressable
        onPress={onPress}
        className="mx-4 mb-4 mt-1 h-11 items-center justify-center active:opacity-90"
        style={{
          borderRadius: theme.radii.pill,
          backgroundColor: theme.colors.primary,
        }}
      >
        <AppText responsiveRole="chip" className="font-cairo-bold text-white">
          اطلب التمويل
        </AppText>
      </Pressable>
    </View>
  );
}

function FactColumn({
  label,
  value,
  icon,
  emphasized = false,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  emphasized?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <View className="flex-1 items-end">
      <AppText responsiveRole="meta" className="font-medium" style={{ color: theme.colors.inkMuted }}>
        {label}
      </AppText>
      <View className="mt-1 flex-row-reverse items-center gap-1">
        {icon}
        <AppText
          responsiveRole="bodyStrong"
          className="font-cairo-bold"
          style={{ color: emphasized ? theme.colors.primary : theme.colors.ink }}
        >
          {value}
        </AppText>
      </View>
    </View>
  );
}
