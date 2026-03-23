import { redirect } from "next/navigation";

/**
 * WHY:   The docs root should land external developers on the first actionable guide.
 * WHAT:  Redirects `/docs` to the getting started page.
 * HOW:   Uses Next.js server redirect for deterministic routing.
 */
export default function DocsIndexPage() {
  redirect("/docs/getting-started");
}
