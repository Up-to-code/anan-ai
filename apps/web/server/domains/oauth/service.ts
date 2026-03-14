import { requireSessionContext, type ResolvedSession } from "@/server/auth/session";
import { normalizeDomainError } from "@/server/contracts/errors";
import type {
  OAuthApprovalResult,
  OAuthAuthorizationPrompt,
  OAuthAuthorizedAppDetail,
  OAuthAuthorizedAppSummary,
} from "@/server/contracts/oauth";
import {
  convexOAuthRepository,
  type OAuthRepository,
} from "@/server/infrastructure/convex/oauthRepository";

type OAuthServiceDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  repository: OAuthRepository;
};

const defaultDependencies: OAuthServiceDependencies = {
  requireSession: requireSessionContext,
  repository: convexOAuthRepository,
};

export async function getAuthorizationPromptForCurrentUser(
  flowId: string,
  dependencies: OAuthServiceDependencies = defaultDependencies,
): Promise<OAuthAuthorizationPrompt> {
  const session = await dependencies.requireSession();
  try {
    return await dependencies.repository.getAuthorizationPrompt(session.token, flowId);
  } catch (error) {
    throw normalizeDomainError(error);
  }
}

export async function approveAuthorizationForCurrentUser(
  flowId: string,
  dependencies: OAuthServiceDependencies = defaultDependencies,
): Promise<OAuthApprovalResult> {
  const session = await dependencies.requireSession();
  try {
    return await dependencies.repository.approveAuthorization(session.token, flowId);
  } catch (error) {
    throw normalizeDomainError(error);
  }
}

export async function listAuthorizedAppsForCurrentUser(
  dependencies: OAuthServiceDependencies = defaultDependencies,
): Promise<OAuthAuthorizedAppSummary[]> {
  const session = await dependencies.requireSession();
  try {
    return await dependencies.repository.listAuthorizedApps(session.token);
  } catch (error) {
    throw normalizeDomainError(error);
  }
}

export async function getAuthorizedAppDetailForCurrentUser(
  clientId: string,
  dependencies: OAuthServiceDependencies = defaultDependencies,
): Promise<OAuthAuthorizedAppDetail | null> {
  const session = await dependencies.requireSession();
  try {
    return await dependencies.repository.getAuthorizedAppDetail(session.token, clientId);
  } catch (error) {
    throw normalizeDomainError(error);
  }
}

export async function revokeAuthorizedAppForCurrentUser(
  clientId: string,
  dependencies: OAuthServiceDependencies = defaultDependencies,
): Promise<void> {
  const session = await dependencies.requireSession();
  try {
    await dependencies.repository.revokeAuthorizedApp(session.token, clientId);
  } catch (error) {
    throw normalizeDomainError(error);
  }
}
