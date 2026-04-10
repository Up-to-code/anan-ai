import React, { useEffect, useRef, type RefObject } from "react";
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
import { CursorCardShell } from "@/components/property/CursorCardShell";
import { CursorPropertyMediaViewer } from "@/components/property/CursorPropertyMediaViewer";
import { MobilePropertyCard, type MobilePropertyCardVariant } from "@/components/property/MobilePropertyCard";
import { AppText } from "@/components/ui/AppText";
import { MobilePill, MobileSectionHeading } from "@/components/ui/MobileChrome";
import { cn } from "@/lib/cn";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { formatMobileCopy, getMobileDictionary } from "@/lib/i18n";
import type { MobileLocale } from "@/lib/locale";
import { useMobileLocale } from "@/lib/mobileLocale";
import { getPropertyHeroImage, getPropertyLocationLabel } from "@/lib/mobileData";
import { useAppTheme, type AppTheme } from "@/lib/mobileTheme";
import type { MobileConversationMessage, MobileProperty, MobileSearchContext } from "@/types/mobile";

type ConversationTimelineProps = {
  listRef: RefObject<FlashListRef<MobileConversationMessage> | null>;
  messages: MobileConversationMessage[];
  isTyping?: boolean;
  onPropertyPress: (property: MobileProperty) => void;
  onAddPropertyToSelection?: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  onSuggestedPromptPress: (prompt: string) => void;
  bottomPadding?: number;
  contextProperty?: MobileProperty | null;
  showLatestSuggestedPrompts?: boolean;
  onShowMoreSearchResults?: (searchContext: MobileSearchContext) => void;
  ambientBackgroundColor?: string;
  selectedPropertyIds?: string[];
  comparePicking?: boolean;
  maxCompareProperties?: number;
};

/**
 * WHAT:  Timeline showing messages using the Unified Rounded layout rules.
 */
export function ConversationTimeline({
  listRef,
  messages,
  isTyping,
  onPropertyPress,
  onAddPropertyToSelection,
  onOpenProperty,
  onOpenGallery,
  onSuggestedPromptPress,
  bottomPadding = 40,
  contextProperty,
  showLatestSuggestedPrompts = true,
  onShowMoreSearchResults,
  ambientBackgroundColor,
  selectedPropertyIds = [],
  comparePicking = false,
  maxCompareProperties = 3,
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
      contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: bottomPadding }}
      ListHeaderComponent={
        contextProperty ? (
          <ContextPropertyPanel
            property={contextProperty}
            onPress={() => (onOpenProperty ? onOpenProperty(contextProperty) : onPropertyPress(contextProperty))}
            ambientBackgroundColor={ambientBackgroundColor}
          />
        ) : null
      }
      maintainVisibleContentPosition={{ autoscrollToBottomThreshold: 0.2 }}
      renderItem={({ item }) => (
        <View className="mb-5">
          {item.text === "TYPING_INDICATOR" ? (
            <TypingPanel />
          ) : (
            <ConversationEntry
              message={item}
              onPropertyPress={onPropertyPress}
              onAddPropertyToSelection={onAddPropertyToSelection}
              onOpenProperty={onOpenProperty}
              onOpenGallery={onOpenGallery}
              onSuggestedPromptPress={onSuggestedPromptPress}
              showSuggestedPrompts={showLatestSuggestedPrompts && item.id === latestSuggestedPromptMessageId}
              onShowMoreSearchResults={onShowMoreSearchResults}
              ambientBackgroundColor={ambientBackgroundColor}
              selectedPropertyIds={selectedPropertyIds}
              comparePicking={comparePicking}
              maxCompareProperties={maxCompareProperties}
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
  onAddPropertyToSelection,
  onOpenProperty,
  onOpenGallery,
  onSuggestedPromptPress,
  showSuggestedPrompts,
  onShowMoreSearchResults,
  ambientBackgroundColor,
  selectedPropertyIds,
  comparePicking,
  maxCompareProperties,
}: {
  message: MobileConversationMessage;
  onPropertyPress: (property: MobileProperty) => void;
  onAddPropertyToSelection?: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  onSuggestedPromptPress: (prompt: string) => void;
  showSuggestedPrompts: boolean;
  onShowMoreSearchResults?: (searchContext: MobileSearchContext) => void;
  ambientBackgroundColor?: string;
  selectedPropertyIds: string[];
  comparePicking: boolean;
  maxCompareProperties: number;
}) {
  const isUser = message.role === "user";
  const structuredCards = message.uiTurn?.cards ?? [];
  const { dictionary } = useMobileLocale();

  return (
    <View className={isUser ? "items-start" : "items-stretch"} style={{ gap: 12 }}>
      {isUser ? <UserPromptPanel text={message.text} /> : <AssistantNarrativePanel text={message.text} />}

      {structuredCards.length > 0 ? (
        <View className="gap-4">
          {structuredCards.map((card) => (
            <StructuredCardPanel
              key={card.id}
              card={card}
              onPropertyPress={onPropertyPress}
              onAddPropertyToSelection={onAddPropertyToSelection}
              onOpenProperty={onOpenProperty}
              onOpenGallery={onOpenGallery}
              onSuggestedPromptPress={onSuggestedPromptPress}
              ambientBackgroundColor={ambientBackgroundColor}
              selectedPropertyIds={selectedPropertyIds}
              comparePicking={comparePicking}
              maxCompareProperties={maxCompareProperties}
              relatedProperties={message.properties ?? []}
            />
          ))}
        </View>
      ) : null}

      {!message.uiTurn && (message.properties?.length ?? 0) > 0 ? (
        <PropertyShelf
          title={dictionary.assistant.suggestedPropertiesTitle}
          description={dictionary.assistant.suggestedPropertiesBody}
          properties={message.properties ?? []}
          onPropertyPress={onPropertyPress}
          onAddPropertyToSelection={onAddPropertyToSelection}
          onOpenProperty={onOpenProperty}
          onOpenGallery={onOpenGallery}
          ambientBackgroundColor={ambientBackgroundColor}
          selectedPropertyIds={selectedPropertyIds}
          comparePicking={comparePicking}
          maxCompareProperties={maxCompareProperties}
        />
      ) : null}

      {message.searchContext && (message.searchResults?.length ?? 0) > 0 ? (
        <SearchResultSection
          searchContext={message.searchContext}
          summary={message.searchContext.searchSummary}
          properties={message.searchResults ?? []}
          onPropertyPress={onPropertyPress}
          onAddPropertyToSelection={onAddPropertyToSelection}
          onOpenProperty={onOpenProperty}
          onOpenGallery={onOpenGallery}
          onShowMoreSearchResults={onShowMoreSearchResults}
          ambientBackgroundColor={ambientBackgroundColor}
          selectedPropertyIds={selectedPropertyIds}
          comparePicking={comparePicking}
          maxCompareProperties={maxCompareProperties}
        />
      ) : null}

      {!message.uiTurn && (message.cards?.length ?? 0) > 0 ? (
        <View className="gap-4">
          {(message.cards ?? []).map((card, index) => (
            <InsightSummaryPanel key={`${card.type}-${index}`} card={card} relatedProperties={message.properties ?? []} />
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
  const theme = useAppTheme();
  const startsWithLatin = /^[A-Za-z0-9]/.test(text.trim());
  return (
    <View
      className="px-5 py-3"
      style={{
        maxWidth: "84%",
        borderRadius: theme.radii.bubble, // Soft unified bubble
        backgroundColor: theme.colors.userBubble,
      }}
    >
      <AppText
        className="text-[15px] font-cairo-medium leading-relaxed"
        style={{
          textAlign: startsWithLatin ? "left" : "right",
          writingDirection: startsWithLatin ? "ltr" : "rtl",
          color: theme.colors.userBubbleText,
        }}
      >
        {text}
      </AppText>
    </View>
  );
}

function AssistantNarrativePanel({ text }: { text: string }) {
  const theme = useAppTheme();
  const { dictionary, isRtl, locale } = useMobileLocale();
  return (
    <View className="gap-2">
      <View className={cn("items-center gap-2", isRtl ? "flex-row-reverse" : "flex-row")}>
        <AppText className="text-[12px] font-cairo-bold" style={{ color: theme.colors.primary }}>{dictionary.assistant.title}</AppText>
      </View>
      <View className="px-1">
        <AppText className="text-[15px] leading-8 font-cairo-medium" style={{ color: theme.colors.ink }}>{text}</AppText>
      </View>
    </View>
  );
}

function ContextPropertyPanel({
  property,
  onPress,
  ambientBackgroundColor,
}: {
  property: MobileProperty;
  onPress: () => void;
  ambientBackgroundColor?: string;
}) {
  const theme = useAppTheme();
  const { dictionary, isRtl } = useMobileLocale();
  return (
    <Pressable onPress={onPress} className="mb-4 active:opacity-95">
      <CursorCardShell ambientBackgroundColor={ambientBackgroundColor}>
        <View
          className="px-5 py-4"
          style={{
            backgroundColor: theme.colors.surfaceMuted,
          }}
        >
          <View className={cn("items-center justify-between", isRtl ? "flex-row-reverse" : "flex-row")}>
            <View className="flex-1">
              <AppText className={cn("text-[11px] font-cairo-bold", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.inkMuted }}>
                {dictionary.navigation.propertyDetail}
              </AppText>
              <AppText className={cn("mt-1 text-[16px] font-cairo-bold", isRtl ? "text-right" : "text-left")} numberOfLines={1} style={{ color: theme.colors.ink }}>
                {property.title}
              </AppText>
              <View className={cn("mt-2 items-center gap-2", isRtl ? "flex-row-reverse" : "flex-row")}>
                <MapPin size={14} color={theme.colors.primary} />
                <AppText className={cn("flex-1 text-[13px] font-medium tracking-tight", isRtl ? "text-right" : "text-left")} numberOfLines={1} style={{ color: theme.colors.inkMuted }}>
                  {getPropertyLocationLabel(property)}
                </AppText>
              </View>
            </View>
            <MobilePill label={dictionary.navigation.propertyDetail} tone="default" />
          </View>
        </View>
      </CursorCardShell>
    </Pressable>
  );
}

function PropertyShelf({
  title,
  description,
  properties,
  onPropertyPress,
  onAddPropertyToSelection,
  onOpenProperty,
  onOpenGallery,
  ambientBackgroundColor,
  cardVariant = "compact",
  selectedPropertyIds,
  comparePicking,
  maxCompareProperties,
}: {
  title: string;
  description: string;
  properties: MobileProperty[];
  onPropertyPress: (property: MobileProperty) => void;
  onAddPropertyToSelection?: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  ambientBackgroundColor?: string;
  cardVariant?: MobilePropertyCardVariant;
  selectedPropertyIds: string[];
  comparePicking: boolean;
  maxCompareProperties: number;
}) {
  const { dictionary } = useMobileLocale();
  return (
    <View className="gap-4">
      <MobileSectionHeading title={title} description={description} eyebrow={dictionary.assistant.searchResultsTitle} />
      <View className="gap-4">
        {properties.map((property) => (
          <ConversationPropertyCard
            key={property.id}
            property={property}
            onPrimaryAction={onPropertyPress}
            onCompareSelect={onAddPropertyToSelection}
            onSecondaryAction={onOpenProperty}
            onOpenGallery={onOpenGallery}
            ambientBackgroundColor={ambientBackgroundColor}
            variant={cardVariant}
            selectedPropertyIds={selectedPropertyIds}
            comparePicking={comparePicking}
            maxCompareProperties={maxCompareProperties}
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
  onAddPropertyToSelection,
  onOpenProperty,
  onOpenGallery,
  onShowMoreSearchResults,
  ambientBackgroundColor,
  selectedPropertyIds,
  comparePicking,
  maxCompareProperties,
}: {
  searchContext: MobileSearchContext;
  summary: string;
  properties: MobileProperty[];
  onPropertyPress: (property: MobileProperty) => void;
  onAddPropertyToSelection?: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  onShowMoreSearchResults?: (searchContext: MobileSearchContext) => void;
  ambientBackgroundColor?: string;
  selectedPropertyIds: string[];
  comparePicking: boolean;
  maxCompareProperties: number;
}) {
  const theme = useAppTheme();
  const { dictionary, isRtl } = useMobileLocale();
  const previewResults = properties.slice(0, 3);
  const hasMore = properties.length > 3;

  return (
    <View className="gap-4">
      <View className={cn("items-start gap-4", isRtl ? "flex-row-reverse" : "flex-row")}>
        <View
          className="items-center justify-center"
          style={{
            width: 44,
            height: 44,
            borderRadius: theme.radii.pill, // circular search icon
            backgroundColor: theme.colors.primarySoft,
          }}
        >
          <Search size={20} color={theme.colors.primary} />
        </View>
        <View className="flex-1 mt-1">
          <AppText className={cn("text-[18px] font-cairo-bold", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.ink }}>{dictionary.assistant.searchResultsTitle}</AppText>
          <AppText className={cn("mt-1-5 text-[14px] leading-7", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.inkMuted }}>{summary}</AppText>
        </View>
      </View>

      <View className="gap-4 mt-2">
        {previewResults.map((property) => (
          <ConversationPropertyCard
            key={property.id}
            property={property}
            onPrimaryAction={onPropertyPress}
            onCompareSelect={onAddPropertyToSelection}
            onSecondaryAction={onOpenProperty}
            onOpenGallery={onOpenGallery}
            ambientBackgroundColor={ambientBackgroundColor}
            selectedPropertyIds={selectedPropertyIds}
            comparePicking={comparePicking}
            maxCompareProperties={maxCompareProperties}
          />
        ))}

        {hasMore && onShowMoreSearchResults ? (
          <Pressable
            onPress={() => onShowMoreSearchResults(searchContext)}
            className={cn("items-center justify-between px-5 py-4 active:opacity-90 mt-1", isRtl ? "flex-row-reverse" : "flex-row")}
            style={{
              borderRadius: theme.radii.pill, // Use pill boundary for actions per system design
              borderWidth: 1,
              borderColor: theme.colors.borderStrong,
              backgroundColor: theme.colors.surface,
            }}
          >
            <ChevronLeft size={16} color={theme.colors.inkSoft} />
            <View className="flex-1">
              <AppText className={cn("text-[15px] font-cairo-bold", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.ink }}>{dictionary.search.resultsTitle}</AppText>
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
  onCompareSelect,
  onSecondaryAction,
  onOpenGallery,
  ambientBackgroundColor,
  variant = "compact",
  selectedPropertyIds,
  comparePicking,
  maxCompareProperties,
}: {
  property: MobileProperty;
  onPrimaryAction: (property: MobileProperty) => void;
  onCompareSelect?: (property: MobileProperty) => void;
  onSecondaryAction?: (property: MobileProperty) => void;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  ambientBackgroundColor?: string;
  variant?: MobilePropertyCardVariant;
  selectedPropertyIds: string[];
  comparePicking: boolean;
  maxCompareProperties: number;
}) {
  const { dictionary, locale } = useMobileLocale();
  const isSelected = selectedPropertyIds.includes(property.id);
  const selectionLimitReached = selectedPropertyIds.length >= maxCompareProperties;
  const actionLabel = comparePicking
    ? isSelected
      ? dictionary.assistant.selectedProperty
      : selectionLimitReached
        ? formatMobileCopy(dictionary.assistant.selectionLimit, { count: String(maxCompareProperties) })
        : dictionary.assistant.selectProperty
    : dictionary.common.continue;

  return (
    <MobilePropertyCard
      variant={variant}
      property={property}
      onPress={(nextProperty) => (onSecondaryAction ? onSecondaryAction(nextProperty) : onPrimaryAction(nextProperty))}
      onActionPress={
        comparePicking
          ? (onCompareSelect ? onCompareSelect : onPrimaryAction)
          : onPrimaryAction
      }
      onOpenGallery={onOpenGallery}
      actionLabel={actionLabel}
      actionDisabled={comparePicking && (isSelected || selectionLimitReached)}
      ambientBackgroundColor={ambientBackgroundColor}
    />
  );
}

function StructuredCardPanel({
  card,
  onPropertyPress,
  onAddPropertyToSelection,
  onOpenProperty,
  onOpenGallery,
  onSuggestedPromptPress,
  ambientBackgroundColor,
  selectedPropertyIds,
  comparePicking,
  maxCompareProperties,
  relatedProperties,
}: {
  card: any;
  onPropertyPress: (property: MobileProperty) => void;
  onAddPropertyToSelection?: (property: MobileProperty) => void;
  onOpenProperty?: (property: MobileProperty) => void;
  onOpenGallery?: (property: MobileProperty, initialIndex: number) => void;
  onSuggestedPromptPress: (prompt: string) => void;
  ambientBackgroundColor?: string;
  selectedPropertyIds: string[];
  comparePicking: boolean;
  maxCompareProperties: number;
  relatedProperties: MobileProperty[];
}) {
  const { dictionary, locale } = useMobileLocale();
  switch (card.componentId) {
    case "property_shortlist":
      return (
        <PropertyShelf
          title={String(card.props.title ?? dictionary.assistant.searchResultsTitle)}
          description={String(card.props.summary ?? dictionary.assistant.choosePropertyToContinue)}
          properties={(card.props.properties as MobileProperty[]) ?? []}
          onPropertyPress={onPropertyPress}
          onAddPropertyToSelection={onAddPropertyToSelection}
          onOpenProperty={onOpenProperty}
          onOpenGallery={onOpenGallery}
          ambientBackgroundColor={ambientBackgroundColor}
          cardVariant="generated"
          selectedPropertyIds={selectedPropertyIds}
          comparePicking={comparePicking}
          maxCompareProperties={maxCompareProperties}
        />
      );
    case "bank_offer":
      return <BankOfferPanel offer={card.props} onSuggestedPromptPress={onSuggestedPromptPress} />;
    case "followup_prompt":
      return (
        <NextStepPanel
          title={String(card.props.title ?? dictionary.common.continue)}
          summary={String(card.props.summary ?? dictionary.assistant.localHistory)}
          actionLabel={String(card.props.actionLabel ?? dictionary.common.continue)}
          onPress={() => onSuggestedPromptPress(String(card.props.actionLabel ?? dictionary.common.continue))}
        />
      );
    default:
      return <InsightSummaryPanel card={card.props} relatedProperties={relatedProperties} />;
  }
}

function BankOfferPanel({
  offer,
  onSuggestedPromptPress,
}: {
  offer: any;
  onSuggestedPromptPress: (prompt: string) => void;
}) {
  const theme = useAppTheme();
  const { dictionary, locale, isRtl } = useMobileLocale();
  return (
    <View
      className="px-5 py-5"
      style={{
        borderRadius: theme.radii.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceMuted,
      }}
    >
      <View className={cn("items-center justify-between", isRtl ? "flex-row-reverse" : "flex-row")}>
        <View className={cn("items-center gap-3", isRtl ? "flex-row-reverse" : "flex-row")}>
          <View
            className="items-center justify-center"
            style={{ width: 44, height: 44, borderRadius: theme.radii.pill, backgroundColor: theme.colors.primarySoft }}
          >
            <Wallet size={20} color={theme.colors.primary} />
          </View>
          <AppText className="text-[18px] font-cairo-bold" style={{ color: theme.colors.ink }}>{String(offer.bankName ?? dictionary.cards.bank)}</AppText>
        </View>
        <MobilePill label={String(offer.rateLabel ?? dictionary.cards.program)} tone="primary" active />
      </View>

      <View className="mt-5 gap-4">
        <InsightRow label={dictionary.cards.monthlyInstallment} value={formatCurrency(Number(offer.monthlyEstimate ?? 0), locale)} emphasized />
        <InsightRow label={dictionary.cards.downPayment} value={`${String(offer.downPaymentPercent ?? 0)}%`} />
        <InsightRow label={dictionary.cards.program} value={String(offer.rateLabel ?? dictionary.cards.program)} last />
      </View>

      <View className="mt-6 border-t pt-4" style={{ borderTopColor: theme.colors.borderStrong }}>
        <MobilePill
          label={locale === "en" ? `Request financing from ${String(offer.bankName ?? dictionary.cards.bank)}` : `اطلب تمويل من ${String(offer.bankName ?? dictionary.cards.bank)}`}
          tone="dark"
          active
          onPress={() => onSuggestedPromptPress(locale === "en" ? `Request financing from ${String(offer.bankName ?? dictionary.cards.bank)}` : `اطلب تمويل من ${String(offer.bankName ?? dictionary.cards.bank)}`)}
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
  const theme = useAppTheme();
  const { dictionary, isRtl } = useMobileLocale();
  return (
    <View
      className="px-5 py-5"
      style={{
        borderRadius: theme.radii.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
    >
      <MobileSectionHeading eyebrow={dictionary.common.continue} title={title} description={summary} />
      <View className={cn("mt-5 border-t py-1", isRtl ? "flex-row-reverse" : "flex-row")} style={{ borderTopColor: theme.colors.borderStrong }}>
        <MobilePill label={actionLabel} tone="primary" active onPress={onPress} />
      </View>
    </View>
  );
}

function InsightSummaryPanel({
  card,
  relatedProperties = [],
}: {
  card: any;
  relatedProperties?: MobileProperty[];
}) {
  const theme = useAppTheme();
  const { dictionary, isRtl, locale } = useMobileLocale();
  if (card.type === "comparison_table") {
    return (
      <ComparisonTable
        title={String(card.title ?? dictionary.assistant.comparisonTitle)}
        summary={card.summary ? String(card.summary) : null}
        columns={Array.isArray(card.columns) ? card.columns.map((column: unknown) => String(column)) : []}
        rows={Array.isArray(card.rows) ? card.rows.map((row: unknown) => (Array.isArray(row) ? row.map((cell: unknown) => String(cell)) : [])) : []}
        relatedProperties={relatedProperties}
      />
    );
  }

  const icon = resolveInsightIcon(card, theme);
  const rows = extractInsightRows(card, locale);
  const insightTone = resolveInsightTone(card);

  function getInsightColors() {
    switch (insightTone) {
      case "highlight":
        return { bg: theme.colors.primarySoft, border: theme.colors.primaryMuted };
      case "success":
        return { bg: theme.colors.successSoft, border: theme.colors.successSoft };
      case "danger":
        return { bg: theme.colors.dangerSoft, border: theme.colors.dangerSoft };
      default:
        return { bg: theme.colors.surface, border: theme.colors.border };
    }
  }

  const colors = getInsightColors();

  return (
    <View
      className="px-5 py-5"
      style={{
        borderRadius: theme.radii.card, // Generous geometry 16px
        borderWidth: 1, // Delicate 1px stroke boundaries
        borderColor: colors.border,
        backgroundColor: colors.bg,
      }}
    >
      <View className={cn("items-center justify-between gap-3 pb-4 mb-2", isRtl ? "flex-row-reverse" : "flex-row")} style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View className="flex-1">
          <AppText className={cn("text-[18px] font-cairo-bold", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.ink }}>{String(card.title ?? dictionary.common.continue)}</AppText>
          {card.summary ? (
            <AppText className={cn("mt-1 text-[14px] leading-6", isRtl ? "text-right" : "text-left")} style={{ color: theme.colors.inkMuted }}>{String(card.summary)}</AppText>
          ) : null}
        </View>
        <View
          className="items-center justify-center"
          style={{ width: 44, height: 44, borderRadius: theme.radii.pill, backgroundColor: theme.colors.surfaceMuted }}
        >
          {icon}
        </View>
      </View>

      {card.body ? (
        <AppText className="mt-2 text-[15px] leading-7" style={{ color: theme.colors.inkSoft }}>{String(card.body)}</AppText>
      ) : null}

      {rows.length > 0 ? (
        <View className="gap-2">
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

function ComparisonTable({
  title,
  summary,
  columns,
  rows,
  relatedProperties,
}: {
  title: string;
  summary: string | null;
  columns: string[];
  rows: Array<Array<string>>;
  relatedProperties: MobileProperty[];
}) {
  const theme = useAppTheme();
  const { dictionary, isRtl } = useMobileLocale();
  const headerLabel = columns[0] ?? dictionary.propertyDetail.itemLabel;
  const propertyTitles = columns.length > 1 ? columns.slice(1) : relatedProperties.map((property) => property.title);
  const labelColumnWidth = 88;
  const propertyColumnWidth = 116;
  const imageSize = 34;
  const resolvedProperties = propertyTitles.map((title, index) => {
    const normalizedTitle = title.trim();
    return (
      relatedProperties.find((property) => property.title.trim() === normalizedTitle) ??
      relatedProperties[index] ??
      null
    );
  });

  return (
    <View className="gap-3">
      <AppText className="text-[16px] font-cairo-bold text-right" style={{ color: theme.colors.ink }}>
        {title}
      </AppText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 2 }}>
        <View
          style={{
            minWidth: labelColumnWidth + propertyTitles.length * propertyColumnWidth,
          }}
        >
          <View
            className={`${isRtl ? "flex-row-reverse" : "flex-row"} items-end py-2`}
            style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
          >
            <View
              style={{
                width: labelColumnWidth,
                paddingHorizontal: 12,
                justifyContent: "flex-end",
              }}
            >
              <AppText
                className="text-[11px] font-cairo-bold text-right"
                style={{ color: theme.colors.inkMuted }}
              >
                {headerLabel}
              </AppText>
            </View>

            {propertyTitles.map((titleValue, columnIndex) => {
              const property = resolvedProperties[columnIndex];
              const propertyImages =
                property && property.media.length > 0 ? property.media : property ? [getPropertyHeroImage(property)] : [];

              return (
                <View
                  key={`${titleValue}-${columnIndex}`}
                  className="items-center"
                  style={{
                    width: propertyColumnWidth,
                    paddingHorizontal: 8,
                    gap: 8,
                  }}
                >
                  {property ? (
                    <CursorPropertyMediaViewer
                      images={propertyImages}
                      width={imageSize}
                      height={imageSize}
                      borderRadius={999}
                      backgroundColor={theme.colors.surfaceMuted}
                      showCounter={false}
                      interactionMode="static"
                    />
                  ) : (
                    <View
                      style={{
                        width: imageSize,
                        height: imageSize,
                        borderRadius: 999,
                        backgroundColor: theme.colors.surfaceMuted,
                      }}
                    />
                  )}

                  <AppText
                    className="text-center text-[11px] font-cairo-bold"
                    numberOfLines={2}
                    style={{ color: theme.colors.ink }}
                  >
                    {titleValue}
                  </AppText>
                </View>
              );
            })}
          </View>

          {rows.map((row, rowIndex) => (
            <View
              key={`${row.join("-")}-${rowIndex}`}
              className={`${isRtl ? "flex-row-reverse" : "flex-row"} items-center py-3`}
              style={{
                borderBottomWidth: rowIndex === rows.length - 1 ? 0 : 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <View
                style={{
                  width: labelColumnWidth,
                  paddingHorizontal: 12,
                }}
              >
                <AppText
                  className="text-[12px] font-cairo-bold text-right"
                  style={{ color: theme.colors.inkMuted }}
                >
                  {row[0] ?? "-"}
                </AppText>
              </View>

              {propertyTitles.map((_, columnIndex) => (
                <View
                  key={`${row[0] ?? "cell"}-${columnIndex}`}
                  style={{
                    width: propertyColumnWidth,
                    paddingHorizontal: 8,
                  }}
                >
                  <AppText
                    className="text-center text-[13px] font-cairo-bold"
                    style={{ color: theme.colors.ink }}
                  >
                    {row[columnIndex + 1] ?? "-"}
                  </AppText>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {summary ? (
        <AppText className="text-[13px] leading-6 text-right" style={{ color: theme.colors.inkMuted }}>
          {summary}
        </AppText>
      ) : null}
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
  const theme = useAppTheme();
  return (
    <View
      className="flex-row-reverse items-center justify-between py-2"
      style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.colors.border }}
    >
      <AppText className="max-w-[46%] text-[13px] font-cairo-medium text-right" style={{ color: theme.colors.inkMuted }}>{label}</AppText>
      <AppText
        className="max-w-[48%] text-left text-[14px]"
        style={{
          fontFamily: emphasized ? "Cairo_700Bold" : "Cairo_500Medium",
          color: emphasized ? theme.colors.primary : theme.colors.ink,
        }}
      >
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
  const theme = useAppTheme();
  return (
    <View className="gap-3 mt-2">
      {prompts.map((prompt) => (
        <Pressable
          key={prompt}
          onPress={() => onPress(prompt)}
          className="px-5 py-3.5"
          style={({ pressed }) => ({
            borderRadius: theme.radii.pill, // Unified system suggestions are pill shape
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <AppText className="text-[14px] font-cairo-bold text-center" style={{ color: theme.colors.inkSoft }}>{prompt}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

function TypingPanel() {
  const theme = useAppTheme();
  const { dictionary, isRtl } = useMobileLocale();
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
      className={`${isRtl ? "self-end" : "self-start"} px-5 py-3`}
      style={{
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: theme.colors.borderStrong,
        backgroundColor: theme.colors.surfaceMuted,
      }}
    >
      <Animated.View style={{ opacity }} className={`items-center gap-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
        <AppText className="text-[12px] font-cairo-medium" style={{ color: theme.colors.ink }}>{dictionary.assistant.typing}</AppText>
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

function resolveInsightIcon(card: any, theme: AppTheme) {
  const color = theme.colors.primary;
  switch (card.type) {
    case "broker_profile":
      return <User size={20} color={color} />;
    case "developer_profile":
      return <Building2 size={20} color={color} />;
    case "market_analysis":
      return <TrendingUp size={20} color={color} />;
    case "roi_summary":
    case "roi_projection":
      return <Percent size={20} color={color} />;
    case "loan_calculator":
    case "payment_plan":
    case "mortgage_check":
    case "bank_offer":
      return <Wallet size={20} color={color} />;
    case "permit_status":
      return <ShieldCheck size={20} color={theme.colors.success} />;
    default:
      return <Sparkles size={20} color={theme.colors.primary} />;
  }
}

function extractInsightRows(card: any, locale: MobileLocale): Array<{ label: string; value: string; emphasized?: boolean }> {
  const dictionary = getMobileDictionary(locale);
  switch (card.type) {
    case "broker_profile":
      return [
        { label: dictionary.cards.broker, value: String(card.brokerName ?? "-"), emphasized: true },
        { label: dictionary.cards.agency, value: String(card.brokerAgency ?? "-") },
        { label: dictionary.cards.rating, value: `${String(card.rating ?? "-")} / 5` },
        { label: dictionary.cards.activeListings, value: String(card.activeListings ?? "-") },
      ];
    case "developer_profile":
      return [
        { label: dictionary.cards.developer, value: String(card.developerName ?? "-"), emphasized: true },
        { label: dictionary.cards.establishedYear, value: String(card.establishedYear ?? "-") },
        { label: dictionary.cards.completedProjects, value: String(card.completedProjects ?? "-") },
      ];
    case "market_analysis":
      return [
        { label: dictionary.cards.location, value: String(card.location ?? "-"), emphasized: true },
        { label: dictionary.cards.averageSqmPrice, value: formatCurrency(Number(card.averagePrice ?? 0), locale) },
        {
          label: dictionary.cards.marketTrend,
          value: `${card.priceTrend === "up" ? "▲" : card.priceTrend === "down" ? "▼" : "•"} ${String(card.trendPercentage ?? 0)}%`,
          emphasized: true,
        },
      ];
    case "roi_summary":
      return [
        { label: dictionary.cards.purchasePrice, value: formatCurrency(Number(card.purchasePrice ?? 0), locale) },
        { label: dictionary.cards.annualRentEstimate, value: formatCurrency(Number(card.estimatedAnnualRent ?? 0), locale) },
        { label: dictionary.cards.grossYield, value: formatPercent(Number(card.grossYieldPercent ?? 0)), emphasized: true },
      ];
    case "roi_projection":
      return [
        { label: dictionary.cards.purchasePrice, value: formatCurrency(Number(card.purchasePrice ?? 0), locale) },
        { label: dictionary.cards.annualRent, value: formatCurrency(Number(card.annualRent ?? 0), locale) },
        { label: dictionary.cards.annualRentalYield, value: formatPercent(Number(card.yieldPercent ?? 0)), emphasized: true },
      ];
    case "loan_calculator":
      return [
        { label: dictionary.cards.propertyValue, value: formatCurrency(Number(card.propertyPrice ?? 0), locale) },
        { label: dictionary.cards.upfrontPayment, value: formatCurrency(Number(card.downPayment ?? 0), locale) },
        { label: dictionary.cards.financeDuration, value: locale === "en" ? `${String(card.years ?? 0)} yrs` : `${String(card.years ?? 0)} سنة`, emphasized: true },
      ];
    case "payment_plan":
      return [
        { label: dictionary.cards.downPayment, value: formatCurrency(Number(card.downPayment ?? 0), locale) },
        { label: dictionary.cards.monthlyInstallment, value: formatCurrency(Number(card.monthlyInstallment ?? 0), locale), emphasized: true },
        { label: dictionary.cards.repaymentPeriodMonths, value: locale === "en" ? `${String(card.durationMonths ?? 0)} mo` : `${String(card.durationMonths ?? 0)} شهر` },
      ];
    case "mortgage_check":
      return [
        { label: dictionary.cards.status, value: mortgageLabel(String(card.estimatedEligibility ?? "review"), locale), emphasized: true },
        ...(card.recommendedBudget ? [{ label: dictionary.cards.suggestedBudget, value: formatCurrency(Number(card.recommendedBudget), locale) }] : []),
        ...(card.monthlyInstallmentEstimate
          ? [{ label: dictionary.cards.estimatedInstallment, value: formatCurrency(Number(card.monthlyInstallmentEstimate), locale) }]
          : []),
      ];
    case "permit_status":
      return [{ label: dictionary.cards.verification, value: permitLabel(String(card.permitStatus ?? "pending_review"), locale), emphasized: true }];
    case "bank_offer":
      return [
        { label: dictionary.cards.bank, value: String(card.bankName ?? "-"), emphasized: true },
        { label: dictionary.cards.program, value: String(card.rateLabel ?? "-") },
        { label: dictionary.cards.monthlyInstallment, value: formatCurrency(Number(card.monthlyEstimate ?? 0), locale) },
      ];
    case "accent_note":
      return [{ label: dictionary.cards.status, value: String(card.tone === "success" ? dictionary.cards.positive : card.tone === "warning" ? dictionary.cards.warning : dictionary.cards.info), emphasized: true }];
    default:
      return [];
  }
}

function mortgageLabel(value: string, locale: MobileLocale) {
  const dictionary = getMobileDictionary(locale);
  if (value === "eligible") return dictionary.cards.eligibilityEligible;
  if (value === "review") return dictionary.cards.eligibilityReview;
  return dictionary.cards.eligibilityUnknown;
}

function permitLabel(value: string, locale: MobileLocale) {
  const dictionary = getMobileDictionary(locale);
  if (value === "verified") return dictionary.cards.permitVerified;
  if (value === "pending_review") return dictionary.cards.permitPending;
  return dictionary.cards.permitUnavailable;
}
