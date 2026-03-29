import HandoffScreen from "@/features/HandoffScreen";

/**
 * WHY:   Advisor handoff should return into the native buyer product instead of a generic account page.
 * WHAT:  Renders the mobile handoff confirmation route.
 * HOW:   Delegates to the dedicated handoff feature so route logic stays thin.
 */
export default function HandoffRoute() {
  return <HandoffScreen />;
}
