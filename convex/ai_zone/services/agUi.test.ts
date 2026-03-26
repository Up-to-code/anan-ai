import { describe, expect, it } from "vitest";
import { resolveWorkspaceAgUiTurn } from "./agUi";

describe("resolveWorkspaceAgUiTurn", () => {
  it("does not fabricate cards when there is no action state or attachment input", () => {
    const turn = resolveWorkspaceAgUiTurn({
      assistantText: "لا توجد بطاقة مطلوبة هنا.",
      ownerType: "broker",
      actionState: null,
    });

    expect(turn).toBeNull();
  });

  it("builds an honest collecting turn from real project action state", () => {
    const turn = resolveWorkspaceAgUiTurn({
      assistantText: "أحتاج السعر والحمامات.",
      ownerType: "broker",
      actionState: {
        type: "create_project",
        fields: {
          name: "مشروع الربوة",
          city: "الرياض",
          district: "الربوة",
        },
        missingFields: ["price", "bathrooms", "description"],
        state: "collecting",
      },
      attachments: [
        {
          key: "storage-1",
          url: "https://example.com/brochure.png",
          name: "brochure.png",
          mime: "image/png",
          size: 1024,
        },
      ],
    });

    expect(turn?.executionState).toBe("collecting");
    expect(turn?.cards.map((card) => card.componentId)).toEqual(
      expect.arrayContaining(["project_create_draft", "field_request_list", "missing_data_prompt", "execution_result"]),
    );
    expect(turn?.draft?.fields.name).toBe("مشروع الربوة");
    expect(turn?.cards.find((card) => card.id === "workspace-attachments-received")?.props).toEqual(
      expect.objectContaining({
        title: "تم استلام المرفقات",
      }),
    );
  });

  it("returns a blocked card instead of pretending user workspaces can create projects", () => {
    const turn = resolveWorkspaceAgUiTurn({
      assistantText: "لن أتمكن من إنشاء المشروع هنا.",
      ownerType: "user",
      actionState: {
        type: "create_project",
        fields: { name: "مشروع غير مسموح" },
        missingFields: [],
        state: "ready",
      },
    });

    expect(turn?.cards.map((card) => card.id)).toContain("workspace-no-project-access");
  });
});
