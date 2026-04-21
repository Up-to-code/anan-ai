import AnalyticsScreen from "@/features/AnalyticsScreen/index";

/**
 * WHY:   The mobile app needs a dedicated analytics mock route so product and design can review a focused insights surface in context.
 * WHAT:  Renders the mobile analytics experience.
 * HOW:   Keeps the Expo route thin and delegates the full screen composition to the analytics feature folder.
 */
export default function AnalyticsRoute() {
  return <AnalyticsScreen />;
}
