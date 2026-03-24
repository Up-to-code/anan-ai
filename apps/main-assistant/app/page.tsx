import AssistantPage from "@/app/assistant/AssistantPage";

/**
 * WHY:   The new app has one primary job: host the dedicated public assistant surface.
 * WHAT:  Routes the root page directly into the assistant experience.
 * HOW:   Keeps the route tree shallow and lets the assistant page own all UI composition.
 */
export default function Page() {
  return <AssistantPage />;
}
