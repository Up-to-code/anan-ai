import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const {
  requestProjectPublication,
  archiveProject,
  markEntityAssetsPendingDelete,
  recordProjectAnalyticsEvent,
  refresh,
  redirect,
} = vi.hoisted(() => ({
  requestProjectPublication: vi.fn(async () => ({ ok: true as const })),
  archiveProject: vi.fn(async () => ({ ok: true as const })),
  markEntityAssetsPendingDelete: vi.fn(async () => undefined),
  recordProjectAnalyticsEvent: vi.fn(async () => ({ ok: true as const })),
  refresh: vi.fn(),
  redirect: vi.fn((href: string) => {
    throw new Error(`NEXT_REDIRECT:${href}`);
  }),
}));

vi.mock("next/cache", () => ({ refresh }));
vi.mock("next/navigation", () => ({ redirect }));

vi.mock("../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({
    audience: "broker",
    ownerContext: { ownerType: "broker", ownerId: "broker-1" },
  })),
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspaceProjectZone: vi.fn(() => ({
    requestProjectPublication,
    archiveProject,
  })),
  getWorkspacePropertyZone: vi.fn(() => ({
    recordProjectAnalyticsEvent,
  })),
}));

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(async () => ({
    token: "token",
    context: { userId: "user-1", role: "broker", isActive: true, brokerId: "broker-1" },
    profile: null,
  })),
}));

vi.mock("@/server/infrastructure/convex/organizations/assets", () => ({
  convexOrganizationAssetsRepository: {
    markEntityAssetsPendingDelete,
  },
}));

import { deleteProjectAction } from "./actions/deleteProject";
import { publishProjectAction } from "./actions/publishProject";
import { trackProjectEventAction } from "./actions/trackProjectEvent";

beforeEach(() => {
  requestProjectPublication.mockClear();
  archiveProject.mockClear();
  markEntityAssetsPendingDelete.mockClear();
  recordProjectAnalyticsEvent.mockClear();
  refresh.mockClear();
  redirect.mockClear();
  requestProjectPublication.mockResolvedValue({ ok: true });
  archiveProject.mockResolvedValue({ ok: true });
});

it("returns a stable domain result when publishing is blocked by verification", async () => {
  requestProjectPublication.mockRejectedValue(
    new DomainError({
      code: "VERIFICATION_REQUIRED",
      message: "Organization verification is required before publishing",
      status: 403,
    }),
  );

  await expect(publishProjectAction("property-1")).resolves.toEqual({
    ok: false,
    code: "VERIFICATION_REQUIRED",
    message: "Organization verification is required before publishing",
  });
});

it("runs concrete lifecycle actions by property id", async () => {
  await expect(publishProjectAction("property-1")).resolves.toEqual({ ok: true });
  expect(requestProjectPublication).toHaveBeenCalledWith({ propertyId: "property-1" });
  expect(refresh).toHaveBeenCalled();

  await expect(deleteProjectAction("property-1")).rejects.toThrow("NEXT_REDIRECT:/ws/projects");
  expect(markEntityAssetsPendingDelete).toHaveBeenCalledWith(
    "token",
    expect.objectContaining({
      attachedEntityType: "project",
      attachedEntityId: "property-1",
    }),
  );
  expect(archiveProject).toHaveBeenCalledWith({ propertyId: "property-1" });

  await expect(trackProjectEventAction({
    propertyId: "property-1",
    eventType: "project_detail_view",
    source: "test",
  })).resolves.toEqual({ ok: true });
  expect(recordProjectAnalyticsEvent).toHaveBeenCalledWith({
    id: "property-1",
    eventType: "project_detail_view",
    source: "test",
  });
});
