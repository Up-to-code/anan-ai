import React from "react";
import { View } from "react-native";
import BuyerAssistantHomeScreen from "@/features/BuyerAssistantHomeScreen";
import WelcomeScreen from "@/features/WelcomeScreen";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { useAppTheme } from "@/lib/mobileTheme";

/**
 * WHY:   The buyer app should only show the welcome screen on first run, then open directly into the active assistant workspace on subsequent launches.
 * WHAT:  Chooses the initial buyer screen based on the persisted onboarding state.
 * HOW:   Waits for the buyer account contract to hydrate before rendering either the onboarding surface or the assistant home.
 */
export default function BuyerEntryScreen() {
  const theme = useAppTheme();
  const account = useBuyerAccount();

  if (!account.isHydrated) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.canvas }} />;
  }

  return account.isOnboardingComplete ? <BuyerAssistantHomeScreen /> : <WelcomeScreen />;
}
