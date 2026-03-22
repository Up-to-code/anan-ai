import BuyerAssistantHomeScreen from "@/features/BuyerAssistantHomeScreen";

/**
 * WHY:   The new mobile app should open directly into the buyer assistant workspace.
 * WHAT:  Renders the chat-first Anan home screen.
 * HOW:   Delegates all state and composition to the buyer assistant feature folder.
 */
export default function IndexRoute() {
  return <BuyerAssistantHomeScreen />;
}
