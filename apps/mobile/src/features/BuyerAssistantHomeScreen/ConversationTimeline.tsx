import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, View } from "react-native";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import {
  Bath,
  BedDouble,
  Building2,
  ChevronLeft,
  MapPin,
  Percent,
  Ruler,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react-native";
import { Image } from "expo-image";
import { MobilePropertyListItem } from "@/components/property/MobilePropertyListItem";
import { AppText } from "@/components/ui/AppText";
import { MobilePill, MobileSectionHeading } from "@/components/ui/MobileChrome";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getPropertyHeroImage, getPropertyLocationLabel } from "@/lib/mobileData";
import { mobileTheme } from "@/lib/mobileTheme";
import type { MobileConversationMessage, MobileProperty, MobileSearchContext } from "@/types/mobile";

type ConversationTimelineProps = {
  listRef: RefObject<FlashListRef<MobileConversationMessage> | null>;
  messages: MobileConversationMessage[];
  isTyping?: boolean;
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onSuggestedPromptPress: (prompt: string) => void;
  bottomPadding?: number;
  contextProperty?: MobileProperty | null;
  showLatestSuggestedPrompts?: boolean;
  onShowMoreSearchResults?: (searchContext: MobileSearchContext) => void;
};

/**
 * WHY:   The buyer home screen needs a screen-owned conversation layout instead of rendering through the old shared chat widgets.
 * WHAT:  Renders the mobile assistant timeline with bespoke message sections, property shelves, search summaries, and structured insight blocks.
 * HOW:   Reuses only the message data contract while composing feature-local surfaces for each visible conversation outcome.
 */
export function ConversationTimeline({
  listRef,
  messages,
  isTyping,
  onPropertyPress,
  onOpenProperty,
  onSuggestedPromptPress,
  bottomPadding = 40,
  contextProperty,
  showLatestSuggestedPrompts = true,
  onShowMoreSearchResults,
}: ConversationTimelineProps) {
  const data = [...messages];
  const latestSuggestedPromptMessageId =
    messages
      .slice()
      .reverse()
      .find((message) => message.role === "assistant" && (message.suggestedPrompts?.length ?? 0) > 0)?.id ?? null;

  if (isTyping) {
    data.push({ id: "typing-indicator", role: "assistant", text: "TYPING_INDICATOR" });
  }

  return (
    <FlashList
      ref={listRef}
      data={data}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: bottomPadding }}
      ListHeaderComponent={
        contextProperty ? (
          <ContextPropertyPanel
            property={contextProperty}
            onPress={() => (onOpenProperty ? onOpenProperty(contextProperty) : onPropertyPress(contextProperty))}
          />
        ) : null
      }
      maintainVisibleContentPosition={{ autoscrollToBottomThreshold: 0.2 }}
      renderItem={({ item }) => (
        <View className="mb-7">
          {item.text === "TYPING_INDICATOR" ? (
            <TypingPanel />
          ) : (
            <ConversationEntry
              message={item}
              onPropertyPress={onPropertyPress}
              onOpenProperty={onOpenProperty}
              onSuggestedPromptPress={onSuggestedPromptPress}
              showSuggestedPrompts={showLatestSuggestedPrompts && item.id === latestSuggestedPromptMessageId}
              onShowMoreSearchResults={onShowMoreSearchResults}
            />
          )}
        </View>
      )}
    />
  );
}

function ConversationEntry({
  message,
  onPropertyPress,
  onOpenProperty,
  onSuggestedPromptPress,
  showSuggestedPrompts,
  onShowMoreSearchResults,
}: {
  message: MobileConversationMessage;
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onSuggestedPromptPress: (prompt: string) => void;
  showSuggestedPrompts: boolean;
  onShowMoreSearchResults?: (searchContext: MobileSearchContext) => void;
}) {
  const isUser = message.role === "user";
  const structuredCards = message.uiTurn?.cards ?? [];

  return (
    <View className={isUser ? "items-start" : "items-stretch"} style={{ gap: 14 }}>
      {isUser ? <UserPromptPanel text={message.text} /> : <AssistantNarrativePanel text={message.text} />}

      {structuredCards.length > 0 ? (
        <View className="gap-4">
          {structuredCards.map((card) => (
            <StructuredCardPanel
              key={card.id}
              card={card}
              onPropertyPress={onPropertyPress}
              onOpenProperty={onOpenProperty}
              onSuggestedPromptPress={onSuggestedPromptPress}
            />
          ))}
        </View>
      ) : null}

      {!message.uiTurn && (message.properties?.length ?? 0) > 0 ? (
        <PropertyShelf
          title="ترشيحات من نفس المحادثة"
          description="هذه الوحدات قريبة من الطلب الحالي ويمكنك فتح أي واحدة أو متابعة الخطوة التالية منها."
          properties={message.properties ?? []}
          onPropertyPress={onPropertyPress}
          onOpenProperty={onOpenProperty}
        />
      ) : null}

      {message.searchContext && (message.searchResults?.length ?? 0) > 0 ? (
        <SearchResultSection
          searchContext={message.searchContext}
          summary={message.searchContext.searchSummary}
          properties={message.searchResults ?? []}
          onPropertyPress={onPropertyPress}
          onOpenProperty={onOpenProperty}
          onShowMoreSearchResults={onShowMoreSearchResults}
        />
      ) : null}

      {!message.uiTurn && (message.cards?.length ?? 0) > 0 ? (
        <View className="gap-4">
          {(message.cards ?? []).map((card, index) => (
            <InsightSummaryPanel key={`${card.type}-${index}`} card={card} />
          ))}
        </View>
      ) : null}

      {showSuggestedPrompts && (message.suggestedPrompts?.length ?? 0) > 0 ? (
        <PromptTray prompts={message.suggestedPrompts ?? []} onPress={onSuggestedPromptPress} />
      ) : null}
    </View>
  );
}

function UserPromptPanel({ text }: { text: string }) {
  const startsWithLatin = /^[A-Za-z0-9]/.test(text.trim());
  return (
    <View
      className="px-5 py-4"
      style={{
        maxWidth: "84%",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 18,
        backgroundColor: mobileTheme.colors.dark,
      }}
    >
      <AppText
        className="text-[15px] font-cairo-medium text-white"
        style={{ textAlign: startsWithLatin ? "left" : "right", writingDirection: startsWithLatin ? "ltr" : "rtl" }}
      >
        {text}
      </AppText>
    </View>
  );
}

function AssistantNarrativePanel({ text }: { text: string }) {
  return (
    <View className="gap-3">
      <View className="flex-row-reverse items-center gap-2">
        <MobilePill label="وكيل عنان" tone="primary" active className="min-h-0 px-3 py-1.5" />
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 28, height: 28, borderWidth: 1, borderColor: "#D4E2FF", backgroundColor: "#FFFFFF" }}
        >
          <Sparkles size={14} color={mobileTheme.colors.primary} />
        </View>
      </View>

      <View className="px-1">
        <AppText className="text-[15px] leading-8 font-cairo-bold text-slate-900">{text}</AppText>
      </View>
    </View>
  );
}

function ContextPropertyPanel({
  property,
  onPress,
}: {
  property: MobileProperty;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="mb-4 active:opacity-95">
      <View
        className="rounded-[24px] px-4 py-4"
        style={{
          borderWidth: 1,
          borderColor: "#E5E7EB",
          backgroundColor: "#F3F4F6",
        }}
      >
        <View className="flex-row-reverse items-center justify-between">
          <View className="flex-1">
            <AppText className="text-[12px] font-cairo-black text-slate-500">العقار الجاري داخل المحادثة</AppText>
            <AppText className="mt-1 text-[18px] font-cairo-black text-slate-900" numberOfLines={1}>
              {property.title}
            </AppText>
            <View className="mt-2 flex-row-reverse items-center gap-2">
              <MapPin size={14} color={mobileTheme.colors.primary} />
              <AppText className="flex-1 text-[13px] font-bold text-slate-500" numberOfLines={1}>
                {getPropertyLocationLabel(property)}
              </AppText>
            </View>
          </View>
          <MobilePill label="فتح" tone="primary" active />
        </View>
      </View>
    </Pressable>
  );
}

function PropertyShelf({
  title,
  description,
  properties,
  onPropertyPress,
  onOpenProperty,
}: {
  title: string;
  description: string;
  properties: MobileProperty[];
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
}) {
  return (
    <View className="gap-4">
      <MobileSectionHeading title={title} description={description} eyebrow="SHORTLIST" />
      <View className="gap-4">
        {properties.map((property) => (
          <ConversationPropertyCard
            key={property.id}
            property={property}
            onPrimaryAction={onPropertyPress}
            onSecondaryAction={onOpenProperty}
          />
        ))}
      </View>
    </View>
  );
}

function SearchResultSection({
  searchContext,
  summary,
  properties,
  onPropertyPress,
  onOpenProperty,
  onShowMoreSearchResults,
}: {
  searchContext: MobileSearchContext;
  summary: string;
  properties: MobileProperty[];
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onShowMoreSearchResults?: (searchContext: MobileSearchContext) => void;
}) {
  const previewResults = properties.slice(0, 3);
  const hasMore = properties.length > 3;

  return (
    <View className="gap-4">
      <View className="flex-row-reverse items-start gap-3">
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 40, height: 40, borderWidth: 1, borderColor: "#D4E2FF", backgroundColor: "#FFFFFF" }}
        >
          <Search size={18} color={mobileTheme.colors.primary} />
        </View>
        <View className="flex-1">
          <AppText className="text-[17px] font-cairo-black text-slate-900">نتائج بحث مرتبطة بالمحادثة</AppText>
          <AppText className="mt-2 text-[14px] leading-7 text-slate-600">{summary}</AppText>
        </View>
      </View>

      <View className="gap-4">
        {previewResults.map((property) => (
          <ConversationPropertyCard
            key={property.id}
            property={property}
            onPrimaryAction={onPropertyPress}
            onSecondaryAction={onOpenProperty}
          />
        ))}

        {hasMore && onShowMoreSearchResults ? (
          <Pressable
            onPress={() => onShowMoreSearchResults(searchContext)}
            className="flex-row-reverse items-center justify-between rounded-[22px] px-4 py-4 active:opacity-90"
            style={{
              borderWidth: 1,
              borderColor: mobileTheme.colors.border,
              backgroundColor: mobileTheme.colors.surfaceMuted,
            }}
          >
            <ChevronLeft size={16} color={mobileTheme.colors.primary} />
            <View className="flex-1 items-end">
              <AppText className="text-right text-[15px] font-cairo-black text-slate-900">عرض المزيد</AppText>
              <AppText className="mt-1 text-right text-[12px] font-bold text-slate-500">
                افتح كل النتائج المرتبطة بنفس الطلب
              </AppText>
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ConversationPropertyCard({
  property,
  onPrimaryAction,
  onSecondaryAction,
}: {
  property: MobileProperty;
  onPrimaryAction: (property: MobileProperty) => void;
  onSecondaryAction?: (property: MobileProperty) => void;
}) {
  return (
    <MobilePropertyListItem
      property={property}
      onPress={(nextProperty) => (onSecondaryAction ? onSecondaryAction(nextProperty) : onPrimaryAction(nextProperty))}
      onActionPress={onPrimaryAction}
      actionLabel="تابع من هنا"
      compact
    />
  );
}

function StructuredCardPanel({
  card,
  onPropertyPress,
  onOpenProperty,
  onSuggestedPromptPress,
}: {
  card: any;
  onPropertyPress: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onSuggestedPromptPress: (prompt: string) => void;
}) {
  switch (card.componentId) {
    case "property_shortlist":
      return (
        <PropertyShelf
          title={String(card.props.title ?? "خيارات مقترحة")}
          description={String(card.props.summary ?? "اختر عقاراً للمتابعة من نفس المحادثة.")}
          properties={(card.props.properties as MobileProperty[]) ?? []}
          onPropertyPress={onPropertyPress}
          onOpenProperty={onOpenProperty}
        />
      );
    case "bank_offer":
      return <BankOfferPanel offer={card.props} onSuggestedPromptPress={onSuggestedPromptPress} />;
    case "followup_prompt":
      return (
        <NextStepPanel
          title={String(card.props.title ?? "الخطوة التالية")}
          summary={String(card.props.summary ?? "أكمل من نفس المحادثة وسأتولى الخطوة التالية.")}
          actionLabel={String(card.props.actionLabel ?? "أكمل")}
          onPress={() => onSuggestedPromptPress(String(card.props.actionLabel ?? "أكمل"))}
        />
      );
    default:
      return <InsightSummaryPanel card={card.props} />;
  }
}

function BankOfferPanel({
  offer,
  onSuggestedPromptPress,
}: {
  offer: any;
  onSuggestedPromptPress: (prompt: string) => void;
}) {
  return (
    <View
      className="rounded-[24px] px-4 py-4"
      style={{
        borderWidth: 1,
        borderColor: mobileTheme.colors.border,
        backgroundColor: "#F3F4F6",
      }}
    >
      <View className="flex-row-reverse items-center justify-between">
        <View className="flex-row-reverse items-center gap-2">
          <View
            className="items-center justify-center rounded-full"
            style={{ width: 36, height: 36, backgroundColor: mobileTheme.colors.primarySoft }}
          >
            <Wallet size={18} color={mobileTheme.colors.primary} />
          </View>
          <AppText className="text-[18px] font-cairo-black text-slate-900">{String(offer.bankName ?? "عرض بنكي")}</AppText>
        </View>
        <MobilePill label={String(offer.rateLabel ?? "تمويل")} tone="primary" active />
      </View>

      <View className="mt-4 gap-3">
        <InsightRow label="القسط الشهري" value={formatCurrency(Number(offer.monthlyEstimate ?? 0))} emphasized />
        <InsightRow label="الدفعة الأولى" value={`${String(offer.downPaymentPercent ?? 0)}%`} />
        <InsightRow label="البرنامج" value={String(offer.rateLabel ?? "تمويل عقاري")} last />
      </View>

      <View className="mt-4 items-end">
        <MobilePill
          label={`اطلب تمويل من ${String(offer.bankName ?? "البنك")}`}
          tone="dark"
          active
          onPress={() => onSuggestedPromptPress(`اطلب تمويل من ${String(offer.bankName ?? "البنك")}`)}
        />
      </View>
    </View>
  );
}

function NextStepPanel({
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
  return (
    <View
      className="rounded-[24px] px-4 py-4"
      style={{
        borderWidth: 1,
        borderColor: "#D4E2FF",
        backgroundColor: "#F8FAFF",
      }}
    >
      <MobileSectionHeading eyebrow="NEXT STEP" title={title} description={summary} />
      <View className="mt-4 items-end">
        <MobilePill label={actionLabel} tone="dark" active onPress={onPress} />
      </View>
    </View>
  );
}

function InsightSummaryPanel({ card }: { card: any }) {
  const icon = resolveInsightIcon(card);
  const rows = extractInsightRows(card);

  return (
    <View
      className="rounded-[24px] px-4 py-4"
      style={{
        borderWidth: 1,
        borderColor: resolveInsightTone(card) === "highlight" ? "#D4E2FF" : mobileTheme.colors.border,
        backgroundColor:
          resolveInsightTone(card) === "highlight"
            ? "#F8FAFF"
            : resolveInsightTone(card) === "success"
              ? mobileTheme.colors.successSoft
              : resolveInsightTone(card) === "danger"
                ? mobileTheme.colors.dangerSoft
                : "#FFFFFF",
      }}
    >
      <View className="flex-row-reverse items-center justify-between gap-3">
        <View className="flex-1">
          <AppText className="text-[18px] font-cairo-black text-slate-900">{String(card.title ?? "ملخص")}</AppText>
          {card.summary ? (
            <AppText className="mt-2 text-[14px] leading-7 text-slate-600">{String(card.summary)}</AppText>
          ) : null}
        </View>
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 40, height: 40, backgroundColor: mobileTheme.colors.surface }}
        >
          {icon}
        </View>
      </View>

      {card.body ? (
        <AppText className="mt-4 text-[14px] leading-7 text-slate-700">{String(card.body)}</AppText>
      ) : null}

      {card.rows ? (
        <ComparisonTable rows={card.rows} />
      ) : rows.length > 0 ? (
        <View className="mt-4 gap-3">
          {rows.map((row, index) => (
            <InsightRow
              key={`${row.label}-${index}`}
              label={row.label}
              value={row.value}
              emphasized={row.emphasized}
              last={index === rows.length - 1}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ComparisonTable({ rows }: { rows: Array<Array<string>> }) {
  return (
    <View
      className="mt-4 overflow-hidden"
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: mobileTheme.colors.border,
        backgroundColor: mobileTheme.colors.surface,
      }}
    >
      {rows.map((row, rowIndex) => (
        <View
          key={`${row.join("-")}-${rowIndex}`}
          className="flex-row-reverse px-4 py-3"
          style={{
            borderBottomWidth: rowIndex === rows.length - 1 ? 0 : 1,
            borderBottomColor: mobileTheme.colors.border,
            backgroundColor: rowIndex === 0 ? mobileTheme.colors.surfaceMuted : mobileTheme.colors.surface,
          }}
        >
          {row.map((cell, cellIndex) => (
            <View key={`${cell}-${cellIndex}`} className="flex-1">
              <AppText className={rowIndex === 0 ? "text-[12px] font-cairo-black text-slate-500" : "text-[13px] font-cairo-bold text-slate-900"}>
                {cell}
              </AppText>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function InsightRow({
  label,
  value,
  emphasized = false,
  last = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  last?: boolean;
}) {
  return (
    <View
      className="flex-row-reverse items-center justify-between py-3"
      style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: mobileTheme.colors.border }}
    >
      <AppText className="max-w-[46%] text-[13px] font-cairo-black text-slate-500">{label}</AppText>
      <AppText className={emphasized ? "max-w-[48%] text-left text-[15px] font-cairo-black text-blue-700" : "max-w-[48%] text-left text-[15px] font-cairo-bold text-slate-900"}>
        {value}
      </AppText>
    </View>
  );
}

function PromptTray({
  prompts,
  onPress,
}: {
  prompts: string[];
  onPress: (prompt: string) => void;
}) {
  return (
    <View className="gap-3">
      {prompts.map((prompt) => (
        <Pressable
          key={prompt}
          onPress={() => onPress(prompt)}
          className="rounded-full px-4 py-4"
          style={{
            borderWidth: 1,
            borderColor: "rgba(15,23,42,0.08)",
            backgroundColor: "#16181E",
          }}
        >
          <AppText className="text-[13px] font-cairo-black text-white">{prompt}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

function TypingPanel() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View
      className="self-end rounded-full px-4 py-3"
      style={{
        borderWidth: 1,
        borderColor: "#D4E2FF",
        backgroundColor: "#F8FAFF",
      }}
    >
      <Animated.View style={{ opacity }} className="flex-row-reverse items-center gap-3">
        <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: mobileTheme.colors.primary }} />
        <AppText className="text-[13px] font-cairo-black text-blue-700">تحليل الطلب الآن...</AppText>
      </Animated.View>
    </View>
  );
}

function resolveInsightTone(card: any): "default" | "muted" | "highlight" | "success" | "danger" {
  if (card.type === "permit_status" && card.permitStatus === "verified") return "success";
  if (card.type === "accent_note" && card.tone === "warning") return "danger";
  if (card.type === "mortgage_check" || card.type === "market_analysis") return "highlight";
  return "muted";
}

function resolveInsightIcon(card: any) {
  switch (card.type) {
    case "broker_profile":
      return <User size={18} color={mobileTheme.colors.primary} />;
    case "developer_profile":
      return <Building2 size={18} color={mobileTheme.colors.primary} />;
    case "market_analysis":
      return <TrendingUp size={18} color={mobileTheme.colors.primary} />;
    case "roi_summary":
    case "roi_projection":
      return <Percent size={18} color={mobileTheme.colors.primary} />;
    case "loan_calculator":
    case "payment_plan":
    case "mortgage_check":
    case "bank_offer":
      return <Wallet size={18} color={mobileTheme.colors.primary} />;
    case "permit_status":
      return <ShieldCheck size={18} color={mobileTheme.colors.success} />;
    default:
      return <Sparkles size={18} color={mobileTheme.colors.primary} />;
  }
}

function extractInsightRows(card: any): Array<{ label: string; value: string; emphasized?: boolean }> {
  switch (card.type) {
    case "broker_profile":
      return [
        { label: "الوسيط", value: String(card.brokerName ?? "-"), emphasized: true },
        { label: "الوكالة", value: String(card.brokerAgency ?? "-") },
        { label: "التقييم", value: `${String(card.rating ?? "-")} / 5` },
        { label: "وحدات نشطة", value: String(card.activeListings ?? "-") },
      ];
    case "developer_profile":
      return [
        { label: "المطور", value: String(card.developerName ?? "-"), emphasized: true },
        { label: "سنة التأسيس", value: String(card.establishedYear ?? "-") },
        { label: "مشاريع منجزة", value: String(card.completedProjects ?? "-") },
      ];
    case "market_analysis":
      return [
        { label: "المنطقة", value: String(card.location ?? "-"), emphasized: true },
        { label: "متوسط سعر المتر", value: formatCurrency(Number(card.averagePrice ?? 0)) },
        {
          label: "اتجاه السوق",
          value: `${card.priceTrend === "up" ? "▲" : card.priceTrend === "down" ? "▼" : "•"} ${String(card.trendPercentage ?? 0)}%`,
          emphasized: true,
        },
      ];
    case "roi_summary":
      return [
        { label: "سعر الشراء", value: formatCurrency(Number(card.purchasePrice ?? 0)) },
        { label: "الإيجار السنوي", value: formatCurrency(Number(card.estimatedAnnualRent ?? 0)) },
        { label: "العائد", value: formatPercent(Number(card.grossYieldPercent ?? 0)), emphasized: true },
      ];
    case "roi_projection":
      return [
        { label: "سعر الشراء", value: formatCurrency(Number(card.purchasePrice ?? 0)) },
        { label: "الإيجار السنوي", value: formatCurrency(Number(card.annualRent ?? 0)) },
        { label: "عائد الإيجار", value: formatPercent(Number(card.yieldPercent ?? 0)), emphasized: true },
      ];
    case "loan_calculator":
      return [
        { label: "قيمة العقار", value: formatCurrency(Number(card.propertyPrice ?? 0)) },
        { label: "الدفعة المقدمة", value: formatCurrency(Number(card.downPayment ?? 0)) },
        { label: "المدة", value: `${String(card.years ?? 0)} سنة`, emphasized: true },
      ];
    case "payment_plan":
      return [
        { label: "الدفعة الأولى", value: formatCurrency(Number(card.downPayment ?? 0)) },
        { label: "القسط الشهري", value: formatCurrency(Number(card.monthlyInstallment ?? 0)), emphasized: true },
        { label: "مدة السداد", value: `${String(card.durationMonths ?? 0)} شهر` },
      ];
    case "mortgage_check":
      return [
        { label: "الحالة", value: mortgageLabel(String(card.estimatedEligibility ?? "review")), emphasized: true },
        ...(card.recommendedBudget ? [{ label: "ميزانية مقترحة", value: formatCurrency(Number(card.recommendedBudget)) }] : []),
        ...(card.monthlyInstallmentEstimate
          ? [{ label: "قسط تقريبي", value: formatCurrency(Number(card.monthlyInstallmentEstimate)) }]
          : []),
      ];
    case "permit_status":
      return [{ label: "التحقق", value: permitLabel(String(card.permitStatus ?? "pending_review")), emphasized: true }];
    case "bank_offer":
      return [
        { label: "البنك", value: String(card.bankName ?? "-"), emphasized: true },
        { label: "البرنامج", value: String(card.rateLabel ?? "-") },
        { label: "القسط الشهري", value: formatCurrency(Number(card.monthlyEstimate ?? 0)) },
      ];
    case "accent_note":
      return [{ label: "الحالة", value: String(card.tone === "success" ? "إيجابي" : card.tone === "warning" ? "تنبيه" : "معلومة"), emphasized: true }];
    default:
      return [];
  }
}

function mortgageLabel(value: string) {
  if (value === "eligible") return "مؤهل مبدئياً";
  if (value === "review") return "بحاجة مراجعة";
  return "نحتاج بيانات إضافية";
}

function permitLabel(value: string) {
  if (value === "verified") return "موثق";
  if (value === "pending_review") return "مراجعة معلقة";
  return "غير متاح";
}
