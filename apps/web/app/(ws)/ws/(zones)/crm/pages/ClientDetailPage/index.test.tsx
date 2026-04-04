import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ClientDetailPage from "./index";
import type { CrmClientRecord } from "../../types/crmTypes";

const BASE_CLIENT: CrmClientRecord = {
  id: "client-1",
  personType: "client",
  avatarLabel: "CL",
  name: "Client One",
  stage: "new",
  budgetLabel: "1,000,000",
  preference: "شقة",
  project: null,
  unit: null,
  broker: null,
  notes: "عميل تجريبي",
};

describe("ClientDetailPage", () => {
  it("shows no follow-up label when there is no follow-up timestamp", () => {
    const markup = renderToStaticMarkup(
      <ClientDetailPage
        client={BASE_CLIENT}
        nowTimestamp={1_700_000_000_000}
      />,
    );

    expect(markup).toContain("بدون متابعة");
  });

  it("shows overdue follow-up label when follow-up date is in the past", () => {
    const nowTimestamp = 1_700_000_000_000;
    const markup = renderToStaticMarkup(
      <ClientDetailPage
        client={{ ...BASE_CLIENT, nextFollowUpAt: nowTimestamp - 1 }}
        nowTimestamp={nowTimestamp}
      />,
    );

    expect(markup).toContain("متابعة متأخرة");
  });

  it("shows scheduled follow-up label when follow-up date is in the future", () => {
    const nowTimestamp = 1_700_000_000_000;
    const markup = renderToStaticMarkup(
      <ClientDetailPage
        client={{ ...BASE_CLIENT, nextFollowUpAt: nowTimestamp + 1 }}
        nowTimestamp={nowTimestamp}
      />,
    );

    expect(markup).toContain("موعد مجدول");
  });
});
