import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";

const scheme = Constants.expoConfig?.scheme as string | undefined;

/**
 * WHY:   The mobile app needs one Better Auth client that stores cookies securely and can mint Convex tokens.
 * WHAT:  Creates the Expo Better Auth client with Convex, organization, and email OTP plugins.
 * HOW:   Uses the Convex site URL as the auth base URL and Expo SecureStore for the native cookie jar.
 */
export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
  plugins: [
    expoClient({
      scheme,
      storagePrefix: scheme ?? "anan-mobile",
      storage: SecureStore,
    }),
    convexClient(),
    organizationClient(),
    emailOTPClient(),
  ],
});
