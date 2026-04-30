import { existsSync } from "node:fs";
import { expect, test, type Page, type Response } from "@playwright/test";
import {
  createE2ENamespace,
  newPersonaPage,
  resolveStorageStatePath,
} from "./e2e-support";

function optionalStatePath(...envNames: string[]) {
  for (const envName of envNames) {
    const value = process.env[envName]?.trim();
    if (value) return value;
  }
  return null;
}

function onboardingStatePath(kind: "broker" | "developer") {
  const explicit = optionalStatePath(
    `PLAYWRIGHT_${kind.toUpperCase()}_ONBOARDING_STATE`,
    `PLAYWRIGHT_${kind.toUpperCase()}_BOOTSTRAP_STATE`,
  );
  const path = explicit ?? resolveStorageStatePath(`${kind}-onboarding`);
  test.skip(
    !existsSync(path),
    `${kind} onboarding needs a dedicated no-org storage state. Set PLAYWRIGHT_${kind.toUpperCase()}_ONBOARDING_STATE.`,
  );
  return path;
}

async function expectNoWorkspaceBootstrapFailures(page: Page) {
  await expect(page.getByText("Active organization required")).toHaveCount(0);
  await expect(page.getByText("Broker profile required")).toHaveCount(0);
  await expect(page.getByText("Developer profile required")).toHaveCount(0);
}

async function visitWorkspaceRouteAndAssertHealthy(
  page: Page,
  route: string,
  assertVisible: () => Promise<void>,
) {
  const failures: string[] = [];
  const handleResponse = (response: Response) => {
    if (!response.url().includes("/ws") && !response.url().includes("/api/")) return;
    if (response.status() >= 500) failures.push(`${response.status()} ${response.url()}`);
  };

  page.on("response", handleResponse);
  try {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(failures).toEqual([]);
    await expectNoWorkspaceBootstrapFailures(page);
    await expect(page).toHaveURL(new RegExp(`${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
    await assertVisible();
  } finally {
    page.off("response", handleResponse);
  }
}

async function expectWorkspaceRouteSetHealthy(page: Page) {
  await visitWorkspaceRouteAndAssertHealthy(page, "/ws", async () => {
    await expect(page.getByTestId("workspace-organization-switcher")).toBeVisible();
  });
  await visitWorkspaceRouteAndAssertHealthy(page, "/ws/projects", async () => {
    await expect(page.getByText("المشاريع")).toBeVisible();
  });
  await visitWorkspaceRouteAndAssertHealthy(page, "/ws/settings", async () => {
    await expect(page.getByText("الإعدادات")).toBeVisible();
  });
}

async function createOrganizationThroughOnboarding(page: Page, kind: "broker" | "developer") {
  const namespace = createE2ENamespace(`onboarding-${kind}`);
  await page.goto("/ws?onboarding=required");
  await page.getByTestId("onboarding-create-organization").click();
  await page.getByTestId(kind === "broker" ? "onboarding-org-type-broker" : "onboarding-org-type-developer").click();
  await page.getByTestId("onboarding-organization-name").fill(`${namespace} organization`);
  await page.getByTestId("onboarding-details-submit").click();
  await expect(page.getByTestId("verification-submit")).toBeVisible();
  await page.getByTestId("verification-skip").click();
  await expect(page).toHaveURL(/\/ws(\/|$)/);
  await expectWorkspaceRouteSetHealthy(page);
}

test("broker no-org persona can create a broker organization and reach workspace", async ({ browser }) => {
  const context = await browser.newContext({ storageState: onboardingStatePath("broker") });
  const page = await context.newPage();
  await createOrganizationThroughOnboarding(page, "broker");
  await context.close();
});

test("developer no-org persona can create a developer organization and reach workspace", async ({ browser }) => {
  const context = await browser.newContext({ storageState: onboardingStatePath("developer") });
  const page = await context.newPage();
  await createOrganizationThroughOnboarding(page, "developer");
  await context.close();
});

test("no-org accounts redirect workspace routes back to onboarding instead of crashing", async ({ browser }) => {
  const { context, page } = await newPersonaPage(browser, "no-org");

  for (const route of ["/ws/projects", "/ws/settings"]) {
    await page.goto(route);
    await page.waitForURL(new RegExp(`/ws\\?onboarding=required(&|$)`));
    await expect(page.getByText("رحلة التفعيل")).toBeVisible();
    await expectNoWorkspaceBootstrapFailures(page);
  }

  await context.close();
});

test("multi-org persona can switch organizations and keep workspace routes healthy", async ({ browser }) => {
  const { context, page } = await newPersonaPage(browser, "multi-org-manager");

  await page.goto("/ws");
  await expect(page.getByTestId("workspace-organization-switcher")).toBeVisible();
  const switcherButtons = page.locator('[data-testid^="workspace-org-switch-"]');
  test.skip((await switcherButtons.count()) < 2, "The multi-org persona needs at least two organizations.");
  await switcherButtons.nth(1).click();

  await page.waitForLoadState("networkidle");
  await expectWorkspaceRouteSetHealthy(page);
  await context.close();
});
