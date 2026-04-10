import React from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import BuyerAssistantHomeScreen from "@/features/BuyerAssistantHomeScreen";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { useAppTheme } from "@/lib/mobileTheme";

/**
 * WHY:   Launch now depends on auth skip state as well as onboarding.
 * WHAT:  Gates the buyer launch into auth or the assistant workspace.
 * HOW:   Waits for the merged buyer account to hydrate, then redirects to the correct route when needed.
 */
export default function BuyerEntryScreen() {
  const theme = useAppTheme();
  const account = useBuyerAccount();

  if (!account.isHydrated) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.canvas }} />;
  }

  if (account.launchRoute === "/auth") {
    return <Redirect href="/auth" />;
  }

  if (account.launchRoute !== "/") {
    return <Redirect href={account.launchRoute} />;
  }

  return <BuyerAssistantHomeScreen />;
}
