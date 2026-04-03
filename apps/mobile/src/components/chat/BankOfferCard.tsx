import type { ReactNode } from "react";
import { Building2, Percent } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { formatCurrency } from "@/lib/formatters";
import { AppText } from "@/components/ui/AppText";
import { useMobileLayout } from "@/lib/mobileLayout";
import { mobileTheme } from "@/lib/mobileTheme";

export type BankOfferProps = {
  title: string;
  bankName: string;
  rateLabel: string;
  downPaymentPercent: number;
  monthlyEstimate: number;
  summary: string;
};

/**
 * WHY:   Bank offers are one of the highest-intent buyer outputs, so mobile needs a dedicated renderer instead of squeezing them into a generic card.
 * WHAT:  Displays the shared buyer `bank_offer` payload with clear financing terms and one direct CTA.
 * HOW:   Uses a high-trust card header, three scannable financing facts, and supporting summary copy before the action button.
 */
export function BankOfferCard({ offer, onPress }: { offer: BankOfferProps; onPress: () => void }) {
  const layout = useMobileLayout();

  return (
    <View
      className="w-full overflow-hidden"
      style={{
        borderRadius: layout.cardRadius,
        borderWidth: 1,
        borderColor: mobileTheme.colors.border,
        backgroundColor: mobileTheme.colors.surface,
      }}
    >
      <View className="px-4 py-4" style={{ borderBottomWidth: 1, borderBottomColor: mobileTheme.colors.border }}>
        <View className="flex-row-reverse items-center justify-between">
          <View className="flex-row-reverse items-center gap-2">
            <Building2 size={18} color="#475569" />
            <View className="items-end">
              <AppText responsiveRole="meta" className="font-medium text-slate-500 dark:text-slate-400">
                {offer.title}
              </AppText>
              <AppText responsiveRole="bodyStrong" className="font-cairo-black text-slate-900 dark:text-slate-50">
                {offer.bankName}
              </AppText>
            </View>
          </View>
          <AppText responsiveRole="meta" className="font-cairo-black text-slate-400 dark:text-slate-500">
            تمويل
          </AppText>
        </View>
      </View>

      <View className="flex-row-reverse justify-between gap-3 px-4 py-4">
        <FactColumn
          label="نسبة / برنامج"
          value={offer.rateLabel}
          icon={<Percent size={14} color="#475569" />}
        />
        <FactColumn label="الدفعة الأولى" value={`${offer.downPaymentPercent}%`} />
        <FactColumn label="القسط الشهري" value={formatCurrency(offer.monthlyEstimate)} emphasized />
      </View>

      <View className="px-4 pb-3">
        <AppText responsiveRole="body" className="font-medium text-slate-500 dark:text-slate-400">
          {offer.summary}
        </AppText>
      </View>

      <Pressable
        onPress={onPress}
        className="mx-4 mb-4 mt-1 h-11 items-center justify-center rounded-full"
        style={{
          borderWidth: 1,
          borderColor: mobileTheme.colors.dark,
          backgroundColor: mobileTheme.colors.dark,
        }}
      >
        <AppText responsiveRole="chip" className="font-cairo-black text-white dark:text-slate-950">
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
  return (
    <View className="flex-1 items-end">
      <AppText responsiveRole="meta" className="font-medium text-slate-500 dark:text-slate-400">
        {label}
      </AppText>
      <View className="mt-1 flex-row-reverse items-center gap-1">
        {icon}
        <AppText
          responsiveRole="bodyStrong"
          className={emphasized ? "font-cairo-black text-primary" : "font-cairo-black text-slate-900 dark:text-slate-50"}
        >
          {value}
        </AppText>
      </View>
    </View>
  );
}
