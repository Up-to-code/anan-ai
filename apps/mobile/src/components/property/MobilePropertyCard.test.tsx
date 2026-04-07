import { afterEach, describe, expect, it, vi } from "vitest";
import { MobilePropertyCard } from "@/components/property/MobilePropertyCard";
import { findElementsByType } from "@/test/reactTree";
import type { MobileProperty } from "@/types/mobile";

vi.mock("react-native", () => ({
  Pressable: "Pressable",
  View: "View",
}));

vi.mock("lucide-react-native", () => ({
  BedDouble: "BedDouble",
  ChevronLeft: "ChevronLeft",
  MapPin: "MapPin",
  ShieldCheck: "ShieldCheck",
}));

vi.mock("@/components/property/CursorCardShell", () => ({
  CursorCardAction: "CursorCardAction",
  CursorCardShell: "CursorCardShell",
}));

vi.mock("@/components/property/CursorPropertyMediaViewer", () => ({
  CursorPropertyMediaViewer: "CursorPropertyMediaViewer",
}));

vi.mock("@/components/ui/AppText", () => ({
  AppText: "AppText",
}));

vi.mock("@/lib/mobileLayout", () => ({
  useMobileLayout: () => ({
    isCompact: false,
    propertyCardWidth: 320,
  }),
}));

vi.mock("@/lib/mobileTheme", () => ({
  useAppTheme: () => ({
    isDark: false,
    colors: {
      border: "#e4e4e7",
      borderStrong: "#d4d4d8",
      ink: "#09090b",
      inkMuted: "#71717a",
      inkSoft: "#27272a",
      primary: "#2563eb",
      surfaceMuted: "#f4f4f5",
      teal: "#0d9488",
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

const sampleProperty: MobileProperty = {
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

afterEach(() => {
  vi.clearAllMocks();
});

function getProp<T>(element: { props?: Record<string, unknown> } | undefined, key: string): T {
  return element?.props?.[key] as T;
}

describe("MobilePropertyCard", () => {
  it("switches media geometry between compact and featured variants", () => {
    const compactTree = MobilePropertyCard({
      variant: "compact",
      property: sampleProperty,
      onPress: vi.fn(),
      actionLabel: "متابعة",
    });
    const featuredTree = MobilePropertyCard({
      variant: "featured",
      property: sampleProperty,
      onPress: vi.fn(),
      actionLabel: "متابعة",
    });
    const generatedTree = MobilePropertyCard({
      variant: "generated",
      property: sampleProperty,
      onPress: vi.fn(),
      actionLabel: "متابعة",
    });

    const compactMedia = findElementsByType(compactTree, "CursorPropertyMediaViewer")[0];
    const featuredMedia = findElementsByType(featuredTree, "CursorPropertyMediaViewer")[0];
    const generatedMedia = findElementsByType(generatedTree, "CursorPropertyMediaViewer")[0];

    expect(compactMedia?.props?.width).toBe(104);
    expect(compactMedia?.props?.height).toBe(112);
    expect(featuredMedia?.props?.width).toBeUndefined();
    expect(featuredMedia?.props?.height).toBe(180);
    expect(generatedMedia?.props?.width).toBeUndefined();
    expect(generatedMedia?.props?.height).toBe(320);
  });

  it("keeps body press and CTA press distinct when both are configured", () => {
    const onPress = vi.fn();
    const onActionPress = vi.fn();
    const tree = MobilePropertyCard({
      variant: "compact",
      property: sampleProperty,
      onPress,
      onActionPress,
      actionLabel: "متابعة",
    });

    const bodyPressable = findElementsByType(tree, "Pressable")[0];
    const action = findElementsByType(tree, "CursorCardAction")[0];

    getProp<() => void>(bodyPressable, "onPress")();
    expect(onPress).toHaveBeenCalledWith(sampleProperty);
    expect(onActionPress).not.toHaveBeenCalled();

    onPress.mockClear();
    getProp<() => void>(action, "onPress")();
    expect(onActionPress).toHaveBeenCalledWith(sampleProperty);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("routes gallery taps through the media viewer without triggering detail navigation", () => {
    const onPress = vi.fn();
    const onOpenGallery = vi.fn();
    const tree = MobilePropertyCard({
      variant: "featured",
      property: sampleProperty,
      onPress,
      onOpenGallery,
      actionLabel: "متابعة",
    });

    const media = findElementsByType(tree, "CursorPropertyMediaViewer")[0];
    getProp<(index: number) => void>(media, "onOpenGallery")(2);

    expect(onOpenGallery).toHaveBeenCalledWith(sampleProperty, 2);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders the footer CTA only when an action label is configured", () => {
    const tree = MobilePropertyCard({
      variant: "featured",
      property: sampleProperty,
      onPress: vi.fn(),
    });

    expect(findElementsByType(tree, "CursorCardAction")).toHaveLength(0);
  });
});
