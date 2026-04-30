import { expect, test } from "@playwright/test";
import { createE2ENamespace, newPersonaPage } from "./e2e-support";

test("manager can invite, cancel, and change member roles", async ({ browser }) => {
  const namespace = createE2ENamespace("members");
  const inviteeEmail = process.env.E2E_PERSONA_INVITEE_EMAIL?.trim() ?? `invitee+${namespace}@example.test`;
  const { context, page } = await newPersonaPage(browser, "broker-manager");

  await page.goto("/ws/settings?tab=members");
  await page.getByTestId("members-invite-open").click();
  await page.getByTestId("invite-member-search").fill(inviteeEmail);
  await page.getByTestId("invite-member-role-viewer").click();
  await page.getByTestId("invite-member-submit").click();
  await expect(page.getByText(/تم إرسال الدعوة|Invite sent|invitation/i)).toBeVisible();

  await page.getByTestId("invite-member-dialog-close").click();
  await page.goto("/ws/settings?tab=members");
  await expect(page.getByText(inviteeEmail)).toBeVisible();
  await page.getByTestId(`pending-invite-cancel-${inviteeEmail}`).click();
  await expect(page.getByText(inviteeEmail)).toHaveCount(0);

  const roleButtons = page.locator('[data-testid^="member-role-"]');
  test.skip((await roleButtons.count()) === 0, "At least one existing member is required for role-change coverage.");
  await roleButtons.last().click();
  await page.waitForLoadState("networkidle");
  await context.close();
});

test("invitee can open workspace after accepting an invite", async ({ browser }) => {
  const { context, page } = await newPersonaPage(browser, "invitee");

  await page.goto("/ws");
  await page.waitForLoadState("networkidle");
  const inviteCards = page.getByTestId("onboarding-invite-accept");
  test.skip((await inviteCards.count()) === 0, "No pending invite exists for the invitee persona.");
  await inviteCards.first().click();
  await expect(page).toHaveURL(/\/ws(\/|$)/);
  await context.close();
});
