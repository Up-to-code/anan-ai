import { expect, test } from "@playwright/test";

const storageStatePath = process.env.PLAYWRIGHT_WS_STORAGE_STATE?.trim();
const uploadthingToken = process.env.UPLOADTHING_TOKEN?.trim();

if (storageStatePath) {
  test.use({ storageState: storageStatePath });
}

test("projects create flow uploads media and persists it through save", async ({ page }) => {
  test.skip(!storageStatePath, "PLAYWRIGHT_WS_STORAGE_STATE is required for authenticated /ws projects e2e.");
  test.skip(!uploadthingToken, "UPLOADTHING_TOKEN is required for UploadThing-backed upload e2e.");

  const imagePath = "./public/brand-logo.svg";

  await page.goto("/ws/projects/create");
  await expect(page).toHaveURL(/\/ws\/projects\/create$/);

  await page.locator('input[type="file"][accept="image/*"]').setInputFiles(imagePath);

  await page.getByPlaceholder("أدخل اسماً يميز المشروع...").fill("مشروع اختبار الرفع");
  await page.getByPlaceholder("مثال: 2.1 مليون ر.س").fill("2,500,000");
  await page.getByPlaceholder("الرياض، حطين").fill("الرياض، الياسمين");
  await page.locator('[contenteditable="true"]').first().fill("وصف تجريبي للمشروع المرفوع.");

  await page.getByRole("button", { name: "حفظ المشروع" }).click();
  await page.getByRole("button", { name: "اعتماد ونشر" }).click();

  await expect(page).toHaveURL(/\/ws\/projects\/[^/]+$/);

  await page.getByRole("link", { name: "تعديل المشروع" }).click();
  await expect(page).toHaveURL(/\/ws\/projects\/[^/]+\/edit$/);

  await expect(
    page.locator(
      'img[src*="ufs.sh"], img[src*="utfs.io"], img[src*="uploadthing"], img[src*="convex.cloud"], img[src*="convex.site"]',
    ).first(),
  ).toBeVisible();

  // Best-effort cleanup to avoid piling up test projects in shared dev data.
  await page.getByRole("button", { name: "حذف المشروع" }).first().click();
  await page.getByRole("button", { name: "حذف المشروع" }).last().click();
  await expect(page).toHaveURL(/\/ws\/projects$/);
});
