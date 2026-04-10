const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Pin React and the native renderer to the mobile workspace so Metro
// doesn't mix the web app's React 19.2.x packages into the Expo bundle.
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-dom": path.resolve(projectRoot, "node_modules/react-dom"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
  "@clerk/expo": path.resolve(projectRoot, "node_modules/@clerk/expo"),
  "expo-auth-session": path.resolve(projectRoot, "node_modules/expo-auth-session"),
  "expo-web-browser": path.resolve(projectRoot, "node_modules/expo-web-browser"),
  "expo-apple-authentication": path.resolve(projectRoot, "node_modules/expo-apple-authentication"),
  "expo-secure-store": path.resolve(projectRoot, "node_modules/expo-secure-store"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
