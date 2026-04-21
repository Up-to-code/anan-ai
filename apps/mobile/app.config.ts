import type { ExpoConfig } from "expo/config";

const appJson = require("./app.json") as { expo: ExpoConfig };

export default {
  ...appJson.expo,
} satisfies ExpoConfig;
