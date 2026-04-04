import type { SubmitPublicFormInput } from "@/server/contracts/forms";
import { convexFormsRepository, type FormsRepository } from "@/server/infrastructure/convex/public/forms";

type FormsServiceDependencies = {
  repository: FormsRepository;
};

const defaultDependencies: FormsServiceDependencies = {
  repository: convexFormsRepository,
};

/**
 * WHY:   Public web surfaces need a stable server boundary for collecting marketing forms safely.
 * WHAT:  Persists one public form submission along with request metadata for triage/abuse control.
 * HOW:   Delegates persistence to the Convex-backed repository adapter to keep route handlers thin.
 */
export async function createPublicFormSubmission(
  input: SubmitPublicFormInput & { sourceIp?: string; userAgent?: string },
  dependencies: FormsServiceDependencies = defaultDependencies,
) {
  return dependencies.repository.submit(input);
}

