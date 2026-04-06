import { afterEach, describe, expect, it, vi } from "vitest";
import { ActivePropertyComposerCard } from "@/features/BuyerAssistantHomeScreen/ActivePropertyComposerCard";
import { collectTextContent, findElementsByType } from "@/test/reactTree";
import type { MobileProperty } from "@/types/mobile";

vi.mock("react-native", () => ({
  Pressable: "Pressable",
  View: "View",
}));

vi.mock("lucide-react-native", () => ({
  MapPin: "MapPin",
  X: "X",
}));

vi.mock("@/components/property/CursorCardShell", () => ({
  CursorCardShell: "CursorCardShell",
}));

vi.mock("@/components/property/CursorPropertyMediaViewer", () => ({
  CursorPropertyMediaViewer: "CursorPropertyMediaViewer",
}));

vi.mock("@/components/ui/AppText", () => ({
  AppText: "AppText",
}));

vi.mock("@/lib/mobileData", () => ({
  getPropertyHeroImage: () => "https://example.com/fallback.jpg",
  getPropertyLocationLabel: () => "الرياض، الياسمين",
}));

vi.mock("@/lib/mobileTheme", () => ({
  useAppTheme: () => ({
    colors: {
      border: "#e4e4e7",
      borderStrong: "#d4d4d8",
      ink: "#09090b",
      inkMuted: "#71717a",
      inkSoft: "#27272a",
      primary: "#2563eb",
      surfaceMuted: "#f4f4f5",
    },
    cursorCard: {
      surfaceColor: "#ffffff",
    },
    radii: {
      card: 16,
      pill: 999,
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

afterEach(() => {
  vi.clearAllMocks();
});

describe("ActivePropertyComposerCard", () => {
  it("shows the property preview content and the example prompt line", () => {
    const tree = ActivePropertyComposerCard({
      property: createProperty(),
      onPress: vi.fn(),
    });

    const text = collectTextContent(tree).join(" ");
    const media = findElementsByType(tree, "CursorPropertyMediaViewer")[0];

    expect(text).toContain("Palm Residence");
    expect(text).toContain("الرياض، الياسمين");
    expect(text).toContain("اسأل الآن عن التفاصيل أو السعر أو التمويل");
    expect(media?.props?.width).toBe(54);
    expect(media?.props?.height).toBe(54);
  });

  it("taps through the whole helper card to apply the property prompt", () => {
    const onPress = vi.fn();
    const property = createProperty();
    const tree = ActivePropertyComposerCard({
      property,
      onPress,
    });

    const pressable = findElementsByType(tree, "Pressable")[0] as { props?: { onPress?: () => void } } | undefined;
    pressable?.props?.onPress?.();

    expect(onPress).toHaveBeenCalledWith(property);
  });

  it("exposes a dedicated dismiss control when requested", () => {
    const onDismiss = vi.fn();
    const tree = ActivePropertyComposerCard({
      property: createProperty(),
      onPress: vi.fn(),
      onDismiss,
    });

    const pressables = findElementsByType(tree, "Pressable") as Array<{ props?: { onPress?: () => void } }>;
    const dismissButton = pressables[0];

    dismissButton?.props?.onPress?.();

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
