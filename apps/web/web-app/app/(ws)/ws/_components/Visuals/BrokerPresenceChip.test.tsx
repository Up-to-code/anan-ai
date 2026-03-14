import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BrokerPresenceChip from "./BrokerPresenceChip";

describe("BrokerPresenceChip", () => {
  it("renders the broker relationship summary fields", () => {
    const markup = renderToStaticMarkup(
      <BrokerPresenceChip
        broker={{
          id: "broker-sara",
          name: "سارة العتيبي",
          avatarLabel: "س",
          avatarImage: "https://images.unsplash.com/avatar",
          state: "client-linked",
          title: "وسيط استثماري أول",
          city: "الرياض",
          projectTitle: "مالقا ريزيدنس",
          clientName: "محمد الدوسري",
          summary: "تتابع العميل النهائي.",
        }}
      />,
    );

    expect(markup).toContain("سارة العتيبي");
    expect(markup).toContain("عميل: محمد الدوسري");
    expect(markup).toContain("مالقا ريزيدنس");
  });
});
