import { afterEach, describe, expect, it, vi } from "vitest";
import { PropertyPromptCardsRail } from "@/features/BuyerAssistantHomeScreen/PropertyPromptCardsRail";
import { collectTextContent } from "@/test/reactTree";
import type { MobileProperty } from "@/types/mobile";

vi.mock("react-native", () => ({
  Pressable: "Pressable",
  ScrollView: "ScrollView",
  View: "View",
}));

vi.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

vi.mock("lucide-react-native", () => ({
  Plus: "Plus",
  Scale3d: "Scale3d",
  X: "X",
}));

vi.mock("@/components/property/CursorPropertyMediaViewer", () => ({
  CursorPropertyMediaViewer: "CursorPropertyMediaViewer",
}));

vi.mock("@/components/ui/AppText", () => ({
  AppText: "AppText",
}));

vi.mock("@/lib/mobileData", () => ({
  getPropertyHeroImage: () => "https://example.com/fallback.jpg",
}));

vi.mock("@/lib/mobileTheme", () => ({
  useAppTheme: () => ({
    colors: {
      border: "#e4e4e7",
      ink: "#09090b",
      inkMuted: "#71717a",
      primary: "#2563eb",
      primaryMuted: "#93c5fd",
      primarySoft: "#dbeafe",
      glassBg: "rgba(255, 255, 255, 0.85)",
      surface: "#ffffff",
      surfaceMuted: "#f4f4f5",
    },
    radii: {
      card: 16,
      pill: 999,
    },
  }),
}));

function createProperty(id: string, title: string): MobileProperty {
  return {
    id,
    title,
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

afterEach(() => {
  vi.clearAllMocks();
});

describe("PropertyPromptCardsRail", () => {
  it("renders circular property prompt tabs and the compare shortcut", () => {
    const tree = PropertyPromptCardsRail({
      properties: [createProperty("property-1", "Palm Residence"), createProperty("property-2", "Garden Villa")],
      onPressProperty: vi.fn(),
      onPressCompare: vi.fn(),
      onRemoveProperty: vi.fn(),
      onToggleComparePicking: vi.fn(),
    });

    const text = collectTextContent(tree).join(" ");

    expect(text).toContain("مقارنة");
  });
});
