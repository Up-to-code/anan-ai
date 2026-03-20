import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { redirect, requireWorkspaceData, getAnanProThread, listIncomingOrganizationInvitesForCurrentUser } = vi.hoisted(() => ({
  redirect: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
  requireWorkspaceData: vi.fn(),
  getAnanProThread: vi.fn(),
  listIncomingOrganizationInvitesForCurrentUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("../_lib/workspaceData", () => ({
  requireWorkspaceData,
}));

vi.mock("@/server/domains/ananPro/service", () => ({
  getAnanProThread,
}));

vi.mock("@/server/domains/organizations/service", () => ({
  listIncomingOrganizationInvitesForCurrentUser,
}));

vi.mock("./_components/WorkspaceDashboard", () => ({
  default: ({
    initialThread,
    initialSelectedThreadId,
  }: {
    initialThread: { id: string } | null;
    initialSelectedThreadId: string | null;
  }) => (
    <div
      data-slot="workspace-dashboard"
      data-thread={initialThread ? "loaded" : "blank"}
      data-selected-thread-id={initialSelectedThreadId ?? ""}
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
  redirect.mockClear();
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
  expect(markup).toContain("data-selected-thread-id=\"\"");
});

it("keeps /ws?newThread=1 as a blank draft without creating a thread", async () => {
  const element = await WorkspacePage({
    searchParams: Promise.resolve({ newThread: "1", threadId: "thread-123" }),
  });
  const markup = renderToStaticMarkup(element);

  expect(getAnanProThread).not.toHaveBeenCalled();
  expect(markup).toContain("data-thread=\"blank\"");
  expect(markup).toContain("data-selected-thread-id=\"\"");
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
  expect(markup).toContain("data-selected-thread-id=\"thread-123\"");
});

it("falls back to blank /ws when threadId is invalid", async () => {
  getAnanProThread.mockResolvedValue(null);

  await expect(
    WorkspacePage({ searchParams: Promise.resolve({ threadId: "missing-thread" }) }),
  ).rejects.toThrow("NEXT_REDIRECT:/ws");

  expect(redirect).toHaveBeenCalledWith("/ws");
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
