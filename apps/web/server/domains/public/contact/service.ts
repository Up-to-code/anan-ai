import type { CreateContactInquiryInput } from "@/server/contracts/contact";
import { convexContactRepository, type ContactRepository } from "@/server/infrastructure/convex/public/contact";

type ContactServiceDependencies = {
  repository: ContactRepository;
};

const defaultDependencies: ContactServiceDependencies = {
  repository: convexContactRepository,
};

/**
 * WHY:   Public web surfaces need a stable server boundary for capturing inbound partnership/support inquiries.
 * WHAT:  Persists one contact inquiry with optional request metadata for triage and abuse control.
 * HOW:   Delegates persistence to the Convex-backed repository adapter to keep route handlers thin.
 */
export async function createContactInquiry(
  input: CreateContactInquiryInput & { sourceIp?: string; userAgent?: string },
  dependencies: ContactServiceDependencies = defaultDependencies,
) {
  return dependencies.repository.createInquiry(input);
}

