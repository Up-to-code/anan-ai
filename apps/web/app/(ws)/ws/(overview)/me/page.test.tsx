import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const { requireWorkspaceData } = vi.hoisted(() => ({
  requireWorkspaceData: vi.fn(),
}));
const { getWorkspaceLocaleContext } = vi.hoisted(() => ({
  getWorkspaceLocaleContext: vi.fn(),
}));
const { getCurrentProfileForCurrentUser } = vi.hoisted(() => ({
  getCurrentProfileForCurrentUser: vi.fn(),
}));
const { saveProfileAction } = vi.hoisted(() => ({
  saveProfileAction: vi.fn(),
}));

vi.mock("../../_lib/workspaceData", () => ({
  requireWorkspaceData,
}));

vi.mock("../../_lib/workspaceLocale", () => ({
  getWorkspaceLocaleContext,
}));

vi.mock("@/server/domains/auth/profiles/service", () => ({
  getCurrentProfileForCurrentUser,
}));

vi.mock("./actions", () => ({
  saveProfileAction,
}));

vi.mock("./_components/ProfileWorkspace", () => ({
  default: ({
    initialProfile,
    fallbackName,
    fallbackEmail,
  }: {
    initialProfile: { email?: string; name?: string; username?: string; role?: string };
    fallbackName: string;
    fallbackEmail: string;
  }) => (
    <div>
      {`PROFILE:${initialProfile.email ?? "none"}:${initialProfile.username ?? "none"}:${initialProfile.role ?? "none"}:${fallbackName}:${fallbackEmail}`}
    </div>
  ),
}));

import WorkspaceMePage from "./page";

beforeEach(() => {
  requireWorkspaceData.mockReset();
  getWorkspaceLocaleContext.mockReset();
  getCurrentProfileForCurrentUser.mockReset();
  saveProfileAction.mockReset();

  getWorkspaceLocaleContext.mockResolvedValue({
    dictionary: {
      settings: {
        workspaceLabel: "إعدادات مساحة العمل",
        accountSettingsTitle: "الحساب والأمان",
        accountSettingsDescription: "إدارة بيانات حسابك، اسم المستخدم، والأمان.",
      },
    },
  });
  requireWorkspaceData.mockResolvedValue({
    audience: "broker",
    user: {
      email: "ahmed@example.com",
      name: "Ahmed Mansour",
      isActive: true,
    },
  });
});

it("renders the quieter account header and forwards the resolved profile", async () => {
  getCurrentProfileForCurrentUser.mockResolvedValue({
    email: "profile@example.com",
    name: "Ahmed",
    username: "ensitcod",
    role: "broker",
    authProvider: {
      id: "google",
      passwordManaged: false,
    },
  });

  const markup = renderToStaticMarkup(await WorkspaceMePage());

  expect(markup).toContain("إعدادات مساحة العمل");
  expect(markup).toContain("الحساب والأمان");
  expect(markup).toContain("PROFILE:profile@example.com:ensitcod:broker:Ahmed Mansour:ahmed@example.com");
});

it("builds a fallback profile from workspace data when no saved profile exists", async () => {
  getCurrentProfileForCurrentUser.mockResolvedValue(null);

  const markup = renderToStaticMarkup(await WorkspaceMePage());

  expect(markup).toContain("PROFILE:ahmed@example.com:ahmed:broker:Ahmed Mansour:ahmed@example.com");
});
