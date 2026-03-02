import { describe, expect, it } from "vitest";
import {
  getRedirectPathByRole,
  isPathAllowedForRole,
} from "./redirectByRole";
import type { UserRole } from "@/_core/hooks/useRole";

describe("getRedirectPathByRole", () => {
  it("returns /admin for admin role", () => {
    expect(getRedirectPathByRole("admin" as UserRole)).toBe("/admin");
  });

  it("returns /dashboard/broker for broker role", () => {
    expect(getRedirectPathByRole("broker" as UserRole)).toBe("/dashboard/broker");
  });

  it("returns /dashboard/red for RED role", () => {
    expect(getRedirectPathByRole("RED" as UserRole)).toBe("/dashboard/red");
  });

  it("returns /dashboard/user for normal role", () => {
    expect(getRedirectPathByRole("normal" as UserRole)).toBe("/dashboard/user");
  });

  it("returns /dashboard for user role", () => {
    expect(getRedirectPathByRole("user" as UserRole)).toBe("/dashboard");
  });

  it("returns /dashboard for undefined role", () => {
    expect(getRedirectPathByRole(undefined)).toBe("/dashboard");
  });
});

describe("isPathAllowedForRole", () => {
  it("returns false when role is undefined", () => {
    expect(isPathAllowedForRole("/admin", undefined)).toBe(false);
    expect(isPathAllowedForRole("/dashboard/broker", undefined)).toBe(false);
    expect(isPathAllowedForRole("/dashboard", undefined)).toBe(false);
  });

  it("allows admin paths for admin role", () => {
    expect(isPathAllowedForRole("/admin", "admin" as UserRole)).toBe(true);
    expect(isPathAllowedForRole("/admin/users", "admin" as UserRole)).toBe(true);
    expect(isPathAllowedForRole("/dashboard/broker", "admin" as UserRole)).toBe(false);
  });

  it("allows broker paths for broker role", () => {
    expect(isPathAllowedForRole("/dashboard/broker", "broker" as UserRole)).toBe(true);
    expect(isPathAllowedForRole("/dashboard/broker/properties", "broker" as UserRole)).toBe(true);
    expect(isPathAllowedForRole("/admin", "broker" as UserRole)).toBe(false);
  });

  it("allows RED paths for RED role", () => {
    expect(isPathAllowedForRole("/dashboard/red", "RED" as UserRole)).toBe(true);
    expect(isPathAllowedForRole("/dashboard/red/properties", "RED" as UserRole)).toBe(true);
    expect(isPathAllowedForRole("/dashboard/broker", "RED" as UserRole)).toBe(false);
  });

  it("allows locale-prefixed broker paths", () => {
    expect(isPathAllowedForRole("/en/dashboard/broker", "broker" as UserRole)).toBe(true);
    expect(isPathAllowedForRole("/fr/dashboard/broker/inbox", "broker" as UserRole)).toBe(true);
  });

  it("allows dashboard paths for user role", () => {
    expect(isPathAllowedForRole("/dashboard", "user" as UserRole)).toBe(true);
    expect(isPathAllowedForRole("/admin", "user" as UserRole)).toBe(false);
    expect(isPathAllowedForRole("/dashboard/broker", "user" as UserRole)).toBe(false);
  });
});
