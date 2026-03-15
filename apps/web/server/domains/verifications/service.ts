import { requireSessionContext, type ResolvedSession } from "@/server/auth/session";
import { DomainError, normalizeDomainError } from "@/server/contracts/errors";
import {
  verificationRequestInputSchema,
  type VerificationRequestInput,
} from "@/server/contracts/verifications";
import {
  convexVerificationsRepository,
  type VerificationsRepository,
} from "@/server/infrastructure/convex/verificationsRepository";

type VerificationsServiceDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  verificationsRepository: VerificationsRepository;
};

const defaultDependencies: VerificationsServiceDependencies = {
  requireSession: requireSessionContext,
  verificationsRepository: convexVerificationsRepository,
};

/**
 * WHY:   The gateway must validate verification submissions before they reach Convex.
 * WHAT:  Validates payload and creates a verification request for the current org.
 * HOW:   Parses input with Zod, requires auth, then delegates to the repository.
 */
export async function createVerificationRequestForCurrentOrg(
  input: unknown,
  dependencies: VerificationsServiceDependencies = defaultDependencies,
): Promise<{ requestId: string }> {
  const parsed = verificationRequestInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid verification payload",
      status: 400,
    });
  }

  const session = await dependencies.requireSession();

  try {
    return await dependencies.verificationsRepository.createForCurrentOrganization(
      session.token,
      parsed.data as VerificationRequestInput,
    );
  } catch (error) {
    throw normalizeDomainError(error);
  }
}
