import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { requireWorkspaceData, getAnanProThread, listIncomingOrganizationInvitesForCurrentUser } = vi.hoisted(() => ({
  requireWorkspaceData: vi.fn(),
  getAnanProThread: vi.fn(),
  listIncomingOrganizationInvitesForCurrentUser: vi.fn(),
}));

vi.mock("../_lib/workspaceData", () => ({
  requireWorkspaceData,
}));

vi.mock("@/server/domains/workspace/ananPro/service", () => ({
  getAnanProThread,
}));

vi.mock("@/server/domains/auth/organizations/service", () => ({
  listIncomingOrganizationInvitesForCurrentUser,
}));

vi.mock("./_components/WorkspaceDashboard", () => ({
  default: ({
    initialThread,
    initialRouteState,
  }: {
    initialThread: { id: string } | null;
    initialRouteState: { requestedThreadId: string | null; unavailableThreadId: string | null };
  }) => (
    <div
      data-slot="workspace-dashboard"
      data-thread={initialThread ? "loaded" : "blank"}
      data-requested-thread-id={initialRouteState.requestedThreadId ?? ""}
      data-unavailable-thread-id={initialRouteState.unavailableThreadId ?? ""}
    />
  ),
}));

vi.mock("../_components/OrganizationOnboarding", () => ({
  default: () => <div data-slot="organization-onboarding" />,
}));

import WorkspacePage from "./page";

const baseWorkspacePayload = {
  onboarding: {
    needsOrganization: false,
    suggestedOrganizationType: "broker",
  },
  session: {
    role: "developer",
  },
  user: {
    id: "user-1",
    name: "Ahmed",
    email: "ahmed@example.com",
  },
  audience: "developer",
  primaryOrganization: {
    id: "org-1",
    type: "red",
  },
};

beforeEach(() => {
  requireWorkspaceData.mockReset();
  getAnanProThread.mockReset();
  listIncomingOrganizationInvitesForCurrentUser.mockReset();

  requireWorkspaceData.mockResolvedValue(baseWorkspacePayload);
  listIncomingOrganizationInvitesForCurrentUser.mockResolvedValue([]);
});

it("renders blank draft mode for /ws without creating a thread", async () => {
  const element = await WorkspacePage({ searchParams: Promise.resolve({}) });
  const markup = renderToStaticMarkup(element);

  expect(getAnanProThread).not.toHaveBeenCalled();
  expect(markup).toContain("data-slot=\"workspace-dashboard\"");
  expect(markup).toContain("data-thread=\"blank\"");
  expect(markup).toContain("data-requested-thread-id=\"\"");
  expect(markup).toContain("data-unavailable-thread-id=\"\"");
});

it("ignores a legacy newThread param when no threadId is provided", async () => {
  const element = await WorkspacePage({
    searchParams: Promise.resolve({ newThread: "1" } as never),
  });
  const markup = renderToStaticMarkup(element);

  expect(getAnanProThread).not.toHaveBeenCalled();
  expect(markup).toContain("data-thread=\"blank\"");
  expect(markup).toContain("data-requested-thread-id=\"\"");
  expect(markup).toContain("data-unavailable-thread-id=\"\"");
});

it("loads an existing thread when threadId is valid", async () => {
  getAnanProThread.mockResolvedValue({
    id: "thread-123",
    title: "Saved",
    messages: [],
  });

  const element = await WorkspacePage({
    searchParams: Promise.resolve({ threadId: "thread-123" }),
  });
  const markup = renderToStaticMarkup(element);

  expect(getAnanProThread).toHaveBeenCalledWith("thread-123");
  expect(markup).toContain("data-thread=\"loaded\"");
  expect(markup).toContain("data-requested-thread-id=\"thread-123\"");
  expect(markup).toContain("data-unavailable-thread-id=\"\"");
});

it("renders a recoverable blank state when threadId is invalid", async () => {
  getAnanProThread.mockResolvedValue(null);

  const element = await WorkspacePage({ searchParams: Promise.resolve({ threadId: "missing-thread" }) });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("data-thread=\"blank\"");
  expect(markup).toContain("data-requested-thread-id=\"missing-thread\"");
  expect(markup).toContain("data-unavailable-thread-id=\"missing-thread\"");
});

it("renders retry state when workspace upstream is temporarily unavailable", async () => {
  requireWorkspaceData.mockRejectedValue(
    new DomainError({
      code: "UPSTREAM_UNAVAILABLE",
      message: "تعذر الاتصال بخدمات مساحة العمل حالياً. أعد المحاولة بعد لحظات.",
      status: 503,
    }),
  );

  const element = await WorkspacePage({ searchParams: Promise.resolve({}) });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("تعذر تحميل مساحة العمل الآن");
  expect(markup).toContain("إعادة المحاولة");
  expect(getAnanProThread).not.toHaveBeenCalled();
});
