import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import BrokerCard from "./BrokerCard";

it("renders broker name, title, and verified badge", () => {
  const markup = renderToStaticMarkup(
    <BrokerCard
      broker={{
        id: "broker-1",
        name: "سارة العتيبي",
        avatarLabel: "س",
        avatarImage: "https://images.unsplash.com/avatar",
        state: "client-linked",
        title: "وسيط استثماري أول",
        city: "الرياض",
        clientName: "محمد الدوسري",
        badges: ["verified"],
      }}
    />,
  );

  expect(markup).toContain("سارة العتيبي");
  expect(markup).toContain("وسيط استثماري أول");
  expect(markup).toContain("موثق");
  expect(markup).toContain("الرياض");
  expect(markup).toContain("محمد الدوسري");
});

it("renders idle state without client name", () => {
  const markup = renderToStaticMarkup(
    <BrokerCard
      broker={{
        id: "broker-2",
        name: "أحمد علي",
        avatarLabel: "أ",
        avatarImage: "",
        state: "idle",
      }}
    />,
  );

  expect(markup).toContain("أحمد علي");
  expect(markup).toContain("بدون عميل");
  expect(markup).not.toContain("عميل:");
});
