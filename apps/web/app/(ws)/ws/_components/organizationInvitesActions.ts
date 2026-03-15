/**
 * WHY:   Invite actions need a shared path that both UI and tests can call consistently.
 * WHAT:  Provides lightweight helpers for accepting or declining incoming organization invites.
 * HOW:   Calls the existing workspace invite endpoints and returns a boolean success flag.
 */

/**
 * WHY:   Accepting invites should use the same endpoint everywhere in the workspace.
 * WHAT:  Posts the invite token to the accept endpoint and returns whether it succeeded.
 * HOW:   Sends JSON payload to `/api/workspace/incoming-invites/accept`.
 */
export async function acceptIncomingInvite(token: string): Promise<boolean> {
  const response = await fetch("/api/workspace/incoming-invites/accept", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  return response.ok;
}

/**
 * WHY:   Declining invites must stay behind the same protected API route as the inbox flow.
 * WHAT:  Sends a delete request to remove an incoming invite.
 * HOW:   Uses the invite id in the DELETE route and returns success status.
 */
export async function declineIncomingInvite(inviteId: string): Promise<boolean> {
  const response = await fetch(`/api/workspace/incoming-invites/${inviteId}`, {
    method: "DELETE",
  });

  return response.ok;
}
