import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const {
  cancelCurrentOrganizationInvite,
  createCurrentOrganizationInvite,
  searchCurrentOrganizationDirectoryExact,
  updateCurrentOrganizationForCurrentUser,
  updateCurrentOrganizationMemberRole,
} = vi.hoisted(() => ({
  cancelCurrentOrganizationInvite: vi.fn(),
  createCurrentOrganizationInvite: vi.fn(),
  searchCurrentOrganizationDirectoryExact: vi.fn(),
  updateCurrentOrganizationForCurrentUser: vi.fn(),
  updateCurrentOrganizationMemberRole: vi.fn(),
}));

const {
  createCurrentOrganizationApiKeyForCurrentUser,
  revokeCurrentOrganizationApiKeyForCurrentUser,
} = vi.hoisted(() => ({
  createCurrentOrganizationApiKeyForCurrentUser: vi.fn(),
  revokeCurrentOrganizationApiKeyForCurrentUser: vi.fn(),
}));

vi.mock("@/server/domains/auth/organizations/service", () => ({
  cancelCurrentOrganizationInvite,
  createCurrentOrganizationInvite,
  searchCurrentOrganizationDirectoryExact,
  updateCurrentOrganizationForCurrentUser,
  updateCurrentOrganizationMemberRole,
}));

vi.mock("@/server/domains/auth/organizationApiKeys/service", () => ({
  createCurrentOrganizationApiKeyForCurrentUser,
  revokeCurrentOrganizationApiKeyForCurrentUser,
}));

import {
  cancelOrganizationInviteAction,
  createOrganizationApiKeyAction,
  createOrganizationInviteAction,
  revokeOrganizationApiKeyAction,
  saveOrganizationSettingsAction,
  searchOrganizationDirectoryAction,
  updateOrganizationMemberRoleAction,
} from "./actions";

beforeEach(() => {
  cancelCurrentOrganizationInvite.mockReset();
  createCurrentOrganizationInvite.mockReset();
  searchCurrentOrganizationDirectoryExact.mockReset();
  updateCurrentOrganizationForCurrentUser.mockReset();
  updateCurrentOrganizationMemberRole.mockReset();
  createCurrentOrganizationApiKeyForCurrentUser.mockReset();
  revokeCurrentOrganizationApiKeyForCurrentUser.mockReset();
});

it("returns the updated organization settings payload on success", async () => {
  updateCurrentOrganizationForCurrentUser.mockResolvedValue({ id: "org-1", name: "Org", slug: "org", type: "broker", status: "active" });

  await expect(saveOrganizationSettingsAction({ name: "Org" })).resolves.toEqual({
    ok: true,
    message: "تم تحديث بيانات المنظمة.",
    organization: { id: "org-1", name: "Org", slug: "org", type: "broker", status: "active" },
  });
});

it("creates an api key through the server action", async () => {
  createCurrentOrganizationApiKeyForCurrentUser.mockResolvedValue({
    apiKey: "anan_123.secret",
    key: { id: "row-1", keyId: "oak_1", name: "Key", prefix: "anan_123", permissions: [], status: "active", createdBy: "auth-1", createdAt: 1 },
  });

  await expect(createOrganizationApiKeyAction({ name: "Key", permissions: [] })).resolves.toEqual({
    ok: true,
    message: "تم إنشاء المفتاح. احفظ القيمة السرية الآن لأنها لن تظهر مرة أخرى.",
    result: {
      apiKey: "anan_123.secret",
      key: { id: "row-1", keyId: "oak_1", name: "Key", prefix: "anan_123", permissions: [], status: "active", createdBy: "auth-1", createdAt: 1 },
    },
  });
});

it("normalizes revoke and member/invite failures", async () => {
  revokeCurrentOrganizationApiKeyForCurrentUser.mockRejectedValue(new DomainError({ code: "FORBIDDEN", message: "Owner role required", status: 403 }));
  updateCurrentOrganizationMemberRole.mockRejectedValue(new DomainError({ code: "FORBIDDEN", message: "Manager role required", status: 403 }));
  cancelCurrentOrganizationInvite.mockRejectedValue(new DomainError({ code: "FORBIDDEN", message: "Manager role required", status: 403 }));

  await expect(revokeOrganizationApiKeyAction("oak_1")).resolves.toEqual({ ok: false, message: "Owner role required" });
  await expect(updateOrganizationMemberRoleAction("membership-1", { role: "manager" })).resolves.toEqual({ ok: false, message: "Manager role required" });
  await expect(cancelOrganizationInviteAction("invite-1")).resolves.toEqual({ ok: false, message: "Manager role required" });
});

it("creates invites and handles invalid invite payloads", async () => {
  createCurrentOrganizationInvite.mockResolvedValue("invite-1");

  await expect(createOrganizationInviteAction({ email: "agent@example.com", role: "member" })).resolves.toEqual({
    ok: true,
    message: "تم إرسال الدعوة بنجاح.",
    inviteId: "invite-1",
  });

  await expect(createOrganizationInviteAction({ email: "", role: "member" })).resolves.toEqual({
    ok: false,
    message: expect.any(String),
  });
});

it("returns empty results for the tenant-org fallback and passes through search results otherwise", async () => {
  searchCurrentOrganizationDirectoryExact.mockResolvedValue([{ id: "user-1", authUserId: "auth-1", email: "agent@example.com", name: "Agent", membershipState: "not-member", canMessage: true }]);
  await expect(searchOrganizationDirectoryAction("agent@example.com")).resolves.toEqual({
    ok: true,
    results: [{ id: "user-1", authUserId: "auth-1", email: "agent@example.com", name: "Agent", membershipState: "not-member", canMessage: true }],
  });

  searchCurrentOrganizationDirectoryExact.mockRejectedValueOnce(
    new DomainError({ code: "FORBIDDEN", message: "Tenant organization required", status: 403 }),
  );
  await expect(searchOrganizationDirectoryAction("agent@example.com")).resolves.toEqual({
    ok: true,
    results: [],
  });
});
