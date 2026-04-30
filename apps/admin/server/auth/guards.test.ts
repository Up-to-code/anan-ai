import { expect, it } from "vitest";
import type { ResolvedSession } from "./session";
import { assertAdminSession } from "./guards";

function makeSession(args: { role?: string; isAdmin?: boolean }): ResolvedSession {
  return {
    token: "token",
    profile: null,
    context: {
      userId: "user-1",
      email: "user@example.com",
      name: "User",
      role: args.role,
      isAdmin: args.isAdmin ?? false,
      isActive: true,
    },
  };
}

it("allows authenticated admins", () => {
  expect(assertAdminSession(makeSession({ role: "user", isAdmin: true })).context.isAdmin).toBe(true);
});

it("rejects authenticated non-admin users", () => {
  expect(() => assertAdminSession(makeSession({ role: "broker" }))).toThrow("Admin role required");
});
