import { describe, expect, it, vi } from "vitest";
import BuyerEntryScreen from "@/features/BuyerEntryScreen";
import { collectElementTree, findElementsByType } from "@/test/reactTree";

const mockState = vi.hoisted(() => ({
  buyerAccount: {
    isHydrated: false,
    isOnboardingComplete: false,
  },
}));

vi.mock("react-native", () => ({
  View: "View",
}));

vi.mock("@/features/BuyerAssistantHomeScreen", () => ({
  default: "BuyerAssistantHomeScreen",
}));

vi.mock("@/features/WelcomeScreen", () => ({
  default: "WelcomeScreen",
}));

vi.mock("@/hooks/useBuyerAccount", () => ({
  useBuyerAccount: () => mockState.buyerAccount,
}));

vi.mock("@/lib/mobileTheme", () => ({
  useAppTheme: () => ({
    colors: {
      canvas: "#fafafa",
    },
  }),
}));

describe("BuyerEntryScreen", () => {
  it("waits for buyer-account hydration before showing a route", () => {
    mockState.buyerAccount = {
      isHydrated: false,
      isOnboardingComplete: false,
    };

    const tree = BuyerEntryScreen();

    expect(findElementsByType(tree, "View")).toHaveLength(1);
    expect(findElementsByType(tree, "WelcomeScreen")).toHaveLength(0);
    expect(findElementsByType(tree, "BuyerAssistantHomeScreen")).toHaveLength(0);
  });

  it("shows onboarding only for first-run buyers", () => {
    mockState.buyerAccount = {
      isHydrated: true,
      isOnboardingComplete: false,
    };

    const tree = BuyerEntryScreen();

    expect(findElementsByType(tree, "WelcomeScreen")).toHaveLength(1);
  });

  it("opens the assistant workspace once onboarding is complete", () => {
    mockState.buyerAccount = {
      isHydrated: true,
      isOnboardingComplete: true,
    };

    const tree = BuyerEntryScreen();

    expect(findElementsByType(tree, "BuyerAssistantHomeScreen")).toHaveLength(1);
    expect(collectElementTree(tree)).not.toEqual([]);
  });
});
