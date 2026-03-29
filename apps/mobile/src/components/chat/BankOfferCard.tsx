import type { ReactNode } from "react";
import { Building2, Percent } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { formatCurrency } from "@/lib/formatters";
import { AppText } from "@/components/ui/AppText";
import { useMobileLayout } from "@/lib/mobileLayout";

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
      className="w-full overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      style={{
        borderRadius: layout.cardRadius + 4,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        elevation: 6,
      }}
    >
      <View className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
        <View className="flex-row-reverse items-center justify-between">
          <View className="flex-row-reverse items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30">
              <Building2 size={20} color="#4F46E5" />
            </View>
            <View className="items-end">
              <AppText responsiveRole="meta" className="font-medium text-slate-500 dark:text-slate-400">
                {offer.title}
              </AppText>
              <AppText responsiveRole="title" className="font-cairo-black text-slate-900 dark:text-slate-50">
                {offer.bankName}
              </AppText>
            </View>
          </View>
          <View className="rounded-full bg-indigo-100 px-3 py-1.5 dark:bg-indigo-900/50">
            <AppText responsiveRole="meta" className="font-cairo-black text-indigo-700 dark:text-indigo-300">
              تمويل عقاري
            </AppText>
          </View>
        </View>
      </View>

      <View className="flex-row-reverse justify-between gap-3 px-4 py-4">
        <FactColumn
          label="نسبة / برنامج"
          value={offer.rateLabel}
          icon={<Percent size={14} color="#0F172A" />}
        />
        <FactColumn label="الدفعة الأولى" value={`${offer.downPaymentPercent}%`} />
        <FactColumn label="القسط الشهري" value={formatCurrency(offer.monthlyEstimate)} emphasized />
      </View>

      <View className="px-4 pb-2">
        <AppText responsiveRole="body" className="font-medium text-slate-500 dark:text-slate-400">
          {offer.summary}
        </AppText>
      </View>

      <Pressable
        onPress={onPress}
        className="mx-4 mb-4 mt-2 h-12 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-50"
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
