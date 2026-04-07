import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchResultsPanel } from "@/components/chat/SearchResultsPanel";
import { collectTextContent, findElementsByType } from "@/test/reactTree";
import type { MobileProperty, MobileSearchContext } from "@/types/mobile";

vi.mock("react-native", () => ({
  Pressable: "Pressable",
  View: "View",
}));

vi.mock("lucide-react-native", () => ({
  ChevronLeft: "ChevronLeft",
  Compass: "Compass",
  Sparkles: "Sparkles",
}));

vi.mock("@/components/property/MobilePropertyCard", () => ({
  MobilePropertyCard: "MobilePropertyCard",
}));

vi.mock("@/components/ui/AppText", () => ({
  AppText: "AppText",
}));

vi.mock("@/lib/mobileTheme", () => ({
  getMobileShadow: () => ({
    shadowColor: "transparent",
  }),
  useAppTheme: () => ({
    colors: {
      accent: "#2563eb",
      border: "#e4e4e7",
      ink: "#09090b",
      inkMuted: "#71717a",
      primary: "#2563eb",
      surface: "#ffffff",
      surfaceMuted: "#f4f4f5",
    },
    radii: {
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

function getProp<T>(element: { props?: Record<string, unknown> } | undefined, key: string): T {
  return element?.props?.[key] as T;
}

describe("SearchResultsPanel", () => {
  it("keeps the contextual header while reusing the shared compact property renderer", () => {
    const onShowMore = vi.fn();
    const searchContext: MobileSearchContext = {
      searchSummary: "شقق قريبة من الخدمات",
    };
    const results = [createProperty("1"), createProperty("2"), createProperty("3")];
    const tree = SearchResultsPanel({
      searchContext,
      results,
      onPropertyPress: vi.fn(),
      onShowMore,
    });

    const cards = findElementsByType(tree, "MobilePropertyCard");
    const text = collectTextContent(tree).join(" ");
    const showMoreButtons = findElementsByType(tree, "Pressable");

    expect(text).toContain("نتائج موسّعة من نفس الطلب");
    expect(text).toContain(searchContext.searchSummary);
    expect(cards).toHaveLength(2);
    expect(cards.every((card) => card?.props?.variant === "compact")).toBe(true);
    getProp<() => void>(showMoreButtons[0], "onPress")();
    expect(onShowMore).toHaveBeenCalledTimes(1);
  });
});
