import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConversationTimeline } from "@/features/BuyerAssistantHomeScreen/ConversationTimeline";
import { collectTextContent, findElementsByType } from "@/test/reactTree";
import type { MobileConversationMessage, MobileProperty } from "@/types/mobile";

vi.mock("react-native", () => ({
  Animated: {
    Value: class {
      interpolate() {
        return 1;
      }
    },
    loop: () => ({ start() {}, stop() {} }),
    sequence: () => ({}),
    timing: () => ({}),
  },
  Pressable: "Pressable",
  ScrollView: "ScrollView",
  View: "View",
}));

vi.mock("@shopify/flash-list", () => ({
  FlashList: ({ data, ListHeaderComponent, renderItem }: any) =>
    React.createElement(
      "FlashList",
      {},
      [ListHeaderComponent, ...data.map((item: any, index: number) => renderItem({ item, index }))].filter(Boolean),
    ),
}));

vi.mock("lucide-react-native", () => ({
  Bath: "Bath",
  BedDouble: "BedDouble",
  Building2: "Building2",
  ChevronLeft: "ChevronLeft",
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

vi.mock("@/components/property/CursorCardShell", () => ({
  CursorCardShell: "CursorCardShell",
}));

vi.mock("@/components/property/MobilePropertyCard", () => ({
  MobilePropertyCard: "MobilePropertyCard",
}));

vi.mock("@/components/ui/AppText", () => ({
  AppText: "AppText",
}));

vi.mock("@/components/ui/MobileChrome", () => ({
  MobilePill: "MobilePill",
  MobileSectionHeading: "MobileSectionHeading",
}));

vi.mock("@/lib/mobileData", () => ({
  getPropertyHeroImage: () => "https://example.com/fallback.jpg",
  getPropertyLocationLabel: (property: MobileProperty) => property.location,
}));

vi.mock("@/lib/mobileTheme", () => ({
  useAppTheme: () => ({
    colors: {
      border: "#e4e4e7",
      borderStrong: "#d4d4d8",
      canvas: "#fafafa",
      ink: "#09090b",
      inkMuted: "#71717a",
      inkSoft: "#27272a",
      primary: "#2563eb",
      primarySoft: "#dbeafe",
      successSoft: "#dcfce7",
      dangerSoft: "#fee2e2",
      surface: "#ffffff",
      surfaceMuted: "#f4f4f5",
      userBubble: "#2563eb",
      userBubbleText: "#ffffff",
    },
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

function materialize(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map((child) => materialize(child));
  }

  if (!node || typeof node !== "object") {
    return node;
  }

  const element = node as {
    type?: unknown;
    props?: Record<string, unknown> & {
      children?: unknown;
    };
  };

  if (typeof element.type === "function") {
    return materialize(element.type(element.props ?? {}));
  }

  if (!element.props) {
    return element;
  }

  return {
    ...element,
    props: {
      ...element.props,
      children: materialize(element.props.children),
    },
  };
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
        },
        searchResults: [searchProperty],
      },
    ];

    const tree = materialize(
      ConversationTimeline({
        listRef: { current: null },
        messages,
        onPropertyPress: vi.fn(),
        onSuggestedPromptPress: vi.fn(),
      }),
    );

    const cards = findElementsByType(tree, "MobilePropertyCard") as Array<{
      props?: {
        property?: MobileProperty;
        variant?: string;
      };
    }>;
    const shortlistCard = cards.find((card) => card.props?.property?.id === shortlistProperty.id);
    const fallbackCard = cards.find((card) => card.props?.property?.id === fallbackProperty.id);
    const variantCounts = cards.reduce<Record<string, number>>((counts, card) => {
      const variant = card.props?.variant ?? "unknown";
      counts[variant] = (counts[variant] ?? 0) + 1;
      return counts;
    }, {});
    const visibleText = collectTextContent(tree).join(" ");

    expect(shortlistCard?.props?.variant).toBe("generated");
    expect(fallbackCard?.props?.variant).toBe("compact");
    expect(variantCounts.generated).toBe(1);
    expect(variantCounts.compact ?? 0).toBeGreaterThanOrEqual(1);
    expect(visibleText).toContain("نتائج البحث المقترحة");
  });
});
