import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import BrokerDiscoveryScreen from "@/features/BrokerDiscoveryScreen/index";

const renderToStaticMarkup = require("react-dom/server").renderToStaticMarkup as (element: React.ReactElement) => string;

const mockState = vi.hoisted(() => ({
  cardProps: [] as Array<Record<string, any>>,
  openURL: vi.fn(),
  router: {
    back: vi.fn(),
    push: vi.fn(),
  },
}));

vi.mock("react-native", () => {
  const React = require("react");
  const host = (name: string, props?: Record<string, unknown>, children?: unknown) =>
    React.createElement(name, props, children);

  return {
    Share: { share: vi.fn() },
    TextInput: (props: any) => host("rn-text-input", props),
    View: (props: any) => host("rn-view", props, props.children),
  };
});

vi.mock("expo-linking", () => ({
  openURL: mockState.openURL,
}));

vi.mock("expo-router", () => ({
  useRouter: () => mockState.router,
}));

vi.mock("@shopify/flash-list", () => {
  const React = require("react");
  return {
    FlashList: ({ data, renderItem, ListEmptyComponent }: any) =>
      React.createElement(
        "flash-list",
        null,
        (data ?? []).length > 0 ? (data ?? []).map((item: any) => renderItem({ item })) : ListEmptyComponent,
      ),
  };
});

vi.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock("lucide-react-native", () => ({
  ArrowRight: "ArrowRight",
  MapPin: "MapPin",
  Search: "Search",
  Share2: "Share2",
  SlidersHorizontal: "SlidersHorizontal",
}));

vi.mock("@/components/ui/AppText", () => ({
  AppText: "AppText",
}));

vi.mock("@/components/ui/Button", () => ({
  Button: "Button",
}));

vi.mock("@/components/ui/IconButton", () => ({
  IconButton: "IconButton",
}));

vi.mock("@/components/ui/MobileChrome", () => {
  const React = require("react");
  return {
    MobileSurface: (props: any) => React.createElement("mobile-surface", props, props.children),
    MobileTopBar: (props: any) => React.createElement("mobile-top-bar", props, props.centerSlot),
  };
});

vi.mock("@/components/brokers/MobileBrokerCard", () => {
  const React = require("react");
  return {
    MobileBrokerCard: (props: any) => {
      mockState.cardProps.push(props);
      return React.createElement("mobile-broker-card", props);
    },
  };
});

vi.mock("@/lib/mobileTheme", () => ({
  useAppTheme: () => ({
    colors: {
      border: "#e4e4e7",
      borderStrong: "#d4d4d8",
      canvas: "#ffffff",
      ink: "#09090b",
      inkMuted: "#71717a",
      primary: "#2563eb",
      surface: "#ffffff",
      primarySoft: "#dbeafe",
    },
    radii: {
      hero: 24,
    },
  }),
}));

afterEach(() => {
  vi.clearAllMocks();
  mockState.cardProps = [];
});

describe("BrokerDiscoveryScreen", () => {
  it("renders the broker discovery shell without crashing", () => {
    const html = renderToStaticMarkup(React.createElement(BrokerDiscoveryScreen));
    expect(html).toContain("ابحث عن الوكيل");
    expect(html).toContain("حدد الموقع");
  });

  it("includes the broker count summary", () => {
    const html = renderToStaticMarkup(React.createElement(BrokerDiscoveryScreen));
    expect(html).toContain("عرض وكيل");
  });

  it("wires broker quick actions to call and WhatsApp URLs", () => {
    renderToStaticMarkup(React.createElement(BrokerDiscoveryScreen));

    const firstCard = mockState.cardProps[0];
    firstCard?.onPressCall?.({ phone: "+201001112233" });
    firstCard?.onPressWhatsApp?.({ whatsapp: "+201001112233" });

    expect(mockState.openURL).toHaveBeenCalledWith("tel:+201001112233");
    expect(mockState.openURL).toHaveBeenCalledWith("https://wa.me/201001112233");
  });
});
