import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AccountScreen from "@/features/AccountScreen/index";
import AccountSavedScreen from "@/features/AccountSavedScreen/index";
import AccountHistoryScreen from "@/features/AccountHistoryScreen/index";
import AccountSettingsScreen from "@/features/AccountSettingsScreen/index";
import AccountProfileScreen from "@/features/AccountProfileScreen/index";
import { MobileLocaleProvider } from "@/lib/mobileLocale";

const renderToStaticMarkup = require("react-dom/server").renderToStaticMarkup as (element: React.ReactElement) => string;

const mockState = vi.hoisted(() => ({
  router: {
    back: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  },
  buyerAccount: {
    viewer: {
      displayName: "أحمد",
      phone: "0500000000",
      email: "ahmed@example.com",
      isAuthenticated: false,
      savedPropertyIds: ["property-1"],
      threadCount: 1,
      activeThreadId: "thread-1",
      consents: {},
      preferences: {
        locale: "ar",
        financeDefaults: {
          downPaymentPercent: 10,
          preferredYears: 20,
          annualRate: 4.75,
        },
      },
    },
    authSources: {
      clerk: {
        displayName: "أحمد",
        email: "ahmed@example.com",
        phone: "0500000000",
      },
      convex: null,
    },
    recentThreads: [{ id: "thread-1", title: "شقة في الرياض", preview: "أريد تمويلاً مناسباً", updatedAt: Date.UTC(2026, 3, 10) }],
    updateProfile: vi.fn(),
    updatePreferences: vi.fn(),
    updateFinanceDefaults: vi.fn(),
    resetLocalBuyerState: vi.fn(),
  },
  buyerAuth: {
    signOutToGuest: vi.fn(async () => "/"),
  },
  feed: {
    findPropertyById: vi.fn((propertyId?: string | null) =>
      propertyId
        ? {
            id: propertyId,
            title: "شقة الياسمين",
            price: 1200000,
            media: [],
            address: "الرياض",
            area: "الياسمين",
            location: "الرياض",
            beds: 3,
            baths: 2,
            owner: { id: "owner-1", type: "broker", name: "وسيط", slug: "owner", isVerified: true },
          }
        : null,
    ),
  },
  actionRows: [] as Array<Record<string, any>>,
  propertyCards: [] as Array<Record<string, any>>,
  buttons: [] as Array<Record<string, any>>,
}));

vi.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) => (props: any) => React.createElement(name, props, props.children);

  return {
    View: host("rn-view"),
    ScrollView: host("rn-scroll-view"),
    Pressable: host("rn-pressable"),
    TextInput: host("rn-text-input"),
    Image: host("rn-image"),
    Alert: { alert: vi.fn() },
    Appearance: { setColorScheme: vi.fn() },
  };
});

vi.mock("expo-router", () => ({
  useRouter: () => mockState.router,
}));

vi.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock("lucide-react-native", () => ({
  ArrowLeft: "ArrowLeft",
  Bookmark: "Bookmark",
  ChevronLeft: "ChevronLeft",
  ChevronRight: "ChevronRight",
  Clock3: "Clock3",
  CreditCard: "CreditCard",
  FileText: "FileText",
  LogOut: "LogOut",
  Mail: "Mail",
  MessageCircle: "MessageCircle",
  Monitor: "Monitor",
  Moon: "Moon",
  MapPin: "MapPin",
  Phone: "Phone",
  Save: "Save",
  ShieldCheck: "ShieldCheck",
  SlidersHorizontal: "SlidersHorizontal",
  Sun: "Sun",
  Trash2: "Trash2",
  User: "User",
  UserRound: "UserRound",
}));

vi.mock("@/components/ui/AppText", () => ({
  AppText: (props: any) => {
    const React = require("react");
    return React.createElement("app-text", props, props.children);
  },
}));

vi.mock("@/components/ui/Button", () => ({
  Button: (props: any) => {
    const React = require("react");
    mockState.buttons.push(props);
    return React.createElement("app-button", props, props.label);
  },
}));

vi.mock("@/components/ui/IconButton", () => ({
  IconButton: (props: any) => {
    const React = require("react");
    return React.createElement("icon-button", props);
  },
}));

vi.mock("@/components/ui/MobileChrome", () => ({
  MobileTopBar: (props: any) => {
    const React = require("react");
    return React.createElement("mobile-top-bar", props, props.centerSlot);
  },
  MobilePill: (props: any) => {
    const React = require("react");
    return React.createElement("mobile-pill", props, props.label);
  },
  MobileSurface: (props: any) => {
    const React = require("react");
    return React.createElement("mobile-surface", props, props.children);
  },
}));

vi.mock("@/components/property/MobilePropertyCard", () => ({
  MobilePropertyCard: (props: any) => {
    const React = require("react");
    mockState.propertyCards.push(props);
    return React.createElement("mobile-property-card", props, props.property?.title);
  },
}));

vi.mock("@/hooks/useBuyerAccount", () => ({
  useBuyerAccount: () => mockState.buyerAccount,
}));

vi.mock("@/hooks/useBuyerAuth", () => ({
  useBuyerAuth: () => mockState.buyerAuth,
}));

vi.mock("@/hooks/usePropertyFeed", () => ({
  usePropertyFeed: () => mockState.feed,
}));

vi.mock("@/lib/mobileTheme", () => ({
  useAppTheme: () => ({
    colors: {
      border: "#e4e4e7",
      borderStrong: "#d4d4d8",
      canvas: "#fafafa",
      surface: "#ffffff",
      surfaceMuted: "#f4f4f5",
      primary: "#2563eb",
      primaryMuted: "#bfdbfe",
      primarySoft: "#dbeafe",
      ink: "#09090b",
      inkMuted: "#71717a",
      inkSoft: "#52525b",
      danger: "#dc2626",
      dangerSoft: "#fee2e2",
    },
    radii: {
      card: 20,
      hero: 24,
      pill: 999,
    },
  }),
}));

vi.mock("@/lib/themeStore", () => ({
  getThemePreference: vi.fn(async () => "system"),
  setThemePreference: vi.fn(async () => undefined),
}));

vi.mock("@/features/AccountScreen/shared", () => ({
  AccountPageIntro: (props: any) => {
    const React = require("react");
    return React.createElement("account-page-intro", props, [props.title, props.description, props.children]);
  },
  AccountSection: (props: any) => {
    const React = require("react");
    return React.createElement("account-section", props, [props.title, props.description, props.children]);
  },
  AccountActionList: (props: any) => {
    const React = require("react");
    return React.createElement("account-action-list", props, props.children);
  },
  AccountStatCard: (props: any) => {
    const React = require("react");
    return React.createElement("account-stat-card", props, `${props.label}:${props.value}`);
  },
  AccountEmptyState: (props: any) => {
    const React = require("react");
    return React.createElement("account-empty-state", props, [props.title, props.body, props.action]);
  },
  AccountActionRow: (props: any) => {
    const React = require("react");
    mockState.actionRows.push(props);
    return React.createElement("account-action-row", props, [props.label, props.description]);
  },
}));

afterEach(() => {
  vi.clearAllMocks();
  mockState.actionRows = [];
  mockState.propertyCards = [];
  mockState.buttons = [];
  mockState.buyerAccount.viewer.displayName = "أحمد";
  mockState.buyerAccount.viewer.phone = "0500000000";
  mockState.buyerAccount.viewer.email = "ahmed@example.com";
  mockState.buyerAccount.viewer.isAuthenticated = false;
  mockState.buyerAccount.viewer.savedPropertyIds = ["property-1"];
  mockState.buyerAccount.viewer.threadCount = 1;
  mockState.buyerAccount.viewer.preferences.locale = "ar";
  mockState.buyerAccount.recentThreads = [{ id: "thread-1", title: "شقة في الرياض", preview: "أريد تمويلاً مناسباً", updatedAt: Date.UTC(2026, 3, 10) }];
  mockState.buyerAccount.authSources.clerk = {
    displayName: "أحمد",
    email: "ahmed@example.com",
    phone: "0500000000",
  };
});

describe("native mobile account flow", () => {
  it("wires the quiet account hub rows to the core sub-routes", () => {
    const html = renderToStaticMarkup(React.createElement(AccountScreen));

    expect(html).toContain("وضع الضيف");
    expect(html).toContain("شقة الياسمين");
    expect(html).toContain("العقارات المحفوظة");
    expect(html).toContain("سجل المحادثات");
    expect(html).toContain("سجّل الدخول أو اربط الحساب");

    mockState.actionRows.find((row) => row.testID === "account-hub-profile")?.onPress?.();
    mockState.actionRows.find((row) => row.testID === "account-hub-saved")?.onPress?.();
    mockState.actionRows.find((row) => row.testID === "account-hub-history")?.onPress?.();
    mockState.actionRows.find((row) => row.testID === "account-hub-settings")?.onPress?.();

    expect(mockState.router.push).toHaveBeenCalledWith("/account/profile");
    expect(mockState.router.push).toHaveBeenCalledWith("/account/saved");
    expect(mockState.router.push).toHaveBeenCalledWith("/account/history");
    expect(mockState.router.push).toHaveBeenCalledWith("/account/settings");
  });

  it("shows the full saved-properties screen and falls back gracefully when empty", () => {
    let html = renderToStaticMarkup(React.createElement(AccountSavedScreen));
    expect(mockState.propertyCards).toHaveLength(1);
    expect(html).toContain("شقة الياسمين");
    expect(html).toContain("الياسمين");
    expect(html).toContain("تابع في المحادثة");

    mockState.propertyCards = [];
    mockState.buyerAccount.viewer.savedPropertyIds = [];
    html = renderToStaticMarkup(React.createElement(AccountSavedScreen));

    expect(html).toContain("لا توجد عقارات محفوظة بعد");
    expect(html).toContain("افتح البحث");
  });

  it("shows history entries when present and an empty state otherwise", () => {
    let html = renderToStaticMarkup(React.createElement(AccountHistoryScreen));
    expect(html).toContain("شقة في الرياض");
    expect(html).toContain("أريد تمويلاً مناسباً");

    mockState.buyerAccount.viewer.threadCount = 0;
    mockState.buyerAccount.recentThreads = [];
    html = renderToStaticMarkup(React.createElement(AccountHistoryScreen));
    expect(html).toContain("لا توجد محادثات بعد");
    expect(html).toContain("افتح المساعد");
  });

  it("exposes settings actions for finance and privacy and shows profile form fields", () => {
    let html = renderToStaticMarkup(React.createElement(AccountSettingsScreen));
    expect(html).toContain("ahmed@example.com");
    expect(html).toContain("الخصوصية والبيانات");
    expect(html).toContain("إدارة الجلسة والبيانات");

    mockState.buttons.find((button) => button.label === "افتح شاشة التمويل")?.onPress?.();
    expect(mockState.router.push).toHaveBeenCalledWith("/finance");

    html = renderToStaticMarkup(React.createElement(AccountProfileScreen));
    expect(html).toContain("ahmed@example.com");
    expect(html).toContain("الاسم الظاهر");
    expect(html).toContain("20y");
  });

  it("renders the account home cleanly in English without Arabic fallback copy", () => {
    mockState.buyerAccount.viewer.preferences.locale = "en";
    mockState.buyerAccount.viewer.displayName = "Ahmed";
    mockState.buyerAccount.viewer.phone = "+966500000000";
    mockState.buyerAccount.viewer.isAuthenticated = true;
    mockState.buyerAccount.authSources.clerk = {
      displayName: "Ahmed",
      email: "ahmed@example.com",
      phone: "+966500000000",
    };

    const html = renderToStaticMarkup(
      React.createElement(
        MobileLocaleProvider,
        { locale: "en", children: React.createElement(AccountScreen) },
      ),
    );

    expect(html).toContain("Ahmed");
    expect(html).toContain("+966500000000");
    expect(html).toContain("Saved properties");
    expect(html).toContain("Settings");
    expect(html).not.toContain("سجّل الدخول أو اربط الحساب");
  });

  it("switches the settings auth action into sign-out for authenticated buyers", () => {
    mockState.buyerAccount.viewer.isAuthenticated = true;

    const html = renderToStaticMarkup(React.createElement(AccountSettingsScreen));

    expect(html).toContain("تسجيل الخروج");
    expect(html).toContain("إدارة الجلسة والبيانات");
  });
});
