import DocsPage from "@/admin_zone/pages/DocsPage";

/**
 * WHY:   Data model docs need a stable route because engineers reference them during backend and contract work.
 * WHAT:  Renders the data model and contracts docs page.
 * HOW:   Delegates to the docs page orchestrator with the `data` key.
 */
export default function DocsDataRoute() {
  return <DocsPage pageKey="data" />;
}
