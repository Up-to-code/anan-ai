import { expect, it, describe } from "vitest";
import { buildOrdersSection, buildDealsSection } from "./getOrganizationDetail.response";

describe("buildOrdersSection", () => {
  it("counts orders by status in single pass", () => {
    const orders = [
      { _id: "1", status: "new_lead", type: "property", sourceChannel: "web", _creationTime: 1000 },
      { _id: "2", status: "contacted", type: "property", sourceChannel: "web", _creationTime: 2000 },
      { _id: "3", status: "new_lead", type: "property", sourceChannel: "web", _creationTime: 3000 },
      { _id: "4", status: "qualified", type: "property", sourceChannel: "web", _creationTime: 4000 },
      { _id: "5", status: "closed_won", type: "property", sourceChannel: "web", _creationTime: 5000 },
      { _id: "6", status: "closed_lost", type: "property", sourceChannel: "web", _creationTime: 6000 },
    ];

    const result = buildOrdersSection(orders);

    expect(result.count).toBe(6);
    expect(result.statusBreakdown.new_lead).toBe(2);
    expect(result.statusBreakdown.contacted).toBe(1);
    expect(result.statusBreakdown.qualified).toBe(1);
    expect(result.statusBreakdown.offer_made).toBe(0);
    expect(result.statusBreakdown.under_contract).toBe(0);
    expect(result.statusBreakdown.closed_won).toBe(1);
    expect(result.statusBreakdown.closed_lost).toBe(1);
  });

  it("handles empty orders", () => {
    const result = buildOrdersSection([]);

    expect(result.count).toBe(0);
    expect(result.statusBreakdown.new_lead).toBe(0);
    expect(result.statusBreakdown.contacted).toBe(0);
    expect(result.statusBreakdown.qualified).toBe(0);
  });

  it("handles orders with missing status", () => {
    const orders = [
      { _id: "1", type: "property", sourceChannel: "web", _creationTime: 1000 },
      { _id: "2", status: "new_lead", type: "property", sourceChannel: "web", _creationTime: 2000 },
    ];

    const result = buildOrdersSection(orders);

    expect(result.count).toBe(2);
    expect(result.statusBreakdown.new_lead).toBe(1);
  });
});

describe("buildDealsSection", () => {
  it("counts deals by stage in single pass", () => {
    const deals = [
      { _id: "1", stage: "new", title: "Deal 1", _creationTime: 1000 },
      { _id: "2", stage: "contacted", title: "Deal 2", _creationTime: 2000 },
      { _id: "3", stage: "new", title: "Deal 3", _creationTime: 3000 },
      { _id: "4", stage: "negotiation", title: "Deal 4", _creationTime: 4000 },
      { _id: "5", stage: "won", title: "Deal 5", _creationTime: 5000 },
      { _id: "6", stage: "lost", title: "Deal 6", _creationTime: 6000 },
    ];

    const result = buildDealsSection(deals);

    expect(result.count).toBe(6);
    expect(result.stageBreakdown.new).toBe(2);
    expect(result.stageBreakdown.contacted).toBe(1);
    expect(result.stageBreakdown.negotiation).toBe(1);
    expect(result.stageBreakdown.won).toBe(1);
    expect(result.stageBreakdown.lost).toBe(1);
  });

  it("handles empty deals", () => {
    const result = buildDealsSection([]);

    expect(result.count).toBe(0);
    expect(result.stageBreakdown.new).toBe(0);
    expect(result.stageBreakdown.contacted).toBe(0);
    expect(result.stageBreakdown.negotiation).toBe(0);
    expect(result.stageBreakdown.won).toBe(0);
    expect(result.stageBreakdown.lost).toBe(0);
  });
});