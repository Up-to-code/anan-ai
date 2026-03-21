import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirect, analyticsPageSpy } = vi.hoisted(() => ({
  redirect: vi.fn((target: string) => {
    throw new Error(`NEXT_REDIRECT:${target}`);
  }),
  analyticsPageSpy: vi.fn(({ tab, range }: { tab: string; range: string }) => (
    <div data-testid="analytics-page" data-tab={tab} data-range={range} />
  )),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/admin_zone/pages/AnalyticsPage", () => ({
  default: analyticsPageSpy,
}));

import AnalyticsIndexRoute from "./page";
import AnalyticsActiveRoute from "./active-30d/page";
import AnalyticsBrokersRoute from "./brokers/page";
import AnalyticsCollaborationRoute from "./collaboration/page";
import AnalyticsCommercialRoute from "./commercial/page";
import AnalyticsConnectionsRoute from "./connections/page";
import AnalyticsDevelopersRoute from "./developers/page";
import AnalyticsEngagementRoute from "./engagement/page";
import AnalyticsExecutiveRoute from "./executive/page";
import AnalyticsInventoryRoute from "./inventory/page";
import AnalyticsMessagesRoute from "./messages/page";
import AnalyticsOffersRoute from "./offers/page";
import AnalyticsPartnersRoute from "./partners/page";
import AnalyticsPropertiesRoute from "./properties/page";

describe("analytics app routes", () => {
  beforeEach(() => {
    redirect.mockClear();
    analyticsPageSpy.mockClear();
  });

  it("redirects the analytics index to the executive route", () => {
    expect(() => AnalyticsIndexRoute()).toThrow("NEXT_REDIRECT:/analytics/executive");
  });

  it.each([
    ["executive", AnalyticsExecutiveRoute, "30d", "30d"],
    ["engagement", AnalyticsEngagementRoute, "90d", "90d"],
    ["commercial", AnalyticsCommercialRoute, "invalid", "90d"],
    ["partners", AnalyticsPartnersRoute, "30d", "30d"],
    ["inventory", AnalyticsInventoryRoute, undefined, "90d"],
    ["collaboration", AnalyticsCollaborationRoute, "30d", "30d"],
  ] as const)("renders the %s analytics route with a normalized range", async (_label, Route, inputRange, expectedRange) => {
    const html = renderToStaticMarkup(
      await Route({
        searchParams: Promise.resolve(inputRange ? { range: inputRange as "30d" | "90d" } : {}),
      }),
    );

    expect(html).toContain('data-testid="analytics-page"');
    expect(html).toContain(`data-range="${expectedRange}"`);
    expect(html).toContain(`data-tab="${_label}"`);
  });

  it.each([
    ["messages", AnalyticsMessagesRoute, "/analytics/engagement"],
    ["active-30d", AnalyticsActiveRoute, "/analytics/engagement"],
    ["offers", AnalyticsOffersRoute, "/analytics/commercial"],
    ["brokers", AnalyticsBrokersRoute, "/analytics/partners"],
    ["developers", AnalyticsDevelopersRoute, "/analytics/partners"],
    ["properties", AnalyticsPropertiesRoute, "/analytics/inventory"],
    ["connections", AnalyticsConnectionsRoute, "/analytics/collaboration"],
  ] as const)("redirects the legacy %s route to the grouped destination", (_label, Route, target) => {
    expect(() => Route()).toThrow(`NEXT_REDIRECT:${target}`);
  });
});
