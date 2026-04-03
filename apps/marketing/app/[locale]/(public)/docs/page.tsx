import { redirect } from "next/navigation";
import { getDocsUrl } from "@/lib/site";

/**
 * WHY:   Marketing should send docs traffic to the canonical external docs surface.
 * WHAT:  Redirects `/docs` to the configured external docs URL.
 * HOW:   Uses the shared site config so docs can be changed from one place.
 */
export default async function DocsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  redirect(getDocsUrl());
}
