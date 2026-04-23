import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Browser, BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

export type E2EPersona =
  | "no-org"
  | "broker-onboarding"
  | "developer-onboarding"
  | "broker-manager"
  | "developer-manager"
  | "invitee"
  | "multi-org-manager";

function envNameForPersona(persona: E2EPersona) {
  return `PLAYWRIGHT_${persona.replaceAll("-", "_").toUpperCase()}_STATE`;
}

export function createE2ENamespace(scope: string) {
  return `e2e-playwright-${scope}-${Date.now().toString(36)}`;
}

export function resolveStorageStatePath(persona: E2EPersona) {
  const explicit = process.env[envNameForPersona(persona)]?.trim();
  if (explicit) return explicit;
  return resolve(process.cwd(), `test-results/.auth/${persona}.json`);
}

export function skipIfMissingStorageState(persona: E2EPersona) {
  const path = resolveStorageStatePath(persona);
  test.skip(!existsSync(path), `${persona} storage state is required. Run pnpm --filter web test:e2e:auth.`);
  return path;
}

export async function newPersonaPage(browser: Browser, persona: E2EPersona): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ storageState: skipIfMissingStorageState(persona) });
  const page = await context.newPage();
  return { context, page };
}

export async function expectWorkspaceHealthy(page: Page, route: string) {
  await page.goto(route);
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Active organization required")).toHaveCount(0);
  await expect(page.getByText("Broker profile required")).toHaveCount(0);
  await expect(page.getByText("Developer profile required")).toHaveCount(0);
}
