import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileBrokerCard } from "@/components/brokers/MobileBrokerCard";
import { findElementsByType } from "@/test/reactTree";
import type { MobileBroker } from "@/types/mobile";

vi.mock("react-native", () => ({
  Pressable: "Pressable",
  View: "View",
}));

vi.mock("expo-image", () => ({
  Image: "Image",
}));

vi.mock("lucide-react-native", () => ({
  MessageCircle: "MessageCircle",
  Phone: "Phone",
  ShieldCheck: "ShieldCheck",
}));

vi.mock("@/components/ui/AppText", () => ({
  AppText: "AppText",
}));

vi.mock("@/lib/mobileTheme", () => ({
  useAppTheme: () => ({
    colors: {
      border: "#e4e4e7",
      ink: "#09090b",
      inkMuted: "#71717a",
      inkSoft: "#27272a",
      primary: "#2563eb",
      surface: "#ffffff",
      surfaceMuted: "#f4f4f5",
      teal: "#0d9488",
    },
    radii: {
      card: 16,
      hero: 24,
    },
  }),
}));

const broker: MobileBroker = {
  id: "broker-1",
  slug: "broker-1",
  name: "Nada Elhouseiny",
  avatar: "https://example.com/avatar.jpg",
  company: "Scouts",
  badges: [
    { id: "verified", label: "معتمد", tone: "sky" },
    { id: "trusted", label: "TruBroker", tone: "ink" },
  ],
  languages: ["ar", "en"],
  phone: "+201000000000",
  whatsapp: "+201000000000",
  isVerified: true,
  location: "الشيخ زايد",
  bio: "وسيطة نشطة",
  listingCount: 8,
  rating: 4.8,
  relatedPropertyIds: ["hittin-panorama"],
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("MobileBrokerCard", () => {
  it("routes the body press separately from quick actions", () => {
    const onPress = vi.fn();
    const onPressCall = vi.fn();
    const onPressWhatsApp = vi.fn();
    const tree = MobileBrokerCard({
      broker,
      onPress,
      onPressCall,
      onPressWhatsApp,
    });

    const pressables = findElementsByType(tree, "Pressable");
    (pressables[0]?.props?.onPress as () => void)?.();
    expect(onPress).toHaveBeenCalledWith(broker);
    expect(onPressCall).not.toHaveBeenCalled();
    expect(onPressWhatsApp).not.toHaveBeenCalled();
  });
});
