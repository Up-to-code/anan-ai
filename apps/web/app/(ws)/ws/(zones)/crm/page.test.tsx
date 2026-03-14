import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({ audience: "broker" })),
}));

const listDeals = vi.fn(async () => [
  {
    id: "deal-1",
    title: "منى الغامدي",
    contactName: "منى الغامدي",
    description: "عميل مهتم",
    stage: "new" as const,
    value: 1800000,
    propertyId: "property-1",
    notes: "لا توجد ملاحظات بعد.",
  },
]);

vi.mock("@/server/ws/zones", () => ({
  getWorkspaceCrmZone: vi.fn(() => ({
    listDeals,
    updateDealStage: vi.fn(async () => undefined),
    createDeal: vi.fn(async () => "deal-2"),
  })),
}));

import WorkspaceCrmRoute from "./page";

describe("/ws/crm page", () => {
  it("renders the real CRM pipeline projection", async () => {
    const element = await WorkspaceCrmRoute();
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("خط الأنابيب");
    expect(markup).toContain("منى الغامدي");
    expect(listDeals).toHaveBeenCalled();
    expect(markup).not.toContain("<select");
  });
});
