const path = require("node:path");
const { loadEnvConfig } = require("@next/env");
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../../../convex/_generated/api");

const appRoot = path.resolve(__dirname, "..");

function requireConvexUrl() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is required to seed the client-web buyer e2e dataset.");
  }
  return convexUrl;
}

module.exports = async function globalSetup() {
  loadEnvConfig(appRoot);

  const client = new ConvexHttpClient(requireConvexUrl());
  await client.mutation(api.seed.seedArabicDevelopmentEcosystem, {});
};
