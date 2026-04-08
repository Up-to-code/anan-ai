import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SearchScreen from "@/features/SearchScreen/index";
import BrokerProfileScreen from "@/features/BrokerProfileScreen/index";
import PropertyDetailScreen from "@/features/PropertyDetailScreen/index";
import { collectTextContent } from "@/test/reactTree";
import type { MobileProperty } from "@/types/mobile";

const renderToStaticMarkup = require("react-dom/server").renderToStaticMarkup as (element: React.ReactElement) => string;

const mockState = vi.hoisted(() => ({
  alertSpy: vi.fn(),
  localParams: {} as Record<string, string | undefined>,
  propertyDetailState: null as any,
  renderLog: {
    pressables: [] as unknown[],
    stickyBars: [] as unknown[],
    textInputs: [] as unknown[],
  },
  router: {
    back: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  },
  searchContext: null as any,
  searchState: null as any,
}));

const searchSetQuery = vi.fn();

vi.mock("react-native", () => {
  const React = require("react");
  const host = (name: string, props?: Record<string, unknown>, children?: unknown) =>
    React.createElement(name, props, children);

  return {
    ActivityIndicator: (props: any) => host("activity-indicator", props),
    Alert: {
      alert: mockState.alertSpy,
    },
    Pressable: (props: any) => {
      const element = host("rn-pressable", props, props.children);
      mockState.renderLog.pressables.push(element);
      return element;
    },
    ScrollView: (props: any) => host("rn-scroll-view", props, props.children),
    TextInput: (props: any) => {
      const element = host("rn-text-input", props);
      mockState.renderLog.textInputs.push(element);
      return element;
    },
    View: (props: any) => host("rn-view", props, props.children),
  };
});

vi.mock("@shopify/flash-list", () => {
  const React = require("react");

  return {
    FlashList: ({ data, ListEmptyComponent, renderItem }: any) =>
      React.createElement(
        "flash-list",
        null,
        (data ?? []).length > 0 ? null : ListEmptyComponent ?? null,
      ),
  };
});

vi.mock("expo-router", () => ({
  useLocalSearchParams: () => mockState.localParams,
  useRouter: () => mockState.router,
}));

vi.mock("expo-image", () => {
  const React = require("react");
  return {
    Image: (props: any) => React.createElement("expo-image", props),
  };
});

vi.mock("expo-linking", () => ({
  openURL: vi.fn(),
}));

vi.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock("lucide-react-native", () => {
  const icon = (name: string) => (props: any) => React.createElement(name, props);

  return {
    ArrowLeft: icon("icon-arrow-left"),
    Bath: icon("icon-bath"),
    BedDouble: icon("icon-bed-double"),
    Building2: icon("icon-building-2"),
    ChevronLeft: icon("icon-chevron-left"),
    Mail: icon("icon-mail"),
    MapPin: icon("icon-map-pin"),
    MessageCircle: icon("icon-message-circle"),
    Phone: icon("icon-phone"),
    Ruler: icon("icon-ruler"),
    Search: icon("icon-search"),
    ShieldCheck: icon("icon-shield-check"),
    SlidersHorizontal: icon("icon-sliders-horizontal"),
    Sparkles: icon("icon-sparkles"),
    Star: icon("icon-star"),
    X: icon("icon-x"),
  };
});

vi.mock("@/components/ui/AppText", () => {
  const React = require("react");
  return {
    AppText: (props: any) => React.createElement("app-text", props, props.children),
  };
});

vi.mock("@/components/ui/IconButton", () => {
  const React = require("react");
  return {
    IconButton: (props: any) => React.createElement("icon-button", props, props.children),
  };
});

vi.mock("@/components/ui/MobileChrome", () => {
  const React = require("react");

  return {
    MobilePill: (props: any) => React.createElement("mobile-pill", props, props.children),
    MobileSectionHeading: (props: any) => React.createElement("mobile-section-heading", props, props.children),
    MobileSurface: (props: any) => React.createElement("mobile-surface", props, props.children),
    MobileTopBar: (props: any) => React.createElement("mobile-top-bar", null, props.centerSlot ?? null),
  };
});

vi.mock("@/features/SearchScreen/SearchResultCard", () => {
  const React = require("react");
  return {
    SearchResultCard: (props: any) => React.createElement("search-result-card", props),
  };
});

vi.mock("@/features/GalleryScreen/GalleryViewport", () => {
  const React = require("react");
  return {
    GalleryViewport: (props: any) => React.createElement("gallery-viewport", props),
  };
});

vi.mock("@/features/PropertyDetailScreen/StickyJourneyBar", () => {
  const React = require("react");

  return {
    StickyJourneyBar: (props: any) => {
      const element = React.createElement("sticky-journey-bar", props);
      mockState.renderLog.stickyBars.push(element);
      return element;
    },
  };
});

vi.mock("@/components/property/MobilePropertyCard", () => {
  const React = require("react");
  return {
    MobilePropertyCard: (props: any) => React.createElement("mobile-property-card", props),
  };
});

vi.mock("@/hooks/usePropertySearch", () => ({
  usePropertySearch: () => mockState.searchState,
}));

vi.mock("@/hooks/usePropertyDetail", () => ({
  usePropertyDetail: () => mockState.propertyDetailState,
}));

vi.mock("@/hooks/useBuyerAccount", () => ({
  useBuyerAccount: () => ({
    isPropertySaved: () => false,
    toggleSavedProperty: vi.fn(),
  }),
}));

vi.mock("@/lib/mobileSearch", () => ({
  buildSearchRouteParams: (nextContext: any) => nextContext,
  parseSearchRouteParams: () => mockState.searchContext,
}));

vi.mock("@/lib/mobileTheme", () => ({
  getMobileShadow: () => ({}),
  useAppTheme: () => ({
    isDark: false,
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
      surface: "#ffffff",
      surfaceMuted: "#f4f4f5",
      teal: "#0d9488",
    },
    radii: {
      card: 16,
      hero: 24,
      panel: 18,
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

function renderComponent(element: React.ReactElement) {
  renderToStaticMarkup(element);
}

function findRecordedPressable(label: string) {
  return mockState.renderLog.pressables.find((element) => collectTextContent(element).join(" ").includes(label)) as
    | { props?: Record<string, any> }
    | undefined;
}

function latestStickyBar() {
  return mockState.renderLog.stickyBars.at(-1) as { props?: Record<string, any> } | undefined;
}

function latestTextInput() {
  return mockState.renderLog.textInputs.at(-1) as { props?: Record<string, any> } | undefined;
}

afterEach(() => {
  vi.clearAllMocks();
  mockState.localParams = {};
  mockState.propertyDetailState = null;
  mockState.renderLog.pressables = [];
  mockState.renderLog.stickyBars = [];
  mockState.renderLog.textInputs = [];
  mockState.searchContext = null;
  mockState.searchState = null;
});

describe("assistant handoff surfaces", () => {
  it("keeps the search input local and routes the explicit chat CTA into the main conversation page", () => {
    mockState.localParams = {
      threadId: "thread-1",
      sourcePropertyId: "property-7",
    };
    mockState.searchContext = {
      threadId: "thread-1",
      sourcePropertyId: "property-7",
      searchSummary: "شقق في شمال الرياض",
    };
    mockState.searchState = {
      query: "",
      results: [],
      selectedArea: "الكل",
      selectedOwnerType: "الكل",
      setQuery: searchSetQuery,
    };

    renderComponent(React.createElement(SearchScreen));

    latestTextInput()?.props?.onChangeText?.("بحث محلي");
    findRecordedPressable("تابع في المحادثة")?.props?.onPress?.();

    expect(searchSetQuery).toHaveBeenCalledWith("بحث محلي");
    expect(mockState.router.push).toHaveBeenCalledWith({
      pathname: "/",
      params: {
        threadId: "thread-1",
        propertyId: "property-7",
      },
    });
  });

  it("keeps the broker surface as a detail page and sends the fallback third action to the main chat page", () => {
    const property = createProperty("broker-property");
    mockState.localParams = {
      propertyId: property.id,
      threadId: "thread-2",
    };
    mockState.propertyDetailState = {
      isLoading: false,
      property,
    };

    renderComponent(React.createElement(BrokerProfileScreen));

    latestStickyBar()?.props?.onThirdAction?.();

    expect(latestStickyBar()?.props?.thirdActionLabel).toBe("تابع في المحادثة");
    expect(mockState.router.push).toHaveBeenCalledWith({
      pathname: "/",
      params: {
        threadId: "thread-2",
        propertyId: property.id,
      },
    });
  });

  it("routes property-page fallback chat entry back into the main conversation page with the active property context", () => {
    const property = createProperty("detail-property");
    mockState.localParams = {
      id: property.id,
      threadId: "thread-3",
    };
    mockState.propertyDetailState = {
      isLoading: false,
      property,
    };

    renderComponent(React.createElement(PropertyDetailScreen));

    latestStickyBar()?.props?.onThirdAction?.();

    expect(latestStickyBar()?.props?.thirdActionLabel).toBe("تابع في المحادثة");
    expect(mockState.router.push).toHaveBeenCalledWith({
      pathname: "/",
      params: {
        propertyId: property.id,
        threadId: "thread-3",
      },
    });
  });
});
