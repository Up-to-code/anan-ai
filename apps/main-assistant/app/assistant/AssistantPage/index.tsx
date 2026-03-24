import PublicAssistantClient from "./PublicAssistantClient";
import { getMainAssistantThread } from "@/server/domains/mainAssistant/service";

/**
 * WHY:   The route entrypoint should stay server-owned while keeping client interaction logic isolated.
 * WHAT:  Loads the optional current guest thread and hands it to the client assistant workspace.
 * HOW:   Tries to hydrate from the server session cookie first, then falls back to a client bootstrap call.
 */
export default async function AssistantPage() {
  let initialThread = null;

  try {
    initialThread = await getMainAssistantThread();
  } catch {
    initialThread = null;
  }

  return <PublicAssistantClient initialThread={initialThread} />;
}
