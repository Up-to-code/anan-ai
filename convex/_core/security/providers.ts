import Google from "@auth/core/providers/google";

/**
 * WHY:   Backend auth provider setup should live in one place, not be duplicated in auth entrypoints.
 * WHAT:  Builds the Google-only Convex Auth provider configuration from environment variables.
 * HOW:   Reads the existing Google OAuth env vars and throws early when required values are missing.
 */
export function getGoogleProvider() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured");
  }

  return Google({
    clientId,
    clientSecret,
  });
}
