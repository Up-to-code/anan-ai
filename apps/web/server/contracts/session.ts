/**
 * WHY:   The web gateway needs one stable authenticated-user shape across pages, services, and API routes.
 * WHAT:  SessionContext carries the current user's identity, active state, and resolved organization role links.
 * HOW:   It is assembled in the auth layer from the Convex auth session plus the current profile record.
 */
export type SessionContext = {
  userId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  username?: string | null;
  role?: string;
  brokerId?: string;
  redId?: string;
  isActive: boolean;
};

/**
 * WHY:   UI components need a narrower user shape than the full session context.
 * WHAT:  SessionUser exposes only the fields used by workspace layouts and identity chrome.
 * HOW:   It is derived from SessionContext without any Convex-specific details.
 */
export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
  isActive: boolean;
};

/**
 * WHY:   The UI layer should not rebuild user projections ad hoc in multiple files.
 * WHAT:  Projects a full SessionContext into the narrower SessionUser shape consumed by components.
 * HOW:   Copies the identity fields and remaps `userId` to `id`.
 */
export function toSessionUser(context: SessionContext): SessionUser {
  return {
    id: context.userId,
    name: context.name,
    email: context.email,
    image: context.image,
    username: context.username,
    isActive: context.isActive,
  };
}
