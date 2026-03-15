/**
 * WHY:   Admin OAuth pages should consume stable DTOs from the server layer instead of raw Convex results.
 * WHAT:  Shared OAuth DTOs for consent prompts and approval actions in the admin app.
 * HOW:   Mirrors the web-facing subset of OAuth grant and client records for internal admin use.
 */

export type OAuthScopeDetail = {
  id: string;
  label: string;
  newlyRequested?: boolean;
};

export type OAuthAuthorizationPrompt = {
  flowId: string;
  client: {
    clientId: string;
    name: string;
    publisherName: string;
    logoUrl?: string | null;
    trusted?: boolean;
  };
  user: {
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
  state: string;
  redirectUri: string;
  requestedScopes: OAuthScopeDetail[];
  offlineAccess: boolean;
  requiresConsent: boolean;
  existingAuthorization: {
    grantedScopes: string[];
    createdAt: number;
    updatedAt: number;
    lastUsedAt?: number | null;
  } | null;
};

export type OAuthApprovalResult = {
  redirectUrl: string;
};
