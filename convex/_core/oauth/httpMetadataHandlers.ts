import { httpAction } from "../../_generated/server";
import { getJwks, getOAuthIssuer } from "./jwt";
import { jsonResponse } from "./httpShared";

/**
 * WHY:   OAuth clients need machine-readable metadata for dynamic configuration.
 * WHAT:  Returns OAuth and OpenID discovery metadata for the Anan authorization server.
 * HOW:   Derives all endpoint URLs from the configured issuer to avoid mismatched hostnames.
 */
export const handleMetadata = httpAction(async () => {
  const issuer = getOAuthIssuer();
  return jsonResponse({
    issuer,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/token`,
    userinfo_endpoint: `${issuer}/userinfo`,
    revocation_endpoint: `${issuer}/revoke`,
    jwks_uri: `${issuer}/jwks.json`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    subject_types_supported: ["pairwise"],
    id_token_signing_alg_values_supported: ["RS256"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_basic"],
    scopes_supported: [
      "openid",
      "profile",
      "email",
      "offline_access",
      "clients:read",
      "clients:create",
      "clients:update_own",
      "clients:read_own",
      "properties:read",
      "properties:create_own",
      "properties:update_own",
      "properties:delete_own",
      "properties:read_own",
    ],
    code_challenge_methods_supported: ["S256"],
  });
});

/**
 * WHY:   JWT consumers need a public key set to validate Anan-issued tokens.
 * WHAT:  Returns the configured JWKS document.
 * HOW:   Reads the JSON value from environment through the JWT helper.
 */
export const handleJwks = httpAction(async () => jsonResponse(getJwks()));
