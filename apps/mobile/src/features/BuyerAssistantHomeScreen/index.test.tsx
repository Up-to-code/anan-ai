import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import BuyerAssistantHomeScreen from "@/features/BuyerAssistantHomeScreen/index";
import type { MobileProperty } from "@/types/mobile";

const renderToStaticMarkup = require("react-dom/server").renderToStaticMarkup as (element: React.ReactElement) => string;

const mockState = vi.hoisted(() => ({
  composerProps: [] as Array<Record<string, unknown>>,
  timelineProps: [] as Array<Record<string, unknown>>,
  assistant: null as any,
  feed: null as any,
  localParams: {} as Record<string, string | undefined>,
  router: {
    push: vi.fn(),
  },
}));

vi.mock("react-native", () => {
  const React = require("react");
  const host = (name: string, props?: Record<string, unknown>, children?: unknown) =>
    React.createElement(name, props, children);

  return {
    Keyboard: {
      addListener: () => ({ remove() {} }),
    },
    KeyboardAvoidingView: (props: any) => host("rn-keyboard-avoiding-view", props, props.children),
    Modal: (props: any) => host("rn-modal", props, props.children),
    Platform: {
      OS: "ios",
    },
    Pressable: (props: any) => host("rn-pressable", props, props.children),
    ScrollView: (props: any) => host("rn-scroll-view", props, props.children),
    StyleSheet: {
      create: (styles: any) => styles,
    },
    View: (props: any) => host("rn-view", props, props.children),
  };
});

vi.mock("@shopify/flash-list", () => ({
  FlashListRef: class {},
}));

vi.mock("expo-router", () => ({
  useLocalSearchParams: () => mockState.localParams,
  useRouter: () => mockState.router,
}));

vi.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock("lucide-react-native", () => ({
  Menu: "icon-menu",
  Plus: "icon-plus",
  User: "icon-user",
}));

vi.mock("@/components/chat/AnanMark", () => ({
  AnanMark: "anan-mark",
}));

vi.mock("@/components/ui/Button", () => ({
  Button: "ui-button",
}));

vi.mock("@/components/ui/AppText", () => ({
  AppText: "app-text",
}));

vi.mock("@/components/ui/IconButton", () => ({
  IconButton: "icon-button",
}));

vi.mock("@/components/ui/MobileChrome", () => ({
  MobileSurface: "mobile-surface",
  MobileTopBar: "mobile-top-bar",
}));

vi.mock("@/features/BuyerAssistantHomeScreen/ConversationComposer", () => ({
  ConversationComposer: (props: Record<string, unknown>) => {
    const React = require("react");
    mockState.composerProps.push(props);
    return React.createElement("conversation-composer");
  },
}));

vi.mock("@/features/BuyerAssistantHomeScreen/ConversationTimeline", () => ({
  ConversationTimeline: (props: Record<string, unknown>) => {
    const React = require("react");
    mockState.timelineProps.push(props);
    return React.createElement("conversation-timeline");
  },
}));

vi.mock("@/hooks/usePropertyAssistant", () => ({
  usePropertyAssistant: () => mockState.assistant,
}));

vi.mock("@/hooks/usePropertyFeed", () => ({
  usePropertyFeed: () => mockState.feed,
}));

vi.mock("@/lib/buyerAssistantShared", () => ({
  buildBuyerChatSuggestions: () => [],
}));

vi.mock("@/lib/mobileLayout", () => ({
  useMobileLayout: () => ({
    contentPadding: 20,
    height: 800,
    sectionGap: 16,
  }),
}));

vi.mock("@/lib/mobileSearch", () => ({
  buildAssistantSearchContext: () => null,
  buildSearchRouteParams: (value: unknown) => value,
  filterPropertiesForSearch: () => [],
}));

vi.mock("@/lib/mobileTheme", () => ({
  getMobileShadow: () => ({}),
  useAppTheme: () => ({
    colors: {
      border: "#e4e4e7",
      borderStrong: "#d4d4d8",
      canvas: "#fafafa",
      canvasElevated: "#f5f5f5",
      ink: "#09090b",
      inkMuted: "#71717a",
      inkSoft: "#27272a",
      overlay: "rgba(9, 9, 11, 0.4)",
      primary: "#2563eb",
      primarySoft: "#dbeafe",
      promptStarterSurface: "#ffffff",
      surface: "#ffffff",
    },
    radii: {
      card: 16,
      panel: 18,
    },
  }),
}));

function createProperty(): MobileProperty {
  return {
    id: "property-1",
    title: "Palm Residence",
    address: "Riyadh Front",
    location: "الرياض",
    area: "الياسمين",
    price: 1400000,
    beds: 3,
    baths: 3,
    sqft: 185,
    media: ["https://example.com/cover.jpg"],
    owner: {
      id: "broker-1",
      type: "broker",
      name: "Broker One",
      slug: "broker-one",
      isVerified: true,
    },
  };
}

function buildAssistantState(activeProperty: MobileProperty | null) {
  return {
    activeProperty,
    selectedProperties: activeProperty ? [activeProperty] : [],
    activeThreadId: "thread-1",
    activeThreadKind: "live",
    addPropertyToSelection: vi.fn(),
    askAboutProperty: vi.fn(),
    createNewThread: vi.fn(),
    draft: "",
    isHydrated: true,
    isSubmitting: false,
    latestUserMessage: null,
    messages: [{ id: "assistant-1", role: "assistant", text: "مرحبا" }],
    openHistoryThread: vi.fn(),
    recentThreads: [],
    removePropertyFromSelection: vi.fn(),
    requestAdvisor: vi.fn(),
    resetToWelcome: vi.fn(),
    setDraft: vi.fn(),
    setShowAuthCallout: vi.fn(),
    showAuthCallout: false,
    showSearchResults: vi.fn(),
    submit: vi.fn(),
    submitVoiceRecording: vi.fn(),
    syncTranscriptToAccount: vi.fn(),
  };
}

afterEach(() => {
  vi.clearAllMocks();
  mockState.assistant = null;
  mockState.composerProps = [];
  mockState.feed = null;
  mockState.localParams = {};
  mockState.timelineProps = [];
});

describe("BuyerAssistantHomeScreen", () => {
  it("routes active-property context into the composer prompt rail instead of the timeline header", () => {
    const activeProperty = createProperty();
    mockState.assistant = buildAssistantState(activeProperty);
    mockState.feed = {
      findPropertyById: () => activeProperty,
      properties: [activeProperty],
    };

    renderToStaticMarkup(React.createElement(BuyerAssistantHomeScreen));

    expect(mockState.composerProps).toHaveLength(1);
    expect(mockState.composerProps[0]?.selectedProperties).toEqual([activeProperty]);
    expect(mockState.timelineProps).toHaveLength(1);
    expect(mockState.timelineProps[0]?.contextProperty).toBeUndefined();
  });

  it("does not pass property prompt cards into the composer when no property is active", () => {
    mockState.assistant = buildAssistantState(null);
    mockState.feed = {
      findPropertyById: () => null,
      properties: [],
    };

    renderToStaticMarkup(React.createElement(BuyerAssistantHomeScreen));

    expect(mockState.composerProps).toHaveLength(1);
    expect(mockState.composerProps[0]?.selectedProperties).toEqual([]);
  });
});
