import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConversationTimeline } from "@/features/BuyerAssistantHomeScreen/ConversationTimeline";
import type { MobileConversationMessage, MobileProperty, MobileSearchContext } from "@/types/mobile";

const renderToStaticMarkup = require("react-dom/server").renderToStaticMarkup as (element: React.ReactElement) => string;

vi.mock("react-native", () => ({
  Dimensions: {
    get: () => ({ height: 844, width: 390 }),
  },
  Keyboard: {
    addListener: () => ({ remove() {} }),
  },
  KeyboardAvoidingView: "KeyboardAvoidingView",
  Platform: {
    OS: "ios",
  },
  Pressable: "Pressable",
  ScrollView: "ScrollView",
  View: "View",
}));

vi.mock("react-native-gifted-chat", () => {
  const React = require("react");
  const host = (name: string, props?: Record<string, unknown>, children?: unknown) => React.createElement(name, props, children);

  return {
    GiftedChat: ({ messages, renderBubble, renderCustomView, renderInputToolbar }: any) =>
      host(
        "GiftedChat",
        {},
        [
          ...(messages ?? []).map((message: any) =>
            host(
              "GiftedMessage",
              { key: message._id },
              [renderBubble?.({ currentMessage: message }), renderCustomView?.({ currentMessage: message })],
            ),
          ),
          renderInputToolbar?.({}),
        ],
      ),
  };
});

vi.mock("lucide-react-native", () => ({
  Bath: "Bath",
  BedDouble: "BedDouble",
  Building2: "Building2",
  ChevronLeft: "ChevronLeft",
  Compass: "Compass",
  MapPin: "MapPin",
  Percent: "Percent",
  Ruler: "Ruler",
  Search: "Search",
  ShieldCheck: "ShieldCheck",
  Sparkles: "Sparkles",
  TrendingUp: "TrendingUp",
  User: "User",
  Wallet: "Wallet",
}));

vi.mock("expo-image", () => ({
  Image: "Image",
}));

vi.mock("@/components/chat/ag-ui/MobileAgUiTurnRenderer", () => ({
  MobileAgUiTurnRenderer: ({ turn }: Record<string, any>) => {
    const React = require("react");
    const cards = (turn?.cards ?? []).flatMap((card: any) => {
      if (card.componentId !== "property_shortlist") return [];
      return (card.props?.properties ?? []).map((property: MobileProperty) =>
        React.createElement(
          "MobilePropertyCard",
          {
            key: property.id,
            property: property.id,
            variant: "generated",
          },
          property.id,
        ),
      );
    });
    return React.createElement("AgUiTurn", {}, cards);
  },
}));

vi.mock("@/components/chat/InsightCard", () => ({
  InsightCard: ({ card }: Record<string, any>) => {
    const React = require("react");
    return React.createElement("InsightCard", {}, [card?.title, card?.summary].filter(Boolean).join(" "));
  },
}));

vi.mock("@/components/property/CursorCardShell", () => ({
  CursorCardAction: "CursorCardAction",
  CursorCardShell: "CursorCardShell",
}));

vi.mock("@/components/property/CursorPropertyMediaViewer", () => ({
  CursorPropertyMediaViewer: "CursorPropertyMediaViewer",
}));

vi.mock("@/components/property/MobilePropertyCard", () => ({
  MobilePropertyCard: (props: Record<string, unknown>) => {
    const React = require("react");
    return React.createElement(
      "MobilePropertyCard",
      {
        ...props,
        property: props.property ? String((props.property as MobileProperty).id) : undefined,
      },
      props.property ? String((props.property as MobileProperty).id) : null,
    );
  },
}));

vi.mock("@/components/ui/AppText", () => ({
  AppText: (props: Record<string, unknown>) => {
    const React = require("react");
    return React.createElement("AppText", props, props.children);
  },
}));

vi.mock("@/components/ui/Button", () => ({
  Button: (props: Record<string, unknown>) => {
    const React = require("react");
    return React.createElement("Button", props, props.label);
  },
}));

vi.mock("@/components/ui/MobileChrome", () => ({
  MobilePill: (props: Record<string, unknown>) => {
    const React = require("react");
    return React.createElement("MobilePill", props, props.label);
  },
  MobileSectionHeading: "MobileSectionHeading",
  MobileSurface: (props: Record<string, unknown>) => {
    const React = require("react");
    return React.createElement("MobileSurface", props, props.children);
  },
}));

vi.mock("@/features/BuyerAssistantHomeScreen/ConversationComposer", () => ({
  ConversationComposer: (props: Record<string, unknown>) => {
    const React = require("react");
    return React.createElement(
      "ConversationComposer",
      {
        ...props,
        isProcessingState: props.isProcessing ? "true" : "false",
        selectedCount: Array.isArray(props.selectedProperties) ? props.selectedProperties.length : 0,
      },
      null,
    );
  },
}));

vi.mock("@/lib/mobileData", () => ({
  getPropertyHeroImage: () => "https://example.com/fallback.jpg",
  getPropertyLocationLabel: (property: MobileProperty) => property.location,
}));

vi.mock("@/lib/mobileLocale", () => ({
  useMobileLocale: () => ({
    dictionary: {
      account: {
        localSession: "جلسة محلية",
      },
      assistant: {
        localHistory: "سجلك الحالي محفوظ على هذا الجهاز فقط.",
        requestAdvisor: "اطلب مستشار",
        searchResultsTitle: "نتائج البحث المقترحة",
        selectProperty: "اختر العقار",
        showMoreResults: "اعرض نتائج أكثر",
      },
      common: {
        confirm: "متابعة",
        continue: "متابعة",
        selected: "تم الاختيار",
      },
    },
    isRtl: true,
    locale: "ar",
  }),
}));

vi.mock("@/lib/mobileTheme", () => ({
  getMobileShadow: () => ({}),
  useAppTheme: () => ({
    colors: {
      accent: "#0f766e",
      border: "#e4e4e7",
      borderStrong: "#d4d4d8",
      canvas: "#fafafa",
      ink: "#09090b",
      inkMuted: "#71717a",
      inkSoft: "#27272a",
      primary: "#2563eb",
      primaryMuted: "#bfdbfe",
      primarySoft: "#dbeafe",
      successSoft: "#dcfce7",
      danger: "#dc2626",
      dangerSoft: "#fee2e2",
      surface: "#ffffff",
      surfaceMuted: "#f4f4f5",
      teal: "#0f766e",
      userBubble: "#2563eb",
      userBubbleText: "#ffffff",
    },
    cursorCard: {
      surfaceColor: "#ffffff",
    },
    isDark: false,
    radii: {
      bubble: 24,
      card: 16,
      pill: 999,
    },
  }),
}));

function createProperty(id: string): MobileProperty {
  return {
    id,
    title: `Property ${id}`,
    address: "Riyadh Front",
    location: "الرياض",
    area: "الياسمين",
    price: 1400000,
    beds: 3,
    baths: 3,
    sqft: 185,
    media: ["https://example.com/cover.jpg"],
    owner: {
      id: `broker-${id}`,
      type: "broker",
      name: "Broker One",
      slug: `broker-${id}`,
      isVerified: true,
    },
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

function renderTimeline(props: Partial<React.ComponentProps<typeof ConversationTimeline>> = {}) {
  return renderToStaticMarkup(
    React.createElement(ConversationTimeline, {
      messages: [],
      value: "",
      onChange: vi.fn(),
      onSend: vi.fn(),
      onSubmitVoiceRecording: vi.fn(async () => undefined),
      onPropertyPress: vi.fn(),
      onSuggestedPromptPress: vi.fn(),
      ...props,
    }),
  );
}

describe("ConversationTimeline", () => {
  it("uses generated cards only for AG-UI shortlists while keeping fallback shelves and search previews compact", () => {
    const shortlistProperty = createProperty("shortlist");
    const fallbackProperty = createProperty("fallback");
    const searchProperty = createProperty("search");
    const messages: MobileConversationMessage[] = [
      {
        id: "assistant-ui-turn",
        role: "assistant",
        text: "هذه خيارات مولدة",
        uiTurn: {
          id: "turn-1",
          cards: [
            {
              id: "card-1",
              componentId: "property_shortlist",
              props: {
                properties: [shortlistProperty],
              },
            },
          ],
        },
      },
      {
        id: "assistant-fallback",
        role: "assistant",
        text: "هذه ترشيحات عادية",
        properties: [fallbackProperty],
      },
      {
        id: "assistant-search",
        role: "assistant",
        text: "هذه نتائج بحث",
        searchContext: {
          searchSummary: "شقق قريبة من الخدمات",
        } as MobileSearchContext,
        searchResults: [searchProperty],
      },
    ];

    const html = renderTimeline({ messages });

    expect(html).toContain('MobilePropertyCard');
    expect(html).toContain(`property=\"${shortlistProperty.id}\" variant=\"generated\"`);
    expect(html).toContain(`property=\"${fallbackProperty.id}\"`);
    expect((html.match(/variant=\"compact\"/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(html).toContain("نتائج البحث المقترحة");
  });

  it("renders comparison tables inline with shared property thumbnails", () => {
    const firstProperty = createProperty("compare-1");
    const secondProperty = createProperty("compare-2");
    const messages: MobileConversationMessage[] = [
      {
        id: "assistant-compare",
        role: "assistant",
        text: "هذه مقارنة مباشرة",
        properties: [firstProperty, secondProperty],
        cards: [
          {
            type: "comparison_table",
            title: "مقارنة سريعة",
            columns: ["البند", firstProperty.title, secondProperty.title],
            rows: [["السعر", "1.4 مليون", "1.2 مليون"]],
            summary: "فرق سريع بين الخيارين.",
          },
        ],
      },
    ];

    const html = renderTimeline({ messages });

    expect(html).toContain("مقارنة سريعة");
    expect(html).toContain("فرق سريع بين الخيارين.");
  });

  it("keeps the composer in the Gifted Chat toolbar and shows the auth gate above it", () => {
    const selectedProperty = createProperty("selected");
    const html = renderTimeline({
      isTyping: true,
      selectedProperties: [selectedProperty],
      showAuthCallout: true,
      onContinueAuthGate: vi.fn(),
      onRequestAdvisor: vi.fn(),
      composerVariant: "thread",
    });

    expect(html).toContain('ConversationComposer');
    expect(html).toContain('variant=\"thread\"');
    expect(html).toContain('selectedCount=\"1\"');
    expect(html).toContain('isProcessingState=\"true\"');
    expect(html).toContain("جلسة محلية");
    expect(html).toContain("سجلك الحالي محفوظ على هذا الجهاز فقط.");
  });
});
