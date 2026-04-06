import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { InsightCard } from "@/components/chat/InsightCard";
import { PropertyRecommendationRow } from "@/components/chat/PropertyRecommendationRow";
import { BankOfferCard } from "@/components/chat/BankOfferCard";
import { MobilePill, MobileSurface } from "@/components/ui/MobileChrome";
import { useAppTheme } from "@/lib/mobileTheme";
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
  onOpenGallery,
  onFollowupPromptPress,
  ambientBackgroundColor,
}: {
  turn: MobileAgUiTurn;
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  onFollowupPromptPress: (prompt: string) => void;
  ambientBackgroundColor?: string;
}) {
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
                onOpenGallery={onOpenGallery}
                onShowMore={() => onFollowupPromptPress("اعرض نتائج مشابهة")}
                ambientBackgroundColor={ambientBackgroundColor}
                cardVariant="generated"
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
          case "roi_summary":
          case "payment_plan":
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
  title,
  summary,
  actionLabel,
  onPress,
}: {
  title: string;
  summary: string;
  actionLabel: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();

  return (
    <MobileSurface tone="muted" radius="card" className="overflow-hidden px-5 py-5">
      <View
        className="gap-2 pb-5"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
      >
        <AppText responsiveRole="title" className="font-cairo-bold text-right" style={{ color: theme.colors.ink }}>
          {title}
        </AppText>
        <AppText responsiveRole="body" className="font-medium text-right" style={{ color: theme.colors.inkMuted }}>
          {summary}
        </AppText>
      </View>
      <View className="pt-5 flex-row-reverse">
        <MobilePill label={actionLabel} tone="primary" active onPress={onPress} />
      </View>
    </MobileSurface>
  );
}
