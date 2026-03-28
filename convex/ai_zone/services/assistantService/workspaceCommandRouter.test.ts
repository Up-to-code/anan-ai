import { describe, expect, it, vi } from "vitest";
import { maybeHandleWorkspaceDirectCommand } from "./workspaceCommandRouter";

function createCtx(overrides?: {
  runQuery?: (ref: unknown, args?: unknown) => Promise<unknown>;
  runMutation?: (ref: unknown, args?: unknown) => Promise<unknown>;
}) {
  return {
    runQuery: vi.fn(overrides?.runQuery ?? (async () => [])),
    runMutation: vi.fn(overrides?.runMutation ?? (async () => ({ ok: true }))),
  };
}

describe("maybeHandleWorkspaceDirectCommand", () => {
  it("returns today client list for broker owners", async () => {
    let queryCall = 0;
    const ctx = createCtx({
      runQuery: async () => {
        queryCall += 1;
        if (queryCall === 1) {
          return [
            {
              id: "client_1",
              name: "أحمد علي",
              phone: "01000000000",
              email: "ahmed@example.com",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ];
        }
        return [
          {
            id: "deal_1",
            title: "متابعة العميل أ",
            stage: "contacted",
            contactName: "أحمد علي",
            contactPhone: "01000000000",
            nextFollowUpAt: Date.now(),
            value: 2_500_000,
          },
        ];
      },
    });

    const result = await maybeHandleWorkspaceDirectCommand({
      ctx: ctx as never,
      message: "هات 30 عميل لليوم",
      owner: {
        userId: "user_1",
        ownerType: "broker",
        ownerBrokerId: "broker_1" as never,
      },
    });

    expect(result?.meta).toEqual(
      expect.objectContaining({
        command: "list_clients",
        todayOnly: true,
        count: 1,
      }),
    );
    expect(result?.assistantText).toContain("أحمد علي");
    expect(result?.actionState).toEqual(
      expect.objectContaining({
        type: "list_clients",
        totalCount: 1,
      }),
    );
    expect(result?.uiTurn?.targetZone).toBe("crm");
    expect(ctx.runQuery).toHaveBeenCalledTimes(2);
  });

  it("asks for a project id before deleting", async () => {
    const ctx = createCtx();

    const result = await maybeHandleWorkspaceDirectCommand({
      ctx: ctx as never,
      message: "احذف المشروع",
      owner: {
        userId: "user_1",
        ownerType: "RED",
        ownerREDId: "red_1" as never,
      },
    });

    expect(result?.meta).toEqual(
      expect.objectContaining({
        command: "delete_project",
        requiresProjectId: true,
      }),
    );
    expect(result?.assistantText).toContain("معرف المشروع");
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });

  it("filters projects by search term", async () => {
    const ctx = createCtx({
      runQuery: async () => ({
        page: [
          {
            _id: "project_1",
            title: "مشروع النرجس",
            address: "الرياض - النرجس",
            price: 3_000_000,
            publicationState: "published",
          },
          {
            _id: "project_2",
            title: "مشروع الياسمين",
            address: "الرياض - الياسمين",
            price: 2_000_000,
            publicationState: "draft",
          },
        ],
      }),
    });

    const result = await maybeHandleWorkspaceDirectCommand({
      ctx: ctx as never,
      message: 'ابحث في المشاريع عن "النرجس"',
      owner: {
        userId: "user_1",
        ownerType: "broker",
        ownerBrokerId: "broker_1" as never,
      },
    });

    expect(result?.meta).toEqual(
      expect.objectContaining({
        command: "search_projects",
        count: 1,
        searchTerm: "النرجس",
      }),
    );
    expect(result?.assistantText).toContain("مشروع النرجس");
    expect(result?.assistantText).not.toContain("مشروع الياسمين");
  });

  it("requires confirmation before deleting a project and deletes on explicit confirmation", async () => {
    let queryCall = 0;
    const ctx = createCtx({
      runQuery: async () => {
        queryCall += 1;
        if (queryCall === 1) {
          return {
            _id: "project_1",
            title: "مشروع النرجس",
            address: "الرياض - النرجس",
            price: 3_000_000,
            publicationState: "published",
            brokerId: "broker_1",
          };
        }
        return {
          _id: "project_1",
          title: "مشروع النرجس",
          address: "الرياض - النرجس",
          price: 3_000_000,
          publicationState: "published",
          brokerId: "broker_1",
        };
      },
    });

    const firstResult = await maybeHandleWorkspaceDirectCommand({
      ctx: ctx as never,
      message: "احذف المشروع project_1",
      owner: {
        userId: "user_1",
        ownerType: "broker",
        ownerBrokerId: "broker_1" as never,
      },
    });

    expect(firstResult?.actionState).toEqual(
      expect.objectContaining({
        type: "delete_project_confirmation",
        projectId: "project_1",
        requiresConfirmation: true,
      }),
    );
    expect(ctx.runMutation).not.toHaveBeenCalled();

    const secondResult = await maybeHandleWorkspaceDirectCommand({
      ctx: ctx as never,
      message: "نعم أكد الحذف",
      owner: {
        userId: "user_1",
        ownerType: "broker",
        ownerBrokerId: "broker_1" as never,
      },
      previousActionState: firstResult?.actionState ?? null,
    });

    expect(secondResult?.meta).toEqual(
      expect.objectContaining({
        command: "delete_project_confirmation",
        projectId: "project_1",
        deleted: true,
      }),
    );
    expect(ctx.runMutation).toHaveBeenCalledTimes(1);
  });

  it("blocks workspace commands for regular users", async () => {
    const ctx = createCtx();

    const result = await maybeHandleWorkspaceDirectCommand({
      ctx: ctx as never,
      message: "اعرض مشاريعي",
      owner: {
        userId: "user_1",
        ownerType: "user",
      },
    });

    expect(result?.meta).toEqual(
      expect.objectContaining({
        blocked: true,
        reason: "owner_type_user",
      }),
    );
    expect(result?.assistantText).toContain("الوسطاء والمطورين");
  });
});
