export const PRIVATE_DOCS_PIN = "2004";
export const PRIVATE_DOCS_COOKIE_NAME = "anan_private_docs_access";
const PRIVATE_DOCS_COOKIE_VALUE = "granted";

type ReadCookieStore = {
  get: (name: string) => { value?: string } | undefined;
};

type WriteCookieStore = ReadCookieStore & {
  set: (
    name: string,
    value: string,
    options?: {
      httpOnly?: boolean;
      maxAge?: number;
      path?: string;
      sameSite?: "lax" | "strict" | "none";
      secure?: boolean;
    },
  ) => void;
};

/**
 * WHY:   The private docs app needs one stable rule for deciding whether a request is unlocked.
 * WHAT:  Returns true when the expected access cookie is present.
 * HOW:   Compares the stored cookie value against the fixed internal access marker.
 */
export function hasPrivateDocsAccess(cookieStore: ReadCookieStore) {
  return cookieStore.get(PRIVATE_DOCS_COOKIE_NAME)?.value === PRIVATE_DOCS_COOKIE_VALUE;
}

/**
 * WHY:   Unlocking the private docs should persist across route changes and reloads without exposing the value to client JS.
 * WHAT:  Writes the internal access cookie using safe defaults for this internal-only tool.
 * HOW:   Sets an `HttpOnly` cookie on the app root with a short-lived max age.
 */
export function grantPrivateDocsAccess(cookieStore: WriteCookieStore) {
  cookieStore.set(PRIVATE_DOCS_COOKIE_NAME, PRIVATE_DOCS_COOKIE_VALUE, {
    httpOnly: true,
    maxAge: 60 * 60 * 12,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * WHY:   Redirect targets from the unlock form should never bounce users to external or looping paths.
 * WHAT:  Normalizes the requested post-unlock destination to a safe internal docs route.
 * HOW:   Accepts only local paths and falls back to the overview page for blank or unsafe values.
 */
export function sanitizePrivateDocsReturnTo(returnTo?: string | null, fallback = "/docs/overview") {
  if (!returnTo) {
    return fallback;
  }

  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return fallback;
  }

  if (returnTo === "/" || returnTo.startsWith("/?")) {
    return fallback;
  }

  return returnTo;
}

/**
 * WHY:   Invalid unlock attempts should land back on the same entry screen with enough context to recover.
 * WHAT:  Builds the unlock-page URL including optional error and return-to query parameters.
 * HOW:   Uses `URLSearchParams` so the resulting redirect target is deterministic and easy to test.
 */
export function buildUnlockHref(args: { error?: string | null; returnTo?: string | null } = {}) {
  const params = new URLSearchParams();
  const returnTo = sanitizePrivateDocsReturnTo(args.returnTo ?? null);

  if (args.error) {
    params.set("error", args.error);
  }

  if (args.returnTo) {
    params.set("returnTo", returnTo);
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

/**
 * WHY:   PIN comparison should stay centralized so routes, actions, and tests all use the same rule.
 * WHAT:  Validates the submitted PIN against the internal hardcoded value.
 * HOW:   Trims the submitted string before doing the equality check.
 */
export function isValidPrivateDocsPin(pin?: string | null) {
  return (pin ?? "").trim() === PRIVATE_DOCS_PIN;
}
