import { ReactNode } from "react";
import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

/**
 * WHY:   The mobile app should consume live Convex data when a deployment URL is configured.
 * WHAT:  Wraps children in a Convex provider when the environment is ready.
 * HOW:   Falls back to a pass-through wrapper so local UI work still functions without backend setup.
 */
export function ConvexProvider({ children }: { children: ReactNode }) {
  if (!convexClient) {
    return children;
  }

  return <ConvexReactProvider client={convexClient}>{children}</ConvexReactProvider>;
}
