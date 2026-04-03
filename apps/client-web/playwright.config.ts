import { defineConfig, devices } from "@playwright/test";

const resolvedBaseUrl = process.env.PLAYWRIGHT_BASE_URL?.trim() || "http://127.0.0.1:3101";
const shouldBootLocalServer = !process.env.PLAYWRIGHT_BASE_URL?.trim();

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  globalSetup: "./tests/global.setup.cjs",
  use: {
    baseURL: resolvedBaseUrl,
    trace: "on-first-retry",
  },
  webServer: shouldBootLocalServer
    ? {
        command: "pnpm exec next dev --webpack --hostname 127.0.0.1 --port 3101",
        url: resolvedBaseUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
