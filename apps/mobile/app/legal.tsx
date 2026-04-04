import LegalScreen from "@/features/LegalScreen";

/**
 * WHY:   The mobile app needs one dedicated legal route so policy and privacy details are easy to review and revisit.
 * WHAT:  Renders the buyer-facing legal screen.
 * HOW:   Keeps the route file thin by delegating to the LegalScreen feature module.
 */
export default function LegalRoute() {
  return <LegalScreen />;
}
