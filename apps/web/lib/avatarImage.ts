const BLOCKED_AVATAR_HOST_SUFFIXES = ["googleusercontent.com"] as const;

/**
 * WHY:   Workspace chrome should not depend on third-party avatar hotlinks that can rate-limit aggressively.
 * WHAT:  Normalizes a user avatar URL and drops known unreliable Google-hosted profile-photo URLs.
 * HOW:   Keeps local/data/blob sources, validates absolute URLs, and returns null for blocked hosts.
 */
export function resolveAvatarImageUrl(image?: string | null): string | null {
  const value = image?.trim();
  if (!value) {
    return null;
  }

  if (value.startsWith("/") || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const isBlockedHost = BLOCKED_AVATAR_HOST_SUFFIXES.some(
      (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
    );

    return isBlockedHost ? null : url.toString();
  } catch {
    return null;
  }
}
