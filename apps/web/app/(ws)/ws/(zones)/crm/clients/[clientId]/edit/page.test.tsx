import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const {
  listDeals,
  listClients,
  listBrokers,
  updateDeal,
  archiveDeal,
  listProperties,
  getCapturedProps,
  setCapturedProps,
} = vi.hoisted(() => {
  let capturedProps: unknown = null;

  return {
    listDeals: vi.fn(async () => [{
      id: "deal-1",
      createdAt: 1_700_000_000_000,
      title: "منى الغامدي",
      contactName: "منى الغامدي",
      contactPhone: "+966500000000",
      description: "عميل مهتم",
      stage: "contacted" as const,
      relationType: "internal_client" as const,
      crmClientId: "client-1",
      value: 1800000,
      propertyId: "property-1",
      nextFollowUpAt: 1_700_000_000_000,
      notes: "متابعة مهمة",
      client: { id: "client-1", name: "منى الغامدي", phone: "+966500000000" },
      project: {
        id: "property-1",
        title: "مالقا ريزيدنس",
        image: "https://example.com/project.jpg",
        location: "الرياض",
        priceLabel: "1800000 ر.س",
        summary: "نبذة مختصرة",
      },
    }]),
    listClients: vi.fn(async () => [{ id: "client-1", name: "منى الغامدي", phone: "+966500000000" }]),
    listBrokers: vi.fn(async () => [{ id: "broker-1", name: "وسيط الرياض", avatarLabel: "و" }]),
    updateDeal: vi.fn(async () => undefined),
    archiveDeal: vi.fn(async () => undefined),
    listProperties: vi.fn(async () => ({
      page: [{ _id: "property-1", title: "مالقا ريزيدنس", location: "الرياض", address: "الرياض", price: 1800000, description: "وصف", media: [] }],
      isDone: true,
      continueCursor: "",
      pageStatus: "Done",
    })),
    getCapturedProps: () => capturedProps,
    setCapturedProps: (props: unknown) => {
      capturedProps = props;
    },
  };
});

vi.mock("../../../../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({
    audience: "broker",
    ownerContext: { ownerType: "broker", ownerId: "broker-1" },
  })),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspaceCrmZone: vi.fn(() => ({
    listDeals,
    listClients,
    listBrokers,
    updateDeal,
    archiveDeal,
  })),
  getWorkspacePropertyZone: vi.fn(() => ({
    listProperties,
  })),
}));

vi.mock("../../../shared/forms/DealFormScreen", () => ({
  default: (props: unknown) => {
    setCapturedProps(props);
    return <div>DealFormScreenMock</div>;
  },
}));

import WorkspaceCrmClientEditRoute from "./page";

type CapturedDealFormProps = {
  initialData: {
    name: string;
    phone: string;
    budget: string;
    preference: string;
    propertyId: string;
    relationType: "internal_client" | "broker_managed";
    crmClientId: string;
    relatedBrokerId: string;
    stage: "new" | "contacted" | "negotiation" | "won" | "lost";
    notes: string;
  };
  onSubmit: (data: {
    name: string;
    phone: string;
    budget: string;
    preference: string;
    propertyId: string;
    relationType: "internal_client" | "broker_managed";
    crmClientId: string;
    relatedBrokerId: string;
    nextFollowUpAt: string;
    stage: "new" | "contacted" | "negotiation" | "won" | "lost";
    notes: string;
  }) => Promise<{ redirectTo: string }>;
  onArchive: () => Promise<{ redirectTo: string }>;
};

beforeEach(() => {
  listDeals.mockClear();
  updateDeal.mockClear();
  archiveDeal.mockClear();
  listProperties.mockClear();
  listClients.mockClear();
  listBrokers.mockClear();
  setCapturedProps(null);
});

it("loads the edit deal form and wires save + archive actions", async () => {
  const element = await WorkspaceCrmClientEditRoute({ params: Promise.resolve({ clientId: "deal-1" }) });
  const markup = renderToStaticMarkup(element);
  const props = getCapturedProps() as CapturedDealFormProps;

  expect(markup).toContain("DealFormScreenMock");
  expect(props.initialData.name).toBe("منى الغامدي");
  expect(props.initialData.stage).toBe("contacted");
  expect(props.initialData.notes).toBe("متابعة مهمة");
  expect(props.initialData.crmClientId).toBe("client-1");

  await expect(props.onSubmit({
    name: "منى الجديدة",
    phone: "+966511111111",
    budget: "2000000",
    preference: "مهتمة بمشروع جديد",
    propertyId: "property-1",
    relationType: "internal_client",
    crmClientId: "client-1",
    relatedBrokerId: "",
    nextFollowUpAt: "2026-03-30T10:30",
    stage: "negotiation",
    notes: "تم تحديث الملاحظات",
  })).resolves.toEqual({ redirectTo: "/ws/crm/clients/deal-1" });

  expect(updateDeal).toHaveBeenCalledWith(expect.objectContaining({
    dealId: "deal-1",
    title: "منى الجديدة",
    stage: "negotiation",
    notes: "تم تحديث الملاحظات",
  }));

  await expect(props.onArchive()).resolves.toEqual({ redirectTo: "/ws/crm" });
  expect(archiveDeal).toHaveBeenCalledWith({ dealId: "deal-1" });
});
