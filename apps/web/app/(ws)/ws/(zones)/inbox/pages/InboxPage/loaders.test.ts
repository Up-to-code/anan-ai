import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireWorkspaceData } = vi.hoisted(() => ({
  requireWorkspaceData: vi.fn(),
}));

const { listInboxConversations, getInboxConversation } = vi.hoisted(() => ({
  listInboxConversations: vi.fn(),
  getInboxConversation: vi.fn(),
}));

const { listIncomingOrganizationInvitesForCurrentUser } = vi.hoisted(() => ({
  listIncomingOrganizationInvitesForCurrentUser: vi.fn(),
}));

const { getWorkspacePropertyZone, getWorkspaceCrmZone } = vi.hoisted(() => ({
  getWorkspacePropertyZone: vi.fn(),
  getWorkspaceCrmZone: vi.fn(),
}));

vi.mock("../../../../_lib/workspaceData", () => ({
  requireWorkspaceData,
}));

vi.mock("@/server/domains/workspace/inbox/service", () => ({
  listInboxConversations,
  getInboxConversation,
}));

vi.mock("@/server/domains/auth/organizations/service", () => ({
  listIncomingOrganizationInvitesForCurrentUser,
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspacePropertyZone,
  getWorkspaceCrmZone,
}));

import { loadInboxWorkspaceClientProps } from "./loaders";

beforeEach(() => {
  requireWorkspaceData.mockReset();
  listInboxConversations.mockReset();
  getInboxConversation.mockReset();
  listIncomingOrganizationInvitesForCurrentUser.mockReset();
  getWorkspacePropertyZone.mockReset();
  getWorkspaceCrmZone.mockReset();
});

describe("loadInboxWorkspaceClientProps", () => {
  it("loads broker collaboration options from the workspace zones", async () => {
    requireWorkspaceData.mockResolvedValue({
      audience: "broker",
      ownerContext: null,
      primaryOrganization: { id: "org-1", name: "Bridge Org" },
      user: { id: "user-1" },
    });
    listInboxConversations.mockResolvedValue([{ id: "conversation-1" }]);
    getInboxConversation.mockResolvedValue({ id: "conversation-1" });
    listIncomingOrganizationInvitesForCurrentUser.mockResolvedValue([]);
    getWorkspacePropertyZone.mockReturnValue({
      listProperties: vi.fn(async () => ({
        page: [
          {
            _id: "property-1",
            title: "Project One",
            address: "Riyadh",
            publicationState: "draft",
          },
        ],
      })),
    });
    getWorkspaceCrmZone.mockReturnValue({
      listDeals: vi.fn(async () => [
        {
          id: "deal-1",
          title: "Deal One",
          stage: "lead",
        },
      ]),
    });

    const payload = await loadInboxWorkspaceClientProps({
      routeHref: "/ws/inbox",
    });

    expect(getWorkspacePropertyZone).toHaveBeenCalledWith("broker", null);
    expect(getWorkspaceCrmZone).toHaveBeenCalledWith("broker", null);
    expect(payload.projectOptions[0]).toMatchObject({
      id: "property-1",
      organizationName: "Bridge Org",
    });
    expect(payload.dealOptions[0]).toMatchObject({
      id: "deal-1",
    });
  });

  it("skips collaboration options for non-business audiences", async () => {
    requireWorkspaceData.mockResolvedValue({
      audience: "none",
      ownerContext: null,
      primaryOrganization: null,
      user: { id: "user-1" },
    });
    listInboxConversations.mockResolvedValue([]);
    listIncomingOrganizationInvitesForCurrentUser.mockResolvedValue([]);

    const payload = await loadInboxWorkspaceClientProps({
      routeHref: "/ws/inbox",
    });

    expect(getWorkspacePropertyZone).not.toHaveBeenCalled();
    expect(getWorkspaceCrmZone).not.toHaveBeenCalled();
    expect(payload.projectOptions).toEqual([]);
    expect(payload.dealOptions).toEqual([]);
  });
});
