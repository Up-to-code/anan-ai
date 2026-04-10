import type { ExpoConfig } from "expo/config";

const appJson = require("./app.json") as { expo: ExpoConfig };

/**
 * WHY:   Expo public env is the preferred mobile auth contract, but local work still needs a bridge for the legacy Clerk key name.
 * WHAT:  Extends the base Expo config with non-secret runtime extras used by the mobile app.
 * HOW:   Copies CLERK_PUBLISHABLE_KEY into Expo config extra so the app can read it as a compatibility fallback.
 */
export default {
  ...appJson.expo,
  extra: {
    ...(appJson.expo.extra ?? {}),
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY?.trim() || undefined,
  },
} satisfies ExpoConfig;
