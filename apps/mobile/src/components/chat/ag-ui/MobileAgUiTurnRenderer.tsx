import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { InsightCard } from "@/components/chat/InsightCard";
import { PropertyRecommendationRow } from "@/components/chat/PropertyRecommendationRow";
import { BankOfferCard } from "@/components/chat/BankOfferCard";
import { useMobileLayout } from "@/lib/mobileLayout";
import type { MobileAgUiTurn, MobileProperty } from "@/types/mobile";

/**
 * WHY:   Mobile assistant turns should render from a structured turn contract instead of raw arrays whenever possible.
 * WHAT:  Renders the mobile AG UI cards for a single assistant turn.
 * HOW:   Uses a tiny local registry that reuses existing mobile property and insight card primitives.
 */
export function MobileAgUiTurnRenderer({
  turn,
  onPropertyPress,
  onOpenProperty,
  onFollowupPromptPress,
}: {
  turn: MobileAgUiTurn;
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onFollowupPromptPress: (prompt: string) => void;
}) {
  const layout = useMobileLayout();

  return (
    <View className="mt-6 w-full gap-4">
      {turn.cards.map((card) => {
        switch (card.componentId) {
          case "property_shortlist":
            return (
              <PropertyRecommendationRow
                key={card.id}
                properties={(card.props.properties as MobileProperty[]) ?? []}
                onPropertyPress={onPropertyPress}
                onOpenProperty={onOpenProperty}
              />
            );
          case "bank_offer":
            return (
              <BankOfferCard 
                key={card.id} 
                offer={card.props as any}
                onPress={() => onFollowupPromptPress(`اطلب تمويل من ${card.props.bankName}`)} 
              />
            );
          case "followup_prompt":
            return (
              <FollowupPromptCard
                key={card.id}
                layout={layout}
                title={String(card.props.title ?? "الخطوة التالية")}
                summary={String(card.props.summary ?? "أكمل من نفس المحادثة وسأتولى الخطوة التالية.")}
                actionLabel={String(card.props.actionLabel ?? "اطلب مستشاراً")}
                onPress={() => onFollowupPromptPress(String(card.props.actionLabel ?? "اطلب مستشاراً"))}
              />
            );
          case "comparison_table":
          case "mortgage_check":
          case "loan_calculator":
          case "roi_projection":
          case "market_analysis":
          case "insight_brief":
          case "accent_note":
          case "broker_profile":
          case "developer_profile":
          case "permit_status":
            return <InsightCard key={card.id} card={card.props as any} />;
          default:
            return null;
        }
      })}
    </View>
  );
}

function FollowupPromptCard({
  layout,
  title,
  summary,
  actionLabel,
  onPress,
}: {
  layout: ReturnType<typeof useMobileLayout>;
  title: string;
  summary: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <View
      className="overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      style={{ borderRadius: layout.cardRadius + 4 }}
    >
      <View className="gap-2 px-4 py-4">
        <AppText responsiveRole="bodyStrong" className="font-cairo-black text-slate-900 dark:text-slate-50">
          {title}
        </AppText>
        <AppText responsiveRole="body" className="font-medium text-slate-500 dark:text-slate-400">
          {summary}
        </AppText>
      </View>
      <View className="border-t border-slate-100 px-4 py-4 dark:border-slate-800">
        <Pressable
          className="items-center justify-center rounded-full bg-slate-900 px-4 py-3 dark:bg-slate-50"
          onPress={onPress}
        >
          <AppText responsiveRole="chip" className="font-cairo-black text-white dark:text-slate-950">
            {actionLabel}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
