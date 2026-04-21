import { describe, expect, it, vi } from "vitest";
import BuyerEntryScreen from "@/features/BuyerEntryScreen";
import { collectElementTree, findElementsByType } from "@/test/reactTree";

const mockState = vi.hoisted(() => ({
  buyerAccount: {
    isHydrated: false,
    isOnboardingComplete: false,
    launchRoute: "/",
  },
}));

vi.mock("react-native", () => ({
  View: "View",
}));

vi.mock("expo-router", () => ({
  Redirect: "Redirect",
}));

vi.mock("@/features/BuyerAssistantHomeScreen", () => ({
  default: "BuyerAssistantHomeScreen",
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
      launchRoute: "/",
    };

    const tree = BuyerEntryScreen();

    expect(findElementsByType(tree, "View")).toHaveLength(1);
    expect(findElementsByType(tree, "BuyerAssistantHomeScreen")).toHaveLength(0);
  });

  it("opens first-run buyers directly into the assistant home", () => {
    mockState.buyerAccount = {
      isHydrated: true,
      isOnboardingComplete: false,
      launchRoute: "/",
    };

    const tree = BuyerEntryScreen();

    expect(findElementsByType(tree, "Redirect")).toHaveLength(0);
    expect(findElementsByType(tree, "BuyerAssistantHomeScreen")).toHaveLength(1);
  });

  it("routes new unauthenticated buyers into auth before a fresh thread", () => {
    mockState.buyerAccount = {
      isHydrated: true,
      isOnboardingComplete: false,
      launchRoute: "/auth",
    };

    const tree = BuyerEntryScreen();

    const redirects = findElementsByType(tree, "Redirect");
    expect(redirects).toHaveLength(1);
    expect(redirects[0]?.props?.href).toBe("/auth");
  });

  it("opens the assistant workspace once onboarding is complete", () => {
    mockState.buyerAccount = {
      isHydrated: true,
      isOnboardingComplete: true,
      launchRoute: "/",
    };

    const tree = BuyerEntryScreen();

    expect(findElementsByType(tree, "BuyerAssistantHomeScreen")).toHaveLength(1);
    expect(collectElementTree(tree)).not.toEqual([]);
  });
});
