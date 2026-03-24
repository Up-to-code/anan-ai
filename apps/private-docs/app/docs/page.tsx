import { redirect } from "next/navigation";

/**
 * WHY:   The docs root should land engineers on the handbook overview before deeper chapters.
 * WHAT:  Redirects `/docs` to the private overview page.
 * HOW:   Uses Next.js server redirect for deterministic routing.
 */
export default function DocsIndexPage() {
  redirect("/docs/overview");
}
