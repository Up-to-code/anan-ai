import { afterEach, describe, expect, it, vi } from "vitest";
import { PropertyRecommendationRow } from "@/components/chat/PropertyRecommendationRow";
import { findElementsByType } from "@/test/reactTree";
import type { MobileProperty } from "@/types/mobile";

vi.mock("react-native", () => ({
  Pressable: "Pressable",
  View: "View",
}));

vi.mock("lucide-react-native", () => ({
  ChevronLeft: "ChevronLeft",
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
      border: "#e4e4e7",
      ink: "#09090b",
      surface: "#ffffff",
    },
    radii: {
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

describe("PropertyRecommendationRow", () => {
  it("shows only the first two compact cards and reveals the show-more action for longer lists", () => {
    const onShowMore = vi.fn();
    const properties = [createProperty("1"), createProperty("2"), createProperty("3")];
    const tree = PropertyRecommendationRow({
      properties,
      onPropertyPress: vi.fn(),
      onShowMore,
    });

    const cards = findElementsByType(tree, "MobilePropertyCard");
    const showMoreButtons = findElementsByType(tree, "Pressable");

    expect(cards).toHaveLength(2);
    expect(cards.every((card) => card?.props?.variant === "compact")).toBe(true);
    getProp<() => void>(showMoreButtons[0], "onPress")();
    expect(onShowMore).toHaveBeenCalledTimes(1);
  });

  it("omits the show-more action when the inline preview already contains all results", () => {
    const properties = [createProperty("1"), createProperty("2")];
    const tree = PropertyRecommendationRow({
      properties,
      onPropertyPress: vi.fn(),
    });

    expect(findElementsByType(tree, "MobilePropertyCard")).toHaveLength(2);
    expect(findElementsByType(tree, "Pressable")).toHaveLength(0);
  });

  it("forwards an explicit generated card variant when the caller opts into it", () => {
    const tree = PropertyRecommendationRow({
      properties: [createProperty("1"), createProperty("2")],
      onPropertyPress: vi.fn(),
      cardVariant: "generated",
    });

    const cards = findElementsByType(tree, "MobilePropertyCard");

    expect(cards).toHaveLength(2);
    expect(cards.every((card) => card?.props?.variant === "generated")).toBe(true);
  });
});
